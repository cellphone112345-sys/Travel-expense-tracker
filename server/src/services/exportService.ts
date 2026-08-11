import PDFDocument from "pdfkit";
import type { Response } from "express";
import path from "path";
import { prisma } from "../lib/prismaClient";
import { HttpError } from "../middleware/errorHandler";
import { getTripOrThrow } from "./tripService";
import { toIsoDateOnly } from "../utils/dateUtils";
import { formatMoney, toMajorUnits } from "../utils/currencyMath";

// Noto Sans TC so Chinese trip names, categories, and descriptions render correctly
// (pdfkit's built-in fonts only cover WinAnsi and have no CJK glyphs).
const CJK_FONT_PATH = path.join(__dirname, "..", "..", "assets", "fonts", "NotoSansTC-VF.ttf");

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers: string[], rows: Array<Array<string | number>>): string {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(","));
  }
  return lines.join("\r\n");
}

async function loadExpensesForExport(userId: string, tripId: string) {
  const trip = await getTripOrThrow(userId, tripId);
  const expenses = await prisma.expense.findMany({
    where: { tripId },
    include: { category: true },
    orderBy: { date: "asc" },
  });
  return { trip, expenses };
}

export async function exportTripCsv(userId: string, tripId: string): Promise<{ filename: string; csv: string }> {
  const { trip, expenses } = await loadExpensesForExport(userId, tripId);

  const headers = [
    "Date",
    "Category",
    "Description",
    "Merchant",
    "Payment Method",
    "Amount",
    "Currency",
    `Amount (${trip.homeCurrency})`,
    "Notes",
  ];
  const rows = expenses.map((e) => [
    toIsoDateOnly(e.date),
    e.category.name,
    e.description,
    e.merchant ?? "",
    e.paymentMethod,
    toMajorUnits(e.amountMinor, e.currency),
    e.currency,
    toMajorUnits(e.amountInHomeCurrencyMinor, trip.homeCurrency),
    e.notes ?? "",
  ]);

  return { filename: `${trip.name}-expenses.csv`, csv: toCsv(headers, rows) };
}

export async function exportTripPdf(userId: string, tripId: string, res: Response): Promise<void> {
  const { trip, expenses } = await loadExpensesForExport(userId, tripId);
  if (!trip) throw new HttpError(404, "TRIP_NOT_FOUND");

  const totalHomeMinor = expenses.reduce((sum, e) => sum + e.amountInHomeCurrencyMinor, 0);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(trip.name)}-expenses.pdf"`
  );

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.registerFont("cjk", CJK_FONT_PATH);
  doc.font("cjk");
  doc.pipe(res);

  doc.fontSize(18).text(trip.name, { align: "left" });
  doc
    .fontSize(10)
    .fillColor("#666")
    .text(`${toIsoDateOnly(trip.startDate)} ~ ${toIsoDateOnly(trip.endDate)}`)
    .moveDown(0.5);
  doc
    .fontSize(12)
    .fillColor("#111")
    .text(`總花費：${formatMoney(totalHomeMinor, trip.homeCurrency)} ${trip.homeCurrency}（共 ${expenses.length} 筆）`)
    .moveDown(1);

  const colX = { date: 40, category: 100, desc: 170, amount: 400, home: 470 };
  doc.fontSize(9).fillColor("#333");
  doc.text("日期", colX.date, doc.y, { continued: false });
  doc.text("分類", colX.category, doc.y - 11);
  doc.text("說明", colX.desc, doc.y - 11);
  doc.text("金額", colX.amount, doc.y - 11);
  doc.text(`${trip.homeCurrency}`, colX.home, doc.y - 11);
  doc.moveTo(40, doc.y + 3).lineTo(555, doc.y + 3).strokeColor("#ddd").stroke();
  doc.moveDown(0.5);

  for (const e of expenses) {
    const y = doc.y;
    if (y > 760) {
      doc.addPage();
    }
    const rowY = doc.y;
    doc.fontSize(9).fillColor("#111");
    doc.text(toIsoDateOnly(e.date), colX.date, rowY, { width: 55 });
    doc.text(e.category.name, colX.category, rowY, { width: 65 });
    doc.text(e.description, colX.desc, rowY, { width: 220 });
    doc.text(`${toMajorUnits(e.amountMinor, e.currency)} ${e.currency}`, colX.amount, rowY, { width: 65 });
    doc.text(`${toMajorUnits(e.amountInHomeCurrencyMinor, trip.homeCurrency)}`, colX.home, rowY, { width: 65 });
    doc.moveDown(0.6);
  }

  doc.end();
}

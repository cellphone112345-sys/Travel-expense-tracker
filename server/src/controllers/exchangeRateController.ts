import { Request, Response } from "express";
import { z } from "zod";
import { getRatesTableSmart, getRate, getHistory } from "../services/exchangeRateService";
import { todayIsoDate } from "../utils/dateUtils";
import { HttpError } from "../middleware/errorHandler";

const latestSchema = z.object({
  base: z.string().length(3),
  symbols: z.string().optional(),
});

const convertSchema = z.object({
  amount: z.coerce.number().positive(),
  from: z.string().length(3),
  to: z.string().length(3),
  date: z.string().optional(),
});

const historySchema = z.object({
  base: z.string().length(3),
  target: z.string().length(3),
  start: z.string(),
  end: z.string(),
});

export async function latest(req: Request, res: Response) {
  const { base, symbols } = latestSchema.parse(req.query);
  const table = await getRatesTableSmart(todayIsoDate(), base.toUpperCase());
  if (symbols) {
    const wanted = symbols.split(",").map((s) => s.trim().toUpperCase());
    const filtered = Object.fromEntries(
      Object.entries(table).filter(([code]) => wanted.includes(code))
    );
    return res.json({ base: base.toUpperCase(), date: todayIsoDate(), rates: filtered });
  }
  res.json({ base: base.toUpperCase(), date: todayIsoDate(), rates: table });
}

export async function convert(req: Request, res: Response) {
  const { amount, from, to, date } = convertSchema.parse(req.query);
  const rate = await getRate(from, to, date);
  res.json({ amount, from: from.toUpperCase(), to: to.toUpperCase(), rate, result: amount * rate });
}

export async function history(req: Request, res: Response) {
  const { base, target, start, end } = historySchema.parse(req.query);
  if (start > end) {
    throw new HttpError(400, "INVALID_DATE_RANGE");
  }
  try {
    const points = await getHistory(base.toUpperCase(), target.toUpperCase(), start, end);
    res.json({ base: base.toUpperCase(), target: target.toUpperCase(), points, available: true });
  } catch (err) {
    if (err instanceof Error && err.message === "HISTORY_UNSUPPORTED_CURRENCY") {
      return res.json({ base: base.toUpperCase(), target: target.toUpperCase(), points: [], available: false });
    }
    throw err;
  }
}

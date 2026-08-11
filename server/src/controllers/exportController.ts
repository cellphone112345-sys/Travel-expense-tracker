import { Request, Response } from "express";
import { exportTripCsv, exportTripPdf } from "../services/exportService";

export async function csv(req: Request, res: Response) {
  const { filename, csv } = await exportTripCsv(req.userId!, req.params.tripId);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
  res.send(csv);
}

export async function pdf(req: Request, res: Response) {
  await exportTripPdf(req.userId!, req.params.tripId, res);
}

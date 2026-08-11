import { Request, Response } from "express";
import { z } from "zod";
import {
  listTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripOrThrow,
  getTripSummary,
  getBudgetStatus,
  compareTrips,
} from "../services/tripService";
import { HttpError } from "../middleware/errorHandler";

const tripSchema = z.object({
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  baseCurrency: z.string().length(3),
  homeCurrency: z.string().length(3),
  totalBudget: z.number().int().nonnegative().nullable().optional(),
  dailyBudget: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const tripUpdateSchema = tripSchema.partial();

export async function list(req: Request, res: Response) {
  const trips = await listTrips(req.userId!);
  res.json({ trips });
}

export async function create(req: Request, res: Response) {
  const data = tripSchema.parse(req.body);
  const trip = await createTrip(req.userId!, data);
  res.status(201).json({ trip });
}

export async function get(req: Request, res: Response) {
  const trip = await getTripOrThrow(req.userId!, req.params.tripId);
  res.json({ trip });
}

export async function update(req: Request, res: Response) {
  const data = tripUpdateSchema.parse(req.body);
  const trip = await updateTrip(req.userId!, req.params.tripId, data);
  res.json({ trip });
}

export async function remove(req: Request, res: Response) {
  await deleteTrip(req.userId!, req.params.tripId);
  res.status(204).send();
}

export async function summary(req: Request, res: Response) {
  const data = await getTripSummary(req.userId!, req.params.tripId);
  res.json(data);
}

export async function budgetStatus(req: Request, res: Response) {
  const data = await getBudgetStatus(req.userId!, req.params.tripId);
  res.json(data);
}

export async function compare(req: Request, res: Response) {
  const idsParam = req.query.ids;
  if (typeof idsParam !== "string" || idsParam.length === 0) {
    throw new HttpError(400, "MISSING_IDS");
  }
  const ids = idsParam.split(",").map((s) => s.trim());
  const results = await compareTrips(req.userId!, ids);
  res.json({ trips: results });
}

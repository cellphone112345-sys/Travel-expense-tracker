import { Request, Response } from "express";
import { z } from "zod";
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseOrThrow,
} from "../services/expenseService";

const expenseSchema = z.object({
  categoryId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().min(1),
  date: z.string(),
  merchant: z.string().nullable().optional(),
  paymentMethod: z.enum(["CASH", "CARD", "OTHER"]).optional(),
  notes: z.string().nullable().optional(),
});

const expenseUpdateSchema = expenseSchema.partial();

export async function list(req: Request, res: Response) {
  const { category, dateFrom, dateTo, search } = req.query as Record<string, string | undefined>;
  const expenses = await listExpenses(req.userId!, req.params.tripId, {
    categoryId: category,
    dateFrom,
    dateTo,
    search,
  });
  res.json({ expenses });
}

export async function create(req: Request, res: Response) {
  const data = expenseSchema.parse(req.body);
  const expense = await createExpense(req.userId!, req.params.tripId, data);
  res.status(201).json({ expense });
}

export async function get(req: Request, res: Response) {
  const expense = await getExpenseOrThrow(req.userId!, req.params.id);
  res.json({ expense });
}

export async function update(req: Request, res: Response) {
  const data = expenseUpdateSchema.parse(req.body);
  const expense = await updateExpense(req.userId!, req.params.id, data);
  res.json({ expense });
}

export async function remove(req: Request, res: Response) {
  await deleteExpense(req.userId!, req.params.id);
  res.status(204).send();
}

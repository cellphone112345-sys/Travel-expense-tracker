import { Request, Response } from "express";
import { z } from "zod";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

const categorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
});

const categoryUpdateSchema = categorySchema.partial();

export async function list(req: Request, res: Response) {
  const categories = await listCategories(req.userId!);
  res.json({ categories });
}

export async function create(req: Request, res: Response) {
  const data = categorySchema.parse(req.body);
  const category = await createCategory(req.userId!, data);
  res.status(201).json({ category });
}

export async function update(req: Request, res: Response) {
  const data = categoryUpdateSchema.parse(req.body);
  const category = await updateCategory(req.userId!, req.params.id, data);
  res.json({ category });
}

export async function remove(req: Request, res: Response) {
  await deleteCategory(req.userId!, req.params.id);
  res.status(204).send();
}

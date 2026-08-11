import { prisma } from "../lib/prismaClient";
import { HttpError } from "../middleware/errorHandler";

export function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
}

export function createCategory(userId: string, data: { name: string; icon?: string; color?: string }) {
  return prisma.category.create({
    data: { ...data, userId, isDefault: false },
  });
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  data: { name?: string; icon?: string; color?: string }
) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.userId !== userId) {
    throw new HttpError(404, "CATEGORY_NOT_FOUND");
  }
  return prisma.category.update({ where: { id: categoryId }, data });
}

export async function deleteCategory(userId: string, categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.userId !== userId) {
    throw new HttpError(404, "CATEGORY_NOT_FOUND");
  }
  const expenseCount = await prisma.expense.count({ where: { categoryId } });
  if (expenseCount > 0) {
    throw new HttpError(409, "CATEGORY_IN_USE");
  }
  await prisma.category.delete({ where: { id: categoryId } });
}

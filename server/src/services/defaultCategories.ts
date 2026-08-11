import { prisma } from "../lib/prismaClient";

export const DEFAULT_CATEGORIES = [
  { name: "飲食", icon: "utensils", color: "#f97316" },
  { name: "交通", icon: "bus", color: "#3b82f6" },
  { name: "住宿", icon: "bed", color: "#8b5cf6" },
  { name: "購物", icon: "shopping-bag", color: "#ec4899" },
  { name: "活動", icon: "ticket", color: "#10b981" },
  { name: "其他", icon: "dots", color: "#6b7280" },
];

/** Idempotent: safe to call on every server boot, not just once at setup. */
export async function ensureDefaultCategories(): Promise<void> {
  for (const category of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, name: category.name },
    });
    if (!existing) {
      await prisma.category.create({ data: { ...category, isDefault: true } });
    }
  }
}

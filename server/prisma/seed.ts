import { prisma } from "../src/lib/prismaClient";
import { ensureDefaultCategories } from "../src/services/defaultCategories";

ensureDefaultCategories()
  .then(() => console.log("Seeded default categories."))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

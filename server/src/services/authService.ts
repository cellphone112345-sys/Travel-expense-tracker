import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prismaClient";
import { env } from "../config/env";

// Global default categories (userId: null) are seeded once via prisma/seed.ts
// and are visible to every user (see categoryService.listCategories).
export async function registerUser(email: string, password: string, name?: string, homeCurrency = "USD") {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, homeCurrency },
  });
  return user;
}

export async function verifyUserCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwtSecret) as { sub: string };
}

export function toPublicUser(user: { id: string; email: string; name: string | null; homeCurrency: string }) {
  return { id: user.id, email: user.email, name: user.name, homeCurrency: user.homeCurrency };
}

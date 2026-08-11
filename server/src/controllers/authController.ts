import { Request, Response } from "express";
import { z } from "zod";
import { registerUser, verifyUserCredentials, signToken, toPublicUser } from "../services/authService";
import { prisma } from "../lib/prismaClient";
import { HttpError } from "../middleware/errorHandler";
import { env } from "../config/env";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  homeCurrency: z.string().length(3).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.isProduction,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  try {
    const user = await registerUser(data.email, data.password, data.name, data.homeCurrency);
    const token = signToken(user.id);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      throw new HttpError(409, "EMAIL_TAKEN");
    }
    throw err;
  }
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await verifyUserCredentials(data.email, data.password);
  if (!user) {
    throw new HttpError(401, "INVALID_CREDENTIALS");
  }
  const token = signToken(user.id);
  res.cookie("token", token, COOKIE_OPTIONS);
  res.json({ user: toPublicUser(user) });
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: env.isProduction });
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) {
    throw new HttpError(404, "USER_NOT_FOUND");
  }
  res.json({ user: toPublicUser(user) });
}

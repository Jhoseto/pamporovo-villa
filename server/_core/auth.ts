import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { ADMIN_COOKIE_NAME } from "@shared/const";
import type { AdminUser } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { getCookieValue } from "./cookies";

const SALT_ROUNDS = 10;

export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Паролата трябва да е поне 6 символа";
  const digitCount = (password.match(/\d/g) ?? []).length;
  if (digitCount < 2) return "Паролата трябва да съдържа поне 2 цифри";
  return null;
}

export function validateUsername(username: string): string | null {
  if (username.length < 3) return "Потребителското име трябва да е поне 3 символа";
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return "Невалидни символи в потребителското име";
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function getJwtSecret() {
  const secret = ENV.jwtSecret;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(user: AdminUser): Promise<string> {
  return new SignJWT({
    sub: String(user.id),
    type: "admin",
    tv: user.tokenVersion ?? 0,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyAdminSessionToken(
  token: string
): Promise<{ userId: number; tokenVersion: number } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.type !== "admin" || typeof payload.sub !== "string") return null;
    const id = parseInt(payload.sub, 10);
    if (!Number.isFinite(id)) return null;
    const tokenVersion = typeof payload.tv === "number" ? payload.tv : 0;
    return { userId: id, tokenVersion };
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(req: {
  headers: { cookie?: string };
}): Promise<AdminUser | null> {
  const token = getCookieValue(req as import("express").Request, ADMIN_COOKIE_NAME);
  if (!token) return null;
  const session = await verifyAdminSessionToken(token);
  if (!session) return null;
  try {
    const user = await db.getAdminUserById(session.userId);
    if (!user || (user.tokenVersion ?? 0) !== session.tokenVersion) return null;
    return user;
  } catch {
    // DB unavailable — treat as unauthenticated instead of throwing 500
    return null;
  }
}

export type SafeAdminUser = Pick<AdminUser, "id" | "username" | "isMaster" | "createdAt">;

export function toSafeAdmin(user: AdminUser): SafeAdminUser {
  return {
    id: user.id,
    username: user.username,
    isMaster: user.isMaster,
    createdAt: user.createdAt,
  };
}

import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { ADMIN_SESSION_MS } from "@shared/const";
import { ENV } from "./env";

export function getSessionCookieOptions(req: Request) {
  const isSecure =
    ENV.isProduction ||
    req.protocol === "https" ||
    req.headers["x-forwarded-proto"] === "https";

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_SESSION_MS,
  };
}

export function getCookieValue(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  const parsed = parseCookieHeader(header);
  return parsed[name];
}

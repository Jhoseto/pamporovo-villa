import type { Express, RequestHandler } from "express";

const SECURITY_HEADERS: RequestHandler = (_req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  next();
};

/** Phase 1 security headers — no CSP (phase 2). */
export function applySecurityHeaders(app: Express) {
  app.use(SECURITY_HEADERS);
}

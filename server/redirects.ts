import type { Express, Request, Response, NextFunction } from "express";
import { LEGACY_REDIRECTS } from "../shared/seoConstants";
import { normalizePathname } from "./seoMeta";

function redirectTarget(req: Request, target: string): string {
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  return `${target}${query}`;
}

export function registerLegacyRedirects(app: Express): void {
  const redirectMap = new Map<string, string>();
  for (const { from, to } of LEGACY_REDIRECTS) {
    redirectMap.set(from, to);
    redirectMap.set(encodeURI(from), to);
  }

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    const pathname = normalizePathname(req.path);
    const target = redirectMap.get(pathname) ?? redirectMap.get(req.path);
    if (!target) return next();

    res.redirect(301, redirectTarget(req, target));
  });
}

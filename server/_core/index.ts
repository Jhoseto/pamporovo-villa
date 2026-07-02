import express from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { notificationSoundsDir } from "../notificationSoundStorage";
import { createContext } from "./context";
import { distPublicPath } from "./paths";
import { runSeedIfNeeded } from "../seed";
import { validateEnv } from "./env";
import { serveStatic } from "./static";
import { registerLegacyRedirects } from "../redirects";
import { registerFactsRoute } from "../facts";
import { registerSitemapRoute } from "../sitemap";
import { initReviewSchemaCache } from "../seoReviewsCache";

async function startServer() {
  validateEnv();
  await runSeedIfNeeded();
  initReviewSchemaCache();

  const app = express();
  const server = createServer(app);
  if (process.env.TRUST_PROXY === "1" || process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "pamporovo-villa" });
  });

  registerFactsRoute(app);
  registerSitemapRoute(app);
  registerLegacyRedirects(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // PWA: manifest + service worker scope is "/admin/" (with trailing slash).
  // A document loaded at "/admin" is OUTSIDE that scope, so Chrome refuses to
  // install it as an app ("Add to home screen" creates a plain shortcut).
  // Canonicalize before the SPA catch-all serves index.html.
  app.get("/admin", (req, res, next) => {
    // Non-strict routing also matches "/admin/" — only redirect the bare path.
    if (req.path !== "/admin") return next();
    const query = req.originalUrl.slice(req.path.length);
    res.redirect(301, `/admin/${query}`);
  });

  app.get("/admin/notification-sound/:filename", async (req, res) => {
    const filename = req.params.filename ?? "";
    if (!/^[\w-]+\.(wav|mp3|ogg|webm|m4a)$/i.test(filename)) {
      res.status(400).end();
      return;
    }
    const filePath = path.join(notificationSoundsDir(), filename);
    try {
      await fs.promises.access(filePath);
      res.sendFile(filePath);
    } catch {
      res.status(404).end();
    }
  });

  const publicPath = distPublicPath();
  const hasProductionBuild = fs.existsSync(path.join(publicPath, "index.html"));
  const useVite = process.env.NODE_ENV !== "production" || !hasProductionBuild;

  if (useVite) {
    // Lazy-load vite dev server — keeps vite out of production startup
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // On cPanel/Passenger PORT is assigned externally — always use it directly.
  // Never scan for alternatives; Passenger will only proxy to the assigned port.
  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);

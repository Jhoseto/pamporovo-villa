import express from "express";
import fs from "fs";
import { createServer } from "http";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { notificationSoundsDir } from "../notificationSoundStorage";
import { createContext } from "./context";
import { distPublicPath } from "./paths";
import { runSeedIfNeeded } from "../seed";
import { validateEnv } from "./env";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  validateEnv();
  await runSeedIfNeeded();

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

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

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

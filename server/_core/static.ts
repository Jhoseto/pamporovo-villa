import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { distPublicPath } from "./paths";
import { injectSeoIntoHtml } from "../seoInject";

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? distPublicPath()
      : path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath, { index: false }));

  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    const html = fs.readFileSync(indexPath, "utf-8");
    const injected = injectSeoIntoHtml(html, req.originalUrl);
    res.type("html").send(injected);
  });
}

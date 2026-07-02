import type { Request, Response } from "express";
import { getSitemapEntries } from "./seoMeta";
import { getSiteUrl } from "../shared/seoConstants";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function handleSitemap(_req: Request, res: Response): void {
  const entries = getSitemapEntries();
  const urls = entries
    .map((entry) => {
      const images =
        entry.images
          ?.map(
            (img) => `    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
    </image:image>`
          )
          .join("\n") ?? "";

      return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
${images}
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  res.type("application/xml").send(xml);
}

export function registerSitemapRoute(app: {
  get: (path: string, handler: (req: Request, res: Response) => void) => void;
}): void {
  app.get("/sitemap.xml", handleSitemap);
}

export { getSiteUrl };

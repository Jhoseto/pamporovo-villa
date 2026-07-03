import { getRouteSeo, normalizePathname, type RouteSeoBundle } from "./seoMeta";
import { hreflangTagsForPath } from "../shared/i18n/localeMeta";
import { parseSiteLocale } from "../shared/i18n/parseLocale";
import { getSiteUrl } from "../shared/seoConstants";

const STRIP_PATTERNS = [
  /<title>[\s\S]*?<\/title>\s*/i,
  /<meta\s+name="description"[^>]*>\s*/i,
  /<meta\s+name="keywords"[^>]*>\s*/i,
  /<meta\s+property="og:[^"]+"[^>]*>\s*/gi,
  /<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi,
  /<link\s+rel="canonical"[^>]*>\s*/i,
  /<link\s+rel="alternate"[^>]*>\s*/gi,
  /<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi,
  /<noscript\s+data-seo-fallback[^>]*>[\s\S]*?<\/noscript>\s*/gi,
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hreflangTags(pathname: string): string {
  return hreflangTagsForPath(pathname)
    .map(({ lang, href }) => `<link rel="alternate" hreflang="${lang}" href="${escapeHtml(href)}" />`)
    .join("\n    ");
}

function buildHeadInjection(bundle: RouteSeoBundle, pathname: string): string {
  const lines = [
    `<title>${escapeHtml(bundle.title)}</title>`,
    `<meta name="description" content="${escapeHtml(bundle.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(bundle.canonical)}" />`,
    hreflangTags(pathname),
    `<meta property="og:title" content="${escapeHtml(bundle.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(bundle.description)}" />`,
    `<meta property="og:type" content="${escapeHtml(bundle.ogType)}" />`,
    `<meta property="og:url" content="${escapeHtml(bundle.canonical)}" />`,
    `<meta property="og:site_name" content="Pamporovo Villa" />`,
    `<meta property="og:locale" content="${escapeHtml(bundle.ogLocale)}" />`,
    `<meta property="og:image" content="${escapeHtml(bundle.ogImage)}" />`,
    `<meta property="og:image:width" content="${bundle.ogImageWidth}" />`,
    `<meta property="og:image:height" content="${bundle.ogImageHeight}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(bundle.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(bundle.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(bundle.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(bundle.ogImage)}" />`,
  ].filter(Boolean);

  if (bundle.keywords) {
    lines.splice(2, 0, `<meta name="keywords" content="${escapeHtml(bundle.keywords)}" />`);
  }

  for (const schema of bundle.jsonLd) {
    lines.push(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  }

  return lines.join("\n    ");
}

function parseRequestUrl(rawUrl: string): { pathname: string; search: string } {
  try {
    const url = new URL(rawUrl, getSiteUrl());
    return { pathname: normalizePathname(url.pathname), search: url.search };
  } catch {
    const [path, search = ""] = rawUrl.split("?");
    return { pathname: normalizePathname(path), search: search ? `?${search}` : "" };
  }
}

export function injectSeoIntoHtml(html: string, rawUrl: string): string {
  const { pathname, search } = parseRequestUrl(rawUrl);
  if (pathname.startsWith("/admin")) return html;

  const lang = parseSiteLocale(search);
  const bundle = getRouteSeo(pathname, lang);
  let result = html;
  for (const pattern of STRIP_PATTERNS) {
    result = result.replace(pattern, "");
  }

  const headInjection = buildHeadInjection(bundle, pathname);
  if (result.includes("<!-- seo:server-inject -->")) {
    result = result.replace("<!-- seo:server-inject -->", headInjection);
  } else {
    result = result.replace("<head>", `<head>\n    ${headInjection}`);
  }

  const noscript = `<noscript data-seo-fallback="1">${bundle.noscriptHtml}</noscript>`;
  result = result.replace("</body>", `${noscript}\n  </body>`);

  return result;
}

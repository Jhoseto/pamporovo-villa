import fs from "fs";
import path from "path";

let cachedProjectRoot: string | null = null;

/** Resolves repo root in dev (tsx) and after esbuild bundle (dist/index.js). */
export function getProjectRoot(): string {
  if (cachedProjectRoot) return cachedProjectRoot;

  const candidates = [
    process.cwd(),
    path.resolve(import.meta.dirname, ".."),
    path.resolve(import.meta.dirname, "../.."),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "package.json"))) {
      cachedProjectRoot = candidate;
      return candidate;
    }
  }

  cachedProjectRoot = process.cwd();
  return cachedProjectRoot;
}

export function envFilePath(): string {
  return path.join(getProjectRoot(), ".env");
}

export function distPublicPath(): string {
  return path.join(getProjectRoot(), "dist", "public");
}

export function dataDirPath(...segments: string[]): string {
  return path.join(getProjectRoot(), "data", ...segments);
}

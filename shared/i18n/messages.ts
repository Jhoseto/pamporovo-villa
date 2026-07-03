import fs from "node:fs";
import path from "node:path";
import {
  LOCALE_NAMESPACES,
  SOURCE_LOCALE,
  type LocaleNamespace,
  type SiteLocale,
  type TargetLocale,
} from "./locales";

export type FlatMessages = Record<string, string>;

export type NestedMessages = Record<string, unknown>;

function repoRoot(): string {
  return process.cwd();
}

function bgDir(): string {
  return path.join(repoRoot(), "shared/locales/bg");
}

function generatedDir(locale: TargetLocale): string {
  return path.join(repoRoot(), "shared/locales/generated", locale);
}

function overridesDir(locale: TargetLocale): string {
  return path.join(repoRoot(), "shared/locales/overrides", locale);
}

function readJsonFile(filePath: string): NestedMessages {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as NestedMessages;
}

function flattenObject(obj: NestedMessages, prefix = ""): FlatMessages {
  const out: FlatMessages = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flattenObject(value as NestedMessages, fullKey));
    } else if (typeof value === "string") {
      out[fullKey] = value;
    }
  }
  return out;
}

function unflattenObject(flat: FlatMessages): NestedMessages {
  const root: NestedMessages = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let cursor: NestedMessages = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!(p in cursor) || typeof cursor[p] !== "object" || cursor[p] === null) {
        cursor[p] = {};
      }
      cursor = cursor[p] as NestedMessages;
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return root;
}

export function loadNamespace(locale: SiteLocale, ns: LocaleNamespace): NestedMessages {
  if (locale === SOURCE_LOCALE) {
    return readJsonFile(path.join(bgDir(), `${ns}.json`));
  }
  const generated = readJsonFile(path.join(generatedDir(locale), `${ns}.json`));
  const overrides = readJsonFile(path.join(overridesDir(locale), `${ns}.json`));
  return deepMerge(generated, overrides);
}

export function loadAllMessages(locale: SiteLocale): FlatMessages {
  let flat: FlatMessages = {};
  for (const ns of LOCALE_NAMESPACES) {
    const nested = loadNamespace(locale, ns);
    const prefixed = prefixNamespace(ns, nested);
    flat = { ...flat, ...flattenObject(prefixed) };
  }
  if (locale !== SOURCE_LOCALE) {
    const bgFlat = loadAllMessages(SOURCE_LOCALE);
    flat = { ...bgFlat, ...flat };
  }
  return flat;
}

function prefixNamespace(ns: LocaleNamespace, obj: NestedMessages): NestedMessages {
  const out: NestedMessages = {};
  for (const [key, value] of Object.entries(obj)) {
    out[`${ns}.${key}`] = value;
  }
  return out;
}

function deepMerge(base: NestedMessages, override: NestedMessages): NestedMessages {
  const out: NestedMessages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof out[key] === "object" &&
      out[key] !== null &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key] as NestedMessages, value as NestedMessages);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function resolveMessage(messages: FlatMessages, key: string): string | undefined {
  return messages[key];
}

export function listBgSourceFiles(): string[] {
  return LOCALE_NAMESPACES.map((ns) => path.join(bgDir(), `${ns}.json`)).filter((f) =>
    fs.existsSync(f)
  );
}

export function loadBgFlat(): FlatMessages {
  return loadAllMessages(SOURCE_LOCALE);
}

export function writeGeneratedNamespace(
  locale: TargetLocale,
  ns: LocaleNamespace,
  flatKeys: FlatMessages
): void {
  const nsPrefix = `${ns}.`;
  const nsFlat: FlatMessages = {};
  for (const [key, value] of Object.entries(flatKeys)) {
    if (key.startsWith(nsPrefix)) {
      nsFlat[key.slice(nsPrefix.length)] = value;
    }
  }
  const dir = generatedDir(locale);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${ns}.json`),
    `${JSON.stringify(unflattenObject(nsFlat), null, 2)}\n`,
    "utf8"
  );
}

export function writeAllGenerated(locale: TargetLocale, flat: FlatMessages): void {
  for (const ns of LOCALE_NAMESPACES) {
    writeGeneratedNamespace(locale, ns, flat);
  }
}

export { flattenObject, unflattenObject, bgDir, generatedDir };

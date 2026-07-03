import { useMemo } from "react";
import {
  LEGAL_BG_CONTENT,
  type LegalBlock,
  type LegalDocument,
} from "@shared/legal/bgContent";
import { useTranslation } from "@/contexts/LocaleContext";
import { resolveLegalMessage } from "@/i18n/legalMessages";
import { SOURCE_LOCALE } from "@shared/i18n/locales";

type LegalTabId = "privacy" | "terms" | "cookies";

function localizeBlocks(
  blocks: LegalBlock[],
  baseKey: string,
  t: (key: string, fallback?: string) => string
): LegalBlock[] {
  return blocks.map((block, j) => {
    const key = `${baseKey}.blocks.${j}`;
    switch (block.type) {
      case "p":
        return { type: "p", text: t(`${key}.text`, block.text) };
      case "html":
        return { type: "html", html: t(`${key}.html`, block.html) };
      case "ul":
        return {
          type: "ul",
          items: block.items.map((item, k) => t(`${key}.items.${k}`, item)),
        };
      case "sub":
        return {
          type: "sub",
          title: t(`${key}.title`, block.title),
          blocks: localizeBlocks(block.blocks, key, t),
        };
      case "table":
        return {
          type: "table",
          headers: block.headers.map((h, k) => t(`${key}.headers.${k}`, h)),
          rows: block.rows.map((row, ri) =>
            row.map((cell, ci) => t(`${key}.rows.${ri}.${ci}`, cell))
          ),
        };
      default:
        return block;
    }
  });
}

function localizeDocument(
  docId: LegalTabId,
  doc: LegalDocument,
  t: (key: string, fallback?: string) => string
): LegalDocument {
  return {
    sections: doc.sections.map((section, i) => ({
      title: t(`legal.${docId}.sections.${i}.title`, section.title),
      blocks: localizeBlocks(section.blocks, `legal.${docId}.sections.${i}`, t),
    })),
  };
}

function useLegalT() {
  const { locale } = useTranslation();
  return useMemo(() => {
    const isBg = locale === SOURCE_LOCALE;
    return (key: string, fallback?: string) =>
      resolveLegalMessage(isBg ? SOURCE_LOCALE : "en", key, fallback) ??
      (isBg ? fallback : undefined) ??
      key;
  }, [locale]);
}

export function useLegalMeta() {
  const t = useLegalT();
  return useMemo(
    () => ({
      heroEyebrow: t("legal.meta.heroEyebrow", LEGAL_BG_CONTENT.meta.heroEyebrow),
      lastUpdatedLabel: t(
        "legal.meta.lastUpdatedLabel",
        LEGAL_BG_CONTENT.meta.lastUpdatedLabel
      ),
      lastUpdated: t("legal.meta.lastUpdated", LEGAL_BG_CONTENT.meta.lastUpdated),
      pageTitle: t("legal.meta.pageTitle", LEGAL_BG_CONTENT.meta.pageTitle),
      siteUrl: LEGAL_BG_CONTENT.meta.siteUrl,
      controllerName: LEGAL_BG_CONTENT.meta.controllerName,
    }),
    [t]
  );
}

export function useLegalTabs() {
  const t = useLegalT();
  return useMemo(
    () =>
      (["privacy", "terms", "cookies"] as const).map((id) => ({
        id,
        label: t(`legal.tabs.${id}`, LEGAL_BG_CONTENT.tabs[id]),
      })),
    [t]
  );
}

export function useLegalDocument(docId: LegalTabId): LegalDocument {
  const t = useLegalT();
  return useMemo(
    () => localizeDocument(docId, LEGAL_BG_CONTENT[docId], t),
    [docId, t]
  );
}

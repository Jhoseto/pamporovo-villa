import { describe, expect, it } from "vitest";
import { slugifyOfferTitle } from "@/lib/offerSlug";
import { formatTrpcErrorMessage } from "@/lib/trpcErrorMessage";

describe("slugifyOfferTitle", () => {
  it("transliterates Bulgarian and hyphenates", () => {
    expect(slugifyOfferTitle("Коледа в Пампорово")).toBe("koleda-v-pamporovo");
  });

  it("returns empty for whitespace-only", () => {
    expect(slugifyOfferTitle("   ")).toBe("");
  });
});

describe("formatTrpcErrorMessage", () => {
  it("parses Zod slug too_small JSON", () => {
    const raw =
      '[{"origin":"string","code":"too_small","minimum":2,"path":["slug"],"message":"Too small: expected string to have >=2 characters"}]';
    expect(formatTrpcErrorMessage(raw)).toContain("URL идентификатор");
  });
});

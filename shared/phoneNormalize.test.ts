import { describe, expect, it } from "vitest";
import {
  digitsOnlyPhoneInput,
  normalizePhone,
  phoneLocalSuffix,
  phoneSearchPatterns,
  phonesMatch,
  storedPhoneDigits,
} from "@shared/phoneNormalize";

describe("digitsOnlyPhoneInput", () => {
  it("strips non-digit characters", () => {
    expect(digitsOnlyPhoneInput("088 777-27366")).toBe("08877727366");
    expect(digitsOnlyPhoneInput("+359 (87) 123-4567")).toBe("359871234567");
  });

  it("respects max length", () => {
    expect(digitsOnlyPhoneInput("123456789012345678901234567890", 10)).toBe("1234567890");
  });
});

describe("storedPhoneDigits", () => {
  it("returns null for empty values", () => {
    expect(storedPhoneDigits("")).toBeNull();
    expect(storedPhoneDigits("   ")).toBeNull();
  });
});

describe("normalizePhone", () => {
  it("normalizes +359 format", () => {
    expect(normalizePhone("+359 88 123 4567")).toBe("359881234567");
  });

  it("normalizes leading zero", () => {
    expect(normalizePhone("088 123 4567")).toBe("359881234567");
  });

  it("matches +359 and 0 formats", () => {
    expect(phonesMatch("+359881234567", "0881234567")).toBe(true);
  });

  it("builds search patterns from partial phone", () => {
    const patterns = phoneSearchPatterns("088123");
    expect(patterns).toContain("88123");
    expect(patterns.some(p => p.includes("88123"))).toBe(true);
  });

  it("extracts local suffix", () => {
    expect(phoneLocalSuffix("+359881234567")).toBe("881234567");
    expect(phoneLocalSuffix("0881234567")).toBe("881234567");
  });
});

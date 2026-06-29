import { z } from "zod";
import { digitsOnlyPhoneInput } from "./phoneNormalize";

const phoneDigitsMessage = "Телефонът може да съдържа само цифри";

export const optionalPhoneSchema = z
  .string()
  .max(32)
  .refine(value => value === "" || /^\d+$/.test(value), { message: phoneDigitsMessage })
  .optional()
  .or(z.literal(""));

export const requiredPhoneSchema = z
  .string()
  .min(5, "Телефонът е задължителен")
  .max(32)
  .regex(/^\d+$/, phoneDigitsMessage);

/** Normalize phone strings before validation/persistence. */
export function coercePhoneInput(value: string | undefined | null): string | undefined {
  if (value == null || value === "") return value === "" ? "" : undefined;
  return digitsOnlyPhoneInput(value);
}

import { describe, expect, it } from "vitest";
import { confirmationCardFilename, phoneForFilename } from "@shared/confirmationCardFilename";

describe("confirmationCardFilename", () => {
  it("includes guest name and normalized phone", () => {
    expect(
      confirmationCardFilename({
        guestName: "Иван Петров",
        guestPhone: "088 123 4567",
        checkInDate: "2026-07-01",
      })
    ).toBe("pamporovo-villa-Иван-Петров-359881234567-2026-07-01.jpg");
  });

  it("handles missing phone", () => {
    expect(
      confirmationCardFilename({
        guestName: "Guest",
        guestPhone: null,
        checkInDate: "2026-07-01",
      })
    ).toBe("pamporovo-villa-Guest-bez-telefon-2026-07-01.jpg");
  });

  it("normalizes +359 phone", () => {
    expect(phoneForFilename("+359 88 123 4567")).toBe("359881234567");
  });
});

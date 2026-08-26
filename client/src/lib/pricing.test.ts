import { describe, expect, it } from "vitest";
import {
  calculateStayPriceFromGrid,
  countSpecialNightsInRange,
  getSpecialRateForNight,
  type PricingGridRow,
  type SpecialRatePeriod,
} from "@/lib/pricing";

const gridRows: PricingGridRow[] = [
  {
    villaId: "villa-1",
    tierKey: "up-to-3",
    tierLabel: "До 3 нощувки",
    winterPerNight: 100,
    summerPerNight: 120,
    sortOrder: 0,
  },
  {
    villaId: "villa-1",
    tierKey: "4-nights",
    tierLabel: "4 нощувки",
    winterPerNight: 90,
    summerPerNight: 110,
    sortOrder: 1,
  },
  {
    villaId: "villa-1",
    tierKey: "5-nights",
    tierLabel: "5 нощувки",
    winterPerNight: 80,
    summerPerNight: 100,
    sortOrder: 2,
  },
  {
    villaId: "villa-1",
    tierKey: "over-5",
    tierLabel: "Над 5 нощувки",
    winterPerNight: 70,
    summerPerNight: 90,
    sortOrder: 3,
  },
];

const christmasPeriod: SpecialRatePeriod = {
  villaId: "villa-1",
  startDate: "2026-12-24",
  endDate: "2026-12-27",
  pricePerNight: 200,
  label: "Коледа",
};

describe("special rate pricing", () => {
  it("uses special rate for every night in the period", () => {
    const quote = calculateStayPriceFromGrid(
      new Date(2026, 11, 24),
      new Date(2026, 11, 27),
      "villa-1",
      gridRows,
      [christmasPeriod]
    );

    expect(quote).not.toBeNull();
    expect(quote!.nights).toBe(3);
    expect(quote!.specialNights).toBe(3);
    expect(quote!.specialTotal).toBe(600);
    expect(quote!.total).toBe(600);
    expect(quote!.winterNights).toBe(0);
    expect(quote!.hasSpecialRates).toBe(true);
    expect(quote!.specialLabels).toEqual(["Коледа"]);
  });

  it("mixes special and standard nights in one stay", () => {
    const quote = calculateStayPriceFromGrid(
      new Date(2026, 11, 23),
      new Date(2026, 11, 27),
      "villa-1",
      gridRows,
      [christmasPeriod]
    );

    expect(quote).not.toBeNull();
    expect(quote!.nights).toBe(4);
    expect(quote!.specialNights).toBe(3);
    expect(quote!.winterNights).toBe(1);
    expect(quote!.total).toBe(690);
  });

  it("uses standard rates when special period is for another villa", () => {
    const quote = calculateStayPriceFromGrid(
      new Date(2026, 11, 24),
      new Date(2026, 11, 27),
      "villa-1",
      gridRows,
      [{ ...christmasPeriod, villaId: "villa-2" }]
    );

    expect(quote).not.toBeNull();
    expect(quote!.specialNights).toBe(0);
    expect(quote!.winterNights).toBe(3);
    expect(quote!.total).toBe(300);
  });

  it("detects special nights in a range", () => {
    expect(
      countSpecialNightsInRange(
        new Date(2026, 11, 23),
        new Date(2026, 11, 27),
        "villa-1",
        [christmasPeriod]
      )
    ).toBe(3);
  });

  it("returns null for nights outside special periods", () => {
    expect(
      getSpecialRateForNight(new Date(2026, 6, 15), "villa-1", [christmasPeriod])
    ).toBeNull();
  });
});

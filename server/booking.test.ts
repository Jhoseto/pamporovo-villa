import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const insertBooking = vi.fn().mockResolvedValue(42);
const getBookingById = vi.fn().mockResolvedValue({
  id: 42,
  guestName: "John Doe",
  villaId: "villa-1",
  checkInDate: "2026-07-15",
  checkOutDate: "2026-07-22",
});

vi.mock("./db", () => ({
  insertBooking: (...args: unknown[]) => insertBooking(...args),
  getBookingById: (...args: unknown[]) => getBookingById(...args),
}));

vi.mock("./_core/push", () => ({
  notifyNewWebsiteBooking: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./_core/rateLimit", () => ({
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
  checkRateLimit: vi.fn().mockReturnValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
}

const validBooking = {
  villaId: "villa-1" as const,
  checkInDate: "2026-07-15",
  checkOutDate: "2026-07-22",
  numberOfGuests: 4,
  guestName: "John Doe",
  guestEmail: "john@example.com",
  guestPhone: "+359 87 123 4567",
  guestNote: "Early check-in if possible",
};

describe("booking.createRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a booking request with valid data", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.booking.createRequest(validBooking);

    expect(result.success).toBe(true);
    expect(result.message).toContain("successfully");
    expect(insertBooking).toHaveBeenCalledOnce();
  });

  it("rejects if checkout date is before checkin date", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.booking.createRequest({
        ...validBooking,
        checkInDate: "2026-07-22",
        checkOutDate: "2026-07-15",
      })
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringContaining("Check-out date"),
    });
  });

  it("validates guest name length", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.booking.createRequest({ ...validBooking, guestName: "J" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("validates email format", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.booking.createRequest({ ...validBooking, guestEmail: "invalid-email" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("requires email and phone for website bookings", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.booking.createRequest({ ...validBooking, guestEmail: "" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    await expect(
      caller.booking.createRequest({ ...validBooking, guestPhone: "12" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts optional guest note", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const { guestNote: _guestNote, ...withoutNote } = validBooking;
    const result = await caller.booking.createRequest(withoutNote);
    expect(result.success).toBe(true);
  });
});

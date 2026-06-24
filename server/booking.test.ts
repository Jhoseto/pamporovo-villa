import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createBookingRequest: vi.fn().mockResolvedValue({ insertId: 1 }),
  createInquiry: vi.fn().mockResolvedValue({ insertId: 1 }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { createBookingRequest, createInquiry } from "./db";
import { notifyOwner } from "./_core/notification";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("booking procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRequest", () => {
    it("should create a booking request with valid data", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.booking.createRequest({
        checkInDate: "2026-07-15",
        checkOutDate: "2026-07-22",
        numberOfGuests: 4,
        guestName: "John Doe",
        guestEmail: "john@example.com",
        guestPhone: "+359 87 123 4567",
        specialRequests: "Early check-in if possible",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("successfully");
      expect(createBookingRequest).toHaveBeenCalledOnce();
      expect(notifyOwner).toHaveBeenCalledOnce();
    });

    it("should reject if checkout date is before checkin date", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.booking.createRequest({
          checkInDate: "2026-07-22",
          checkOutDate: "2026-07-15",
          numberOfGuests: 4,
          guestName: "John Doe",
          guestEmail: "john@example.com",
          guestPhone: "+359 87 123 4567",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
        expect(error.message).toContain("Check-out date");
      }
    });

    it("should validate guest name is at least 2 characters", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.booking.createRequest({
          checkInDate: "2026-07-15",
          checkOutDate: "2026-07-22",
          numberOfGuests: 4,
          guestName: "J",
          guestEmail: "john@example.com",
          guestPhone: "+359 87 123 4567",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should validate email format", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.booking.createRequest({
          checkInDate: "2026-07-15",
          checkOutDate: "2026-07-22",
          numberOfGuests: 4,
          guestName: "John Doe",
          guestEmail: "invalid-email",
          guestPhone: "+359 87 123 4567",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should validate number of guests is between 1 and 10", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.booking.createRequest({
          checkInDate: "2026-07-15",
          checkOutDate: "2026-07-22",
          numberOfGuests: 15,
          guestName: "John Doe",
          guestEmail: "john@example.com",
          guestPhone: "+359 87 123 4567",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should accept optional special requests", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.booking.createRequest({
        checkInDate: "2026-07-15",
        checkOutDate: "2026-07-22",
        numberOfGuests: 4,
        guestName: "Jane Smith",
        guestEmail: "jane@example.com",
        guestPhone: "+359 87 987 6543",
      });

      expect(result.success).toBe(true);
    });
  });
});

describe("inquiry procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submit", () => {
    it("should submit an inquiry with valid data", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.inquiry.submit({
        visitorName: "Alice Johnson",
        visitorEmail: "alice@example.com",
        subject: "Question about amenities",
        message: "Can you tell me more about the jacuzzi and sauna?",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("successfully");
      expect(createInquiry).toHaveBeenCalledOnce();
      expect(notifyOwner).toHaveBeenCalledOnce();
    });

    it("should validate visitor name is at least 2 characters", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.inquiry.submit({
          visitorName: "A",
          visitorEmail: "alice@example.com",
          subject: "Question",
          message: "This is a test message",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should validate email format", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.inquiry.submit({
          visitorName: "Alice Johnson",
          visitorEmail: "invalid-email",
          subject: "Question",
          message: "This is a test message",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should validate subject is at least 5 characters", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.inquiry.submit({
          visitorName: "Alice Johnson",
          visitorEmail: "alice@example.com",
          subject: "Hi",
          message: "This is a test message",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should validate message is at least 10 characters", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.inquiry.submit({
          visitorName: "Alice Johnson",
          visitorEmail: "alice@example.com",
          subject: "Question about amenities",
          message: "Short",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should accept optional phone number", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.inquiry.submit({
        visitorName: "Bob Wilson",
        visitorEmail: "bob@example.com",
        subject: "Inquiry about booking",
        message: "I would like to know more about your rates",
      });

      expect(result.success).toBe(true);
    });
  });
});

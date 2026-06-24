import { describe, it, expect, vi } from "vitest";

vi.mock("./_core/env", () => ({
  ENV: {
    forgeApiUrl: "",
    forgeApiKey: "",
  },
}));

import { notifyOwner } from "./_core/notification";

describe("notifyOwner", () => {
  it("returns false when notification service is not configured", async () => {
    const result = await notifyOwner({
      title: "Test",
      content: "Test notification content",
    });

    expect(result).toBe(false);
  });
});

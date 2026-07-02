import { describe, expect, it } from "vitest";
import { viberChatUrl } from "./messagingLinks";

describe("viberChatUrl", () => {
  it("builds chat URL with encoded + and draft", () => {
    const url = viberChatUrl("0879 501 660", "Здравейте!");
    expect(url).toBe("viber://chat/?number=%2B359879501660&draft=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D0%B5%D0%B9%D1%82%D0%B5%21");
  });

  it("returns null for invalid phone", () => {
    expect(viberChatUrl("")).toBeNull();
  });
});

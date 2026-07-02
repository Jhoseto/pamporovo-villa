import { describe, expect, it } from "vitest";
import { buildMailjetBody } from "../server/_core/mailjetSend";

describe("buildMailjetBody", () => {
  it("builds a send payload with reply-to and attachment", () => {
    const body = buildMailjetBody({
      from: { email: "noreply@pamporovovilla.com", name: "Pamporovo Villa" },
      to: "guest@example.com",
      replyTo: "pamporovovillasupport@gmail.com",
      subject: "Test",
      text: "Plain",
      html: "<p>Html</p>",
      attachments: [
        {
          filename: "card.jpg",
          contentType: "image/jpeg",
          content: Buffer.from("jpeg-bytes"),
        },
      ],
    });

    expect(body.Messages[0]).toMatchObject({
      From: { Email: "noreply@pamporovovilla.com", Name: "Pamporovo Villa" },
      ReplyTo: { Email: "pamporovovillasupport@gmail.com" },
      Subject: "Test",
    });
    expect(body.Messages[0].Attachments).toHaveLength(1);
  });
});

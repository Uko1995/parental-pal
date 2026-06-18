import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveBookingParentEmail } from "./booking-parent-email";

describe("booking-parent-email", () => {
  it("prefers booking parentEmail over account email", () => {
    const email = resolveBookingParentEmail(
      { parentEmail: "parent@example.com" },
      {
        userData: { user: { email: "account@example.com", name: "Account" } },
      } as never,
    );
    assert.equal(email, "parent@example.com");
  });

  it("falls back to account email when booking email is missing", () => {
    const email = resolveBookingParentEmail(
      { parentEmail: "" },
      {
        userData: { user: { email: "account@example.com", name: "Account" } },
      } as never,
    );
    assert.equal(email, "account@example.com");
  });
});

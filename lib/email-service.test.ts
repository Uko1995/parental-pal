import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { emailTemplates } from "./email-service";

describe("bookingConfirmation drive folder section", () => {
  it("includes drive folder section when driveFolderUrl is provided", () => {
    const { html, text } = emailTemplates.bookingConfirmation("Jane Doe", {
      _id: "booking-1",
      serviceType: "holiday-camps",
      driveFolderUrl: "https://drive.google.com/drive/folders/test-folder",
    });

    assert.match(html, /Holiday Camp Folder/);
    assert.match(html, /handbook, camp materials, and photos/);
    assert.match(html, /test-folder/);
    assert.match(text ?? "", /Holiday Camp Folder: https:\/\/drive\.google\.com\/drive\/folders\/test-folder/);
  });

  it("omits drive folder section when driveFolderUrl is absent", () => {
    const { html, text } = emailTemplates.bookingConfirmation("Jane Doe", {
      _id: "booking-1",
      serviceType: "holiday-camps",
    });

    assert.doesNotMatch(html, /Holiday Camp Folder/);
    assert.doesNotMatch(text ?? "", /Holiday Camp Folder:/);
  });
});

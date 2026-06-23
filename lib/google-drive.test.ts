import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  buildFolderUrl,
  getGoogleDriveAuthMode,
  isGoogleDriveConfigured,
  normalizeFolderName,
} from "./google-drive";

describe("google-drive helpers", () => {
  const envSnapshot = { ...process.env };

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  it("detects oauth mode when refresh token and client credentials are set", () => {
    process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID = "parent-id";
    process.env.GOOGLE_ID = "client-id";
    process.env.GOOGLE_SECRET = "client-secret";
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN = "refresh-token";
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;

    assert.equal(getGoogleDriveAuthMode(), "oauth");
    assert.equal(isGoogleDriveConfigured(), true);
  });
  it("normalizeFolderName trims, collapses spaces, and strips invalid chars", () => {
    assert.equal(normalizeFolderName("  John / Smith  "), "John Smith");
    assert.equal(normalizeFolderName('Emma\\Liam:Test'), "EmmaLiamTest");
  });

  it("buildFolderUrl returns a drive folder URL", () => {
    assert.equal(
      buildFolderUrl("abc123"),
      "https://drive.google.com/drive/folders/abc123",
    );
  });
});

import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { buildHtrFolderName } from "./htr-drive-folder";
import type { BookingInterface } from "@/models/Booking";

function makeBooking(
  overrides: Partial<BookingInterface> = {},
): BookingInterface {
  return {
    userId: "user-id" as never,
    serviceType: "holiday-camps",
    parentName: "John Smith",
    parentEmail: "john@example.com",
    parentPhone: "0800-000-0000",
    childrenCount: 1,
    children: [{ name: "Emma", age: 8 }],
    serviceData: {
      campSeasonId: "holidays-that-rock-2026",
      childrenData: [{ childId: "child-1", camperId: "HTR26-WBWK6-001" }],
    },
    schedule: { startDate: "2026-07-01", isRecurring: false },
    pricing: { baseAmount: 1000, totalAmount: 1000, currency: "NGN" },
    payment: { status: "pending", paidAmount: 0 },
    status: "confirmed",
    source: "onlineSearch",
    followUpRequired: false,
    isRepeatedCustomer: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("buildHtrFolderName", () => {
  const originalStyle = process.env.GOOGLE_DRIVE_FOLDER_NAME_STYLE;

  afterEach(() => {
    if (originalStyle === undefined) {
      delete process.env.GOOGLE_DRIVE_FOLDER_NAME_STYLE;
    } else {
      process.env.GOOGLE_DRIVE_FOLDER_NAME_STYLE = originalStyle;
    }
  });

  it("uses parent and single child name", () => {
    const name = buildHtrFolderName(makeBooking());
    assert.equal(name, "John Smith - Emma");
  });

  it("joins two children with ampersand", () => {
    const name = buildHtrFolderName(
      makeBooking({
        childrenCount: 2,
        children: [
          { name: "Emma", age: 8 },
          { name: "Liam", age: 10 },
        ],
        serviceData: {
          campSeasonId: "holidays-that-rock-2026",
          childrenData: [
            { childId: "child-1", camperId: "HTR26-WBWK6-001" },
            { childId: "child-2", camperId: "HTR26-WBWK4-002" },
          ],
        },
      }),
    );
    assert.equal(name, "John Smith - Emma & Liam");
  });

  it("formats three or more children with Oxford comma style", () => {
    const name = buildHtrFolderName(
      makeBooking({
        childrenCount: 3,
        children: [
          { name: "Aisha", age: 8 },
          { name: "Tunde", age: 9 },
          { name: "Zara", age: 10 },
        ],
      }),
    );
    assert.equal(name, "John Smith - Aisha, Tunde & Zara");
  });

  it("includes camper ids when folder name style is camper-id", () => {
    process.env.GOOGLE_DRIVE_FOLDER_NAME_STYLE = "camper-id";
    const name = buildHtrFolderName(
      makeBooking({
        childrenCount: 2,
        children: [
          { name: "Emma", age: 8 },
          { name: "Liam", age: 10 },
        ],
        serviceData: {
          campSeasonId: "holidays-that-rock-2026",
          childrenData: [
            { childId: "child-1", camperId: "HTR26-WBWK6-001" },
            { childId: "child-2", camperId: "HTR26-WBWK4-002" },
          ],
        },
      }),
    );
    assert.equal(
      name,
      "John Smith - Emma (HTR26-WBWK6-001), Liam (HTR26-WBWK4-002)",
    );
  });
});

describe("getExistingDriveFolder", () => {
  it("returns null when booking has no drive folder", async () => {
    const { getExistingDriveFolder } = await import("./htr-drive-folder");
    assert.equal(getExistingDriveFolder(makeBooking()), null);
  });

  it("returns existing folder info from booking", async () => {
    const { getExistingDriveFolder } = await import("./htr-drive-folder");
    const folder = getExistingDriveFolder(
      makeBooking({
        driveFolderId: "folder-123",
        driveFolderUrl: "https://drive.google.com/drive/folders/folder-123",
        driveFolderName: "John Smith - Emma",
      }),
    );
    assert.deepEqual(folder, {
      folderId: "folder-123",
      folderUrl: "https://drive.google.com/drive/folders/folder-123",
      folderName: "John Smith - Emma",
    });
  });
});

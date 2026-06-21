import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildChildrenRowsFromProfile,
} from "./booking-profile-prefill";
import {
  formatPaymentDueLabel,
  formatPaymentDueToastMessage,
} from "./booking-payment-due";
import {
  shouldRestoreFormPersistence,
  type FormPersistenceData,
} from "./form-persistence";

function sampleData(
  overrides: Partial<FormPersistenceData> = {},
): FormPersistenceData {
  return {
    selectedService: "tutoring",
    selectedHearAboutUs: "",
    otherHearAboutUsText: "",
    socialMediaPlatform: "",
    referralName: "",
    priority: "normal",
    followUpRequired: false,
    isRepeatedCustomer: false,
    timestamp: Date.now(),
    ...overrides,
  };
}

describe("booking form fill priority", () => {
  it("restores persistence when pendingAuthSubmit is set", () => {
    assert.equal(
      shouldRestoreFormPersistence(
        sampleData({ pendingAuthSubmit: true }),
        null,
      ),
      true,
    );
  });

  it("restores persistence when action=submit is in the URL", () => {
    assert.equal(
      shouldRestoreFormPersistence(sampleData(), "submit"),
      true,
    );
  });

  it("does not restore generic auto-save snapshots", () => {
    assert.equal(
      shouldRestoreFormPersistence(sampleData({ pendingAuthSubmit: false }), null),
      false,
    );
  });

  it("builds a child row for every profile child", () => {
    const built = buildChildrenRowsFromProfile(
      [
        { name: "Ada", age: 8, gender: "female" },
        { name: "Kemi", age: 10, gender: "female" },
      ],
      (id, index) => ({ id, index, label: `child-${index}` }),
    );

    assert.ok(built);
    assert.equal(built.rows.length, 2);
    assert.equal(built.defaults[built.rows[0].id]?.name, "Ada");
    assert.equal(built.defaults[built.rows[1].id]?.name, "Kemi");
    assert.equal(built.ages[built.rows[0].id], 8);
    assert.equal(built.ages[built.rows[1].id], 10);
  });

  it("uses pay on or before wording for due labels", () => {
    assert.match(
      formatPaymentDueLabel("2026-06-20"),
      /Pay on or before/,
    );
    assert.match(
      formatPaymentDueToastMessage("2026-06-20"),
      /Pay on or before/,
    );
    assert.doesNotMatch(
      formatPaymentDueToastMessage("2026-06-20"),
      /Pay by/,
    );
  });
});

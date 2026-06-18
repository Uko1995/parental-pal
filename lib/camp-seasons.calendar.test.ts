import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CAMP_SEASONS } from "./camp-seasons";
import { validateCampSeason } from "./camp-seasons.calendar";

describe("camp-seasons calendar validation", () => {
  for (const season of Object.values(CAMP_SEASONS)) {
    it(`validates ${season.id} against the 2026 calendar`, () => {
      const errors = validateCampSeason(season);
      assert.deepEqual(errors, [], errors.join("\n"));
    });
  }
});

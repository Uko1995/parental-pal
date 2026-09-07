import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateHomeschoolPricing, resolveHomeschoolRates } from "./homeschool-pricing";
import { DEFAULT_HOMESCHOOL_RATES } from "./homeschool-program";

describe("homeschool-pricing", () => {
  it("charges creche by the selected cadence and quantity", () => {
    const { lines, totalAmount } = calculateHomeschoolPricing([
      {
        childId: "child-1",
        track: "creche",
        crecheCadence: "week",
        crecheQuantity: 3,
      },
    ]);

    assert.equal(lines.length, 1);
    assert.equal(lines[0].unitPrice, 25000);
    assert.equal(lines[0].quantity, 3);
    assert.equal(totalAmount, 75000);
  });

  it("charges afterschool care per month", () => {
    const { totalAmount } = calculateHomeschoolPricing([
      { childId: "child-1", track: "afterschool", afterschoolMonths: 2 },
    ]);

    assert.equal(totalAmount, 80000);
  });

  it("uses the grade school band rate and multiplies by term count", () => {
    const { lines, totalAmount } = calculateHomeschoolPricing([
      {
        childId: "child-1",
        track: "gradeSchool",
        selectedTerms: ["first", "second"],
      },
    ]);

    assert.equal(lines[0].unitPrice, 300000);
    assert.equal(lines[0].quantity, 2);
    assert.equal(totalAmount, 600000);
  });

  it("bills one-off fees once and per-term fees per term", () => {
    const { lines } = calculateHomeschoolPricing([
      {
        childId: "child-1",
        track: "preschool",
        selectedTerms: ["first", "second"],
        isNewIntake: true,
        learningMaterials: true,
        transport: true,
      },
    ]);

    const levy = lines.find((line) => line.code === "developmentLevy");
    const materials = lines.find((line) => line.code === "learningMaterials");
    const transport = lines.find((line) => line.code === "transportGbagada");

    assert.equal(levy?.quantity, 1);
    assert.equal(levy?.total, 50000);
    assert.equal(materials?.quantity, 1);
    assert.equal(materials?.total, 80000);
    assert.equal(transport?.quantity, 2);
    assert.equal(transport?.total, 400000);
  });

  it("bills each selected ECA per term", () => {
    const { lines } = calculateHomeschoolPricing([
      {
        childId: "child-1",
        track: "gradeSchool",
        selectedTerms: ["first"],
        selectedEcas: ["piano", "chess"],
      },
    ]);

    const ecaLines = lines.filter((line) => line.code.startsWith("eca:"));
    assert.equal(ecaLines.length, 2);
    assert.equal(
      ecaLines.reduce((sum, line) => sum + line.total, 0),
      200000,
    );
  });

  it("treats a term track with no terms selected as a single term", () => {
    const { totalAmount } = calculateHomeschoolPricing([
      { childId: "child-1", track: "preschool", selectedTerms: [] },
    ]);

    assert.equal(totalAmount, 250000);
  });

  it("sums across multiple children on different tracks", () => {
    const { totalAmount } = calculateHomeschoolPricing([
      { childId: "a", track: "creche", crecheCadence: "month", crecheQuantity: 1 },
      { childId: "b", track: "afterschool", afterschoolMonths: 1 },
    ]);

    assert.equal(totalAmount, 100000);
  });

  it("merges partial admin overrides over the programme defaults", () => {
    const rates = resolveHomeschoolRates({
      tuitionByBand: { gradeSchool: 350000 },
    });

    assert.equal(rates.tuitionByBand.gradeSchool, 350000);
    assert.equal(
      rates.tuitionByBand.preschool,
      DEFAULT_HOMESCHOOL_RATES.tuitionByBand.preschool,
    );
    assert.equal(rates.creche.day, DEFAULT_HOMESCHOOL_RATES.creche.day);
    assert.equal(rates.ecas.length, DEFAULT_HOMESCHOOL_RATES.ecas.length);
  });

  it("prices with admin overrides when provided", () => {
    const rates = resolveHomeschoolRates({ afterschool: { month: 55000 } });
    const { totalAmount } = calculateHomeschoolPricing(
      [{ childId: "a", track: "afterschool", afterschoolMonths: 3 }],
      rates,
    );

    assert.equal(totalAmount, 165000);
  });
});

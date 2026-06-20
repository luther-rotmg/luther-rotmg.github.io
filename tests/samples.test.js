import { describe, it, expect } from "vitest";
import { SAMPLES } from "../assets/js/samples.js";

const SEV = ["high", "med", "low"];
const CAT = ["perf", "bug", "security", "maintainability", "style"];

describe("SAMPLES", () => {
  it("has at least 3 samples with unique ids", () => {
    expect(SAMPLES.length).toBeGreaterThanOrEqual(3);
    expect(new Set(SAMPLES.map((s) => s.id)).size).toBe(SAMPLES.length);
  });
  it("every sample has a label, code, summary, and findings", () => {
    for (const s of SAMPLES) {
      expect(s.label).toBeTruthy();
      expect(s.code).toBeTruthy();
      expect(s.summary).toBeTruthy();
      expect(s.findings.length).toBeGreaterThan(0);
    }
  });
  it("every finding is well-formed and in range", () => {
    for (const s of SAMPLES) {
      const lineCount = s.code.split("\n").length;
      for (const f of s.findings) {
        expect(SEV).toContain(f.severity);
        expect(CAT).toContain(f.category);
        expect(f.comment).toBeTruthy();
        expect(f.line).toBeGreaterThanOrEqual(1);
        expect(f.line).toBeLessThanOrEqual(lineCount);
      }
    }
  });
});

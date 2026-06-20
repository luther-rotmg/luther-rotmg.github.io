import { describe, it, expect } from "vitest";
import { severityClass, buildReviewModel } from "../assets/js/annotate.js";

describe("severityClass", () => {
  it("maps known severities", () => {
    expect(severityClass("high")).toBe("sev-high");
    expect(severityClass("med")).toBe("sev-med");
    expect(severityClass("low")).toBe("sev-low");
  });
  it("defaults unknown input to sev-low", () => {
    expect(severityClass("bogus")).toBe("sev-low");
    expect(severityClass(undefined)).toBe("sev-low");
  });
});

describe("buildReviewModel", () => {
  const code = "a()\nb()\nc()";
  it("splits code into 1-indexed lines", () => {
    const m = buildReviewModel(code, []);
    expect(m.lines.map((l) => l.num)).toEqual([1, 2, 3]);
    expect(m.lines[0].text).toBe("a()");
    expect(m.lines.every((l) => l.finding === null)).toBe(true);
  });
  it("attaches a finding to its line", () => {
    const f = { line: 2, severity: "high", category: "bug", comment: "x" };
    const m = buildReviewModel(code, [f]);
    expect(m.lines[1].finding).toEqual(f);
    expect(m.lines[0].finding).toBeNull();
  });
  it("clamps out-of-range finding lines", () => {
    const hi = buildReviewModel(code, [{ line: 99, severity: "low", category: "style", comment: "y" }]);
    expect(hi.lines[2].finding).not.toBeNull(); // clamped to last line
    const lo = buildReviewModel(code, [{ line: 0, severity: "low", category: "style", comment: "z" }]);
    expect(lo.lines[0].finding).not.toBeNull(); // clamped to first line
  });
});

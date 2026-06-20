import { describe, it, expect } from "vitest";
import { validateContactForm } from "../assets/js/contact.js";

describe("validateContactForm", () => {
  it("requires name, non-empty contact, and message", () => {
    const r = validateContactForm({ name: "", email: "", message: "" });
    expect(r.valid).toBe(false);
    expect(r.errors.name).toBeTruthy();
    expect(r.errors.email).toBeTruthy();
    expect(r.errors.message).toBeTruthy();
  });
  it("accepts any non-empty contact string (Email or Discord)", () => {
    const r = validateContactForm({ name: "A", email: "sam#1234", message: "hi there" });
    expect(r.valid).toBe(true);
  });
  it("rejects empty contact", () => {
    const r = validateContactForm({ name: "A", email: "", message: "hi there" });
    expect(r.valid).toBe(false);
    expect(r.errors.email).toBeTruthy();
  });
  it("passes a complete, valid submission", () => {
    const r = validateContactForm({ name: "A", email: "a@b.co", message: "hi there" });
    expect(r.valid).toBe(true);
  });
});

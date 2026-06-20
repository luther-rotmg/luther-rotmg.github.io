import { test, expect } from "@playwright/test";

test("page loads with title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/luther/);
});

test("demo renders a curated sample's annotations", async ({ page }) => {
  await page.goto("/#lab");
  await expect(page.locator(".demo-output .note").first()).toBeVisible();
});

test("paste flow falls back to a sample when worker fails", async ({ page }) => {
  await page.route("**/review", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ fallback: true }) }));
  await page.goto("/#lab");
  await page.getByRole("tab", { name: "Paste your own" }).click();
  await page.locator("#demo-code").fill("doThing()\n");
  await page.getByRole("button", { name: /review it/i }).click();
  await expect(page.locator(".demo-output .note").first()).toBeVisible();
});

test("contact form submits (mocked worker)", async ({ page }) => {
  await page.route("**/contact", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }));
  await page.goto("/#contact");
  await page.locator("#cf-name").fill("Sam");
  await page.locator("#cf-email").fill("sam@example.com");
  await page.locator("#cf-msg").fill("Saw Tincture — nice work.");
  await page.getByRole("button", { name: /send/i }).click();
  await expect(page.locator(".form-status")).toContainText(/in touch/i);
});

test("command palette opens on Ctrl-K, filters, and navigates", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await expect(page.locator(".cmdk")).toBeVisible();
  await page.locator(".cmdk-input").fill("contact");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contact$/);
  await page.keyboard.press("Control+k");
  await page.keyboard.press("Escape");
  await expect(page.locator(".cmdk")).toBeHidden();
});

test("no console errors on load", async ({ page }) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/"); await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

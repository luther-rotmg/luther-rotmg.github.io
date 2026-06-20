import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:5174" },
  webServer: {
    command: "node scripts/serve.mjs",
    url: "http://localhost:5174",
    reuseExistingServer: false,
  },
});

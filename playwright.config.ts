import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const baseURL = process.env["E2E_BASE_URL"] ?? `http://localhost:${PORT}`;

/**
 * End-to-end suite runs against a production build served by Nitro's Node preset,
 * so the SSR output under test is the same code that ships to the edge.
 * Set E2E_BASE_URL to target a deployed instance instead.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  reporter: process.env["CI"] ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  ...(process.env["E2E_BASE_URL"]
    ? {}
    : {
        webServer: {
          command: `npm run build:node && PORT=${PORT} npm run start`,
          url: baseURL,
          reuseExistingServer: !process.env["CI"],
          timeout: 180_000,
        },
      }),
});

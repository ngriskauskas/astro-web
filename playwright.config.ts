import { defineConfig } from "@playwright/test";
import { deviceOptions } from "./tests/e2e/devices";
import { API_URL, GOOGLE_CLIENT_ID } from "./tests/mocks/auth";

// A dedicated port, so a dev server already running on 5173 (built with the real
// API URL) is neither reused nor in the way.
const PORT = 5174;

export default defineConfig({
  testDir: "tests/e2e",
  // No retries: an intermittent test should show up as a failure, not be masked.
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: "chromium",
    timezoneId: "America/New_York",
    locale: "en-US",
    // Fail a stuck action quickly instead of waiting for the whole test timeout.
    actionTimeout: 5_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    // Mocked responses come from another origin (the fake API host) and carry no
    // CORS headers; the real backend's CORS setup is not what these tests cover.
    launchOptions: { args: ["--disable-web-security"] },
  },
  projects: Object.entries(deviceOptions).map(([name, use]) => ({ name, use })),
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    env: { VITE_API_URL: API_URL, VITE_GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID },
  },
});

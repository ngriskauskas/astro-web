import { defineConfig } from "@playwright/test";
import path from "node:path";
import base from "../../playwright.config";

const root = path.resolve(import.meta.dirname, "../..");

// Screenshot capture for the layout review (npm run review:layout). Separate from the
// root config so `npm run test:e2e` never runs it: it captures, it does not test.
export default defineConfig({
  ...base,
  testDir: import.meta.dirname,
  testMatch: "**/*.capture.ts",
  outputDir: path.join(root, "test-results/layout-review-run"),
  reporter: [["list"]],
  projects: [{ name: "review" }],
  webServer: { ...base.webServer!, cwd: root },
});

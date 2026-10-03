import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import { API_URL, GOOGLE_CLIENT_ID } from "./tests/mocks/auth";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/integration/**/*.test.tsx"],
    setupFiles: ["tests/integration/setup.ts"],
    css: false,
    env: {
      VITE_API_URL: API_URL,
      VITE_GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
      TZ: "America/New_York",
    },
  },
});

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import toast from "react-hot-toast";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

export const FIXED_NOW = new Date("2026-01-15T12:00:00Z");

// Starts with no handlers: renderWithApp() installs a scenario, and a test adds
// one-off overrides with server.use(...).
export const server = setupServer();

// The app catches some failed fetches, so an unmocked request is recorded here and
// asserted after the test instead of relying on the rejected fetch to fail it.
const unmocked: string[] = [];

// jsdom has no matchMedia; react-hot-toast uses it to check for reduced motion.
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

beforeAll(() => {
  server.listen({
    onUnhandledFrame({ frame, defaults }) {
      if (frame.protocol === "http") {
        const { request } = frame.data as { request: Request };
        unmocked.push(`${request.method} ${request.url}`);
      }
      defaults.error();
    },
  });
});

beforeEach(() => {
  // Freezes Date only; timers keep running, so debounces and async utilities still work.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  cleanup();
  // Toasts live in a module-level store and would otherwise show up in the next test.
  toast.remove();
  server.resetHandlers();
  localStorage.clear();
  vi.useRealTimers();

  const requests = unmocked.splice(0);
  if (requests.length > 0) {
    throw new Error(
      `Requests with no mock (add a handler in tests/mocks):\n${requests.join("\n")}`,
    );
  }
});

afterAll(() => server.close());

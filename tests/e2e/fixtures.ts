import { test as base, expect } from "@playwright/test";
import { defineNetworkFixture, type NetworkFixture } from "@msw/playwright";
import { API_URL, fakeToken, scenario, type ScenarioName } from "../mocks";

export interface CapturedRequest {
  method: string;
  url: string;
  body: unknown;
}

interface Requests {
  // Requests the app sent to the backend, e.g. requests.to("POST", "/birth-profiles").
  to: (method: string, path: string) => CapturedRequest[];
}

interface Fixtures {
  // Which backend situation the test starts in.
  scenario: ScenarioName;
  // Whether the app starts with a live session.
  signedIn: boolean;
  // MSW network: network.use(...) overrides a response for this test only.
  network: NetworkFixture;
  requests: Requests;
  unmockedGuard: { stop: () => void };
  session: void;
  fixedClock: void;
}

export const FIXED_NOW = new Date("2026-01-15T12:00:00Z");

export const test = base.extend<Fixtures>({
  scenario: ["newAccount", { option: true }],
  signedIn: [true, { option: true }],

  // Fails the test if the app made a request that left its own origin without a mock.
  // Registered before the MSW routes, so it receives whatever MSW falls back on
  // (@msw/playwright calls route.fallback() for requests no handler matched).
  unmockedGuard: [
    async ({ context, baseURL }, use) => {
      const appOrigin = new URL(baseURL!).origin;
      const unmocked: string[] = [];
      let recording = true;
      await context.route("**/*", (route) => {
        const request = route.request();
        if (new URL(request.url()).origin === appOrigin) return route.fallback();
        if (recording) unmocked.push(`${request.method()} ${request.url()}`);
        return route.abort();
      });
      await use({ stop: () => (recording = false) });
      expect(unmocked, "requests with no mock (add a handler in tests/mocks)").toEqual([]);
    },
    { auto: true },
  ],

  network: [
    async ({ context, scenario: name, unmockedGuard }, use) => {
      // Depending on the guard registers its route first, so it runs after MSW's.
      const network = defineNetworkFixture({ context, handlers: scenario(name) });
      await network.enable();
      await use(network);
      // Requests still in flight when the test ends reach the guard once MSW is
      // disabled; they were mocked, so stop recording first.
      unmockedGuard.stop();
      await network.disable();
    },
    { auto: true },
  ],

  session: [
    async ({ context, signedIn }, use) => {
      if (signedIn) {
        await context.addInitScript((token) => {
          localStorage.setItem("token", token);
          localStorage.setItem("refresh", "test-refresh-token");
        }, fakeToken());
      }
      await use();
    },
    { auto: true },
  ],

  // Freezes Date only; timers keep running, so debounces and animations still work.
  fixedClock: [
    async ({ context }, use) => {
      await context.clock.setFixedTime(FIXED_NOW);
      await use();
    },
    { auto: true },
  ],

  requests: async ({ context }, use) => {
    const captured: CapturedRequest[] = [];
    context.on("request", (request) => {
      if (!request.url().startsWith(API_URL)) return;
      captured.push({
        method: request.method(),
        url: request.url(),
        body: request.postData() ? request.postDataJSON() : null,
      });
    });
    await use({
      to: (method, path) =>
        captured.filter((r) => r.method === method && new URL(r.url).pathname === path),
    });
  },
});

export { expect };

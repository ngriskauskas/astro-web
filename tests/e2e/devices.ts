import type { PlaywrightTestOptions } from "@playwright/test";

// The one place device sizes are defined. Each entry becomes a Playwright project,
// so every browser test runs once per size and is reported per size.
// To add a size (for example tablet: 768 x 1024), add an entry here.
export const deviceSizes: Record<string, PlaywrightTestOptions["viewport"] & object> = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
};

export const deviceOptions: Record<string, Partial<PlaywrightTestOptions>> = {
  phone: { viewport: deviceSizes.phone, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  desktop: { viewport: deviceSizes.desktop },
};

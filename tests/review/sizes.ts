// The screen sizes every feature's layout is reviewed at. Used only by the review
// capture; browser tests run at the two sizes in tests/e2e/devices.ts.
export const reviewSizes = {
  "small-phone": { width: 320, height: 568 },
  phone: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
  "large-monitor": { width: 1920, height: 1080 },
} as const;

export type ReviewSize = keyof typeof reviewSizes;

// Below this width the review emulates a touch device, as a phone browser would be.
export const TOUCH_BELOW = 768;

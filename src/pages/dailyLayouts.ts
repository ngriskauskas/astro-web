import { useState } from "react";
import { readChoice, writeChoice } from "../utils/storage";

// The three ways to arrange the Daily page. The cards are the same in each; only where they
// sit changes.
export const DAILY_LAYOUTS = [
  { id: "classic", label: "Classic", hint: "Wheel on the left, widgets on the right" },
  { id: "now", label: "Now", hint: "Current hour and Moon first, timeline beside them" },
  { id: "focus", label: "Focus", hint: "One column, top to bottom" },
  { id: "explore", label: "Explore", hint: "Now at the top, then tabs for today, the week, the chart and aspects" },
] as const;

export type DailyLayoutId = (typeof DAILY_LAYOUTS)[number]["id"];
export type DailyCard = "hour" | "timeline" | "wheel" | "moon" | "weekly" | "matrix" | "placements";

const LAYOUT_IDS: readonly DailyLayoutId[] = DAILY_LAYOUTS.map((layout) => layout.id);
const LAYOUT_KEY = "astro-daily-layout";
export const DEFAULT_DAILY_LAYOUT: DailyLayoutId = "now";

// `mobile` is the reading order on narrow screens. On wide screens the cards in `left` and
// `right` form two columns, and `bottom` runs across both. Focus ignores the columns.
export const DAILY_ARRANGEMENT: Record<
  Exclude<DailyLayoutId, "focus" | "explore">,
  { mobile: DailyCard[]; left: DailyCard[]; right: DailyCard[]; bottom: DailyCard[] }
> = {
  classic: {
    mobile: ["wheel", "hour", "timeline", "moon", "weekly", "matrix", "placements"],
    left: ["wheel", "matrix"],
    right: ["hour", "timeline", "moon", "weekly", "placements"],
    bottom: [],
  },
  now: {
    mobile: ["hour", "timeline", "wheel", "moon", "weekly", "placements", "matrix"],
    left: ["hour", "wheel", "moon"],
    right: ["timeline", "weekly", "placements"],
    bottom: ["matrix"],
  },
};

// Explore keeps the current hour above a set of tabs. Each tab holds the cards that answer
// one question, so the page shows one of them at a time.
export const EXPLORE_TABS = [
  { id: "today", label: "Today", cards: ["timeline", "moon"] },
  { id: "week", label: "This week", cards: ["weekly"] },
  { id: "chart", label: "Chart", cards: ["wheel", "placements"] },
  { id: "aspects", label: "Aspects", cards: ["matrix"] },
] as const;

export const FOCUS_ORDER: DailyCard[] = [
  "hour",
  "timeline",
  "wheel",
  "moon",
  "weekly",
  "matrix",
  "placements",
];

export const useDailyLayout = () => {
  const [layout, setLayout] = useState<DailyLayoutId>(() =>
    readChoice(LAYOUT_KEY, LAYOUT_IDS, DEFAULT_DAILY_LAYOUT),
  );

  const choose = (id: DailyLayoutId) => {
    setLayout(id);
    writeChoice(LAYOUT_KEY, id);
  };

  return [layout, choose] as const;
};

import { Fragment, useState } from "react";
import { Tabs } from "../components/utils/Tabs";
import { readChoice, writeChoice } from "../utils/storage";
import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { DescProvider } from "../contexts/DescContext";
import { PlanetaryHoursProvider } from "../contexts/PlanetaryHoursContext";
import { usePlanetaryHours } from "../hooks/usePlanetaryHours";
import { SingleWheelProvider } from "../contexts/SingleWheelContext";
import { ZodiacWheel } from "../components/wheel/ZodiacWheel";
import { PlacementsTable } from "../components/chart-views/PlacementsTable";
import { AspectMatrix } from "../components/chart-views/AspectMatrix";
import { DailyAscendantTimeline } from "../components/chart-views/DailyAscendantTimeline";
import { WeeklyTimingWidget } from "../components/chart-views/WeeklyTimingWidget";
import { MoonTimings } from "../components/chart-views/MoonTimings";
import { PlanetaryHourWidget } from "../components/chart-views/PlanetaryHourWidget";
import { AtAGlance } from "../components/chart-views/AtAGlance";
import { HoursToday, UpcomingHours } from "../components/chart-views/HoursToday";
import { AspectKey } from "../components/chart-views/AspectKey";
import {
  DAILY_ARRANGEMENT,
  DAILY_LAYOUTS,
  EXPLORE_TABS,
  FOCUS_ORDER,
  useDailyLayout,
  type DailyCard,
  type DailyLayoutId,
} from "./dailyLayouts";

const CARD = "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5";
// The timing widgets bring their own top rule and padding; inside a card they only need the content.
const WIDGET_CARD = `${CARD} [&>section]:border-0 [&>section]:py-0`;
// Tailwind only generates class names it finds written out in full, so the steps are listed here.
const ORDER = ["order-1", "order-2", "order-3", "order-4", "order-5", "order-6", "order-7"];

export const Daily = () => {
  const [layout, chooseLayout] = useDailyLayout();

  return (
    <SingleWheelProvider type="time">
      <DescProvider>
        <PlanetaryHoursProvider>
          <main className="mx-auto max-w-[1800px] px-3 pb-10 pt-4 sm:px-6 sm:pt-6">
            <DailyHeader layout={layout} onChange={chooseLayout} />
            <DailyCards layout={layout} />
          </main>
        </PlanetaryHoursProvider>
        <DescriptionSidePanel />
      </DescProvider>
    </SingleWheelProvider>
  );
};

const DailyHeader = ({
  layout,
  onChange,
}: {
  layout: DailyLayoutId;
  onChange: (layout: DailyLayoutId) => void;
}) => {
  const { now } = usePlanetaryHours();

  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">
          {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Today</h1>
      </div>
      <div
        role="group"
        aria-label="Layout"
        className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1"
      >
        {DAILY_LAYOUTS.map((item) => {
          const selected = layout === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              title={item.hint}
              onClick={() => onChange(item.id)}
              className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                selected ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

// Classic and Now are two columns on wide screens; below that the two column wrappers
// dissolve (display: contents) and the order classes give the reading order. Focus is one
// centred column in its own order.
const DailyCards = ({ layout }: { layout: DailyLayoutId }) => {
  if (layout === "explore") {
    return (
      <>
        <div className="mb-6 grid gap-6 lg:grid-cols-12 lg:items-stretch">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
            {renderCard("hour")}
            <div className={`${CARD} min-w-0`}>
              <UpcomingHours />
            </div>
          </div>
          <div className={`${CARD} min-w-0 lg:col-span-5`}>
            <AtAGlance />
          </div>
        </div>
        <ExploreTabs />
      </>
    );
  }
  if (layout === "focus") {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {FOCUS_ORDER.map((id) => (
          <Fragment key={id}>{renderCard(id)}</Fragment>
        ))}
      </div>
    );
  }

  const arrangement = DAILY_ARRANGEMENT[layout];
  const orderOf = (id: DailyCard) => ORDER[arrangement.mobile.indexOf(id)];

  return (
    <div className="flex flex-col gap-6 xl:grid xl:grid-cols-12 xl:items-start">
      <div className="contents xl:col-span-7 xl:flex xl:min-w-0 xl:flex-col xl:gap-6">
        {arrangement.left.map((id) => (
          <Fragment key={id}>{renderCard(id, orderOf(id))}</Fragment>
        ))}
      </div>
      <div className="contents xl:col-span-5 xl:flex xl:min-w-0 xl:flex-col xl:gap-6">
        {arrangement.right.map((id) => (
          <Fragment key={id}>{renderCard(id, orderOf(id))}</Fragment>
        ))}
      </div>
      {arrangement.bottom.map((id) => (
        <Fragment key={id}>{renderCard(id, `${orderOf(id)} xl:col-span-12`)}</Fragment>
      ))}
    </div>
  );
};

const TAB_KEY = "astro-daily-tab";
const TAB_IDS = EXPLORE_TABS.map((tab) => tab.id);

// The tab panels lay their cards out in columns of their own, so each tab can use the width.
const ExploreTabs = () => {
  const [selected, setSelected] = useState<string>(() => readChoice(TAB_KEY, TAB_IDS, EXPLORE_TABS[0].id));
  const choose = (id: string) => {
    setSelected(id);
    writeChoice(TAB_KEY, id);
  };

  return (
    <Tabs
      label="Daily views"
      tabs={EXPLORE_TABS}
      selected={selected}
      onSelect={choose}
      panels={{
        today: (
          <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
            <div className="flex min-w-0 flex-col gap-6">
              {renderCard("moon")}
              <div className={`${CARD} min-w-0`}>
                <HoursToday />
              </div>
            </div>
            {renderCard("timeline")}
          </div>
        ),
        week: renderCard("weekly"),
        chart: (
          <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
            <div className="xl:col-span-6">{renderCard("wheel")}</div>
            <div className="xl:col-span-6">{renderCard("placements")}</div>
          </div>
        ),
        aspects: (
          <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
            {renderCard("matrix", "xl:col-span-9")}
            <div className={`${CARD} min-w-0 xl:col-span-3`}>
              <AspectKey />
            </div>
          </div>
        ),
      }}
    />
  );
};

const renderCard = (id: DailyCard, className = "") => {
  switch (id) {
    case "hour":
      return (
        <div className={`${WIDGET_CARD} min-w-0 ${className}`}>
          <PlanetaryHourWidget />
        </div>
      );
    case "timeline":
      return (
        <div className={`${WIDGET_CARD} min-w-0 ${className}`}>
          <DailyAscendantTimeline />
        </div>
      );
    case "moon":
      return (
        <div className={`${WIDGET_CARD} min-w-0 ${className}`}>
          <MoonTimings />
        </div>
      );
    case "weekly":
      return (
        <div className={`${WIDGET_CARD} min-w-0 ${className}`}>
          <WeeklyTimingWidget />
        </div>
      );
    case "wheel":
      return (
        <section
          aria-labelledby="chart-heading"
          className={`${CARD} flex min-w-0 flex-col items-center ${className}`}
        >
          <h2 id="chart-heading" className="mb-4 self-start text-xl font-semibold">
            Zodiac Wheel
          </h2>
          <div className="w-full max-w-[650px]">
            <ZodiacWheel />
          </div>
        </section>
      );
    case "matrix":
      return (
        <section aria-labelledby="matrix-heading" className={`${CARD} min-w-0 ${className}`}>
          <h2 id="matrix-heading" className="mb-4 text-xl font-semibold">
            Aspect Matrix
          </h2>
          <AspectMatrix />
        </section>
      );
    case "placements":
      return (
        <section aria-labelledby="placements-heading" className={`${CARD} min-w-0 ${className}`}>
          <h2 id="placements-heading" className="mb-4 text-xl font-semibold">
            Placements
          </h2>
          <PlacementsTable />
        </section>
      );
  }
};

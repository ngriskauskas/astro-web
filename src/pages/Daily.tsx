import { Fragment, useState } from "react";
import { Tabs } from "../components/utils/Tabs";
import { readChoice, writeChoice } from "../utils/storage";
import { usePlanetaryHours } from "../hooks/usePlanetaryHours";
import {
  AscendantTodayWidget,
  AspectKeyWidget,
  AspectMatrixWidget,
  AtAGlanceWidget,
  HoursTodayWidget,
  MoonTimingsWidget,
  PlacementsWidget,
  PlanetaryHourWidget,
  UpcomingHoursWidget,
  WeeklyTimingsWidget,
  WidgetPage,
  WidgetRow,
  WidgetSplit,
  ZodiacWheelWidget,
} from "../components/widgets";
import {
  DAILY_ARRANGEMENT,
  DAILY_LAYOUTS,
  EXPLORE_TABS,
  FOCUS_ORDER,
  useDailyLayout,
  type DailyCard,
  type DailyLayoutId,
} from "./dailyLayouts";

// Tailwind only generates class names it finds written out in full, so the steps are listed here.
const ORDER = ["order-1", "order-2", "order-3", "order-4", "order-5", "order-6", "order-7"];

export const Daily = () => {
  const [layout, chooseLayout] = useDailyLayout();

  return (
    <WidgetPage chart="time">
      <DailyHeader layout={layout} onChange={chooseLayout} />
      <DailyCards layout={layout} />
    </WidgetPage>
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
    <header className="flex flex-wrap items-end justify-between gap-4">
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

// Classic and Now are two columns on wide screens; below that the columns dissolve and the
// order classes give the reading order. Focus is one centred column in its own order.
const DailyCards = ({ layout }: { layout: DailyLayoutId }) => {
  if (layout === "explore") {
    return (
      <>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
            {renderCard("hour")}
            <UpcomingHoursWidget />
          </div>
          <AtAGlanceWidget className="lg:col-span-5" />
        </div>
        <ExploreTabs />
      </>
    );
  }
  if (layout === "focus") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {FOCUS_ORDER.map((id) => (
          <Fragment key={id}>{renderCard(id)}</Fragment>
        ))}
      </div>
    );
  }

  const arrangement = DAILY_ARRANGEMENT[layout];
  const orderOf = (id: DailyCard) => ORDER[arrangement.mobile.indexOf(id)];
  const cards = (ids: DailyCard[], extra = "") =>
    ids.map((id) => <Fragment key={id}>{renderCard(id, `${orderOf(id)} ${extra}`)}</Fragment>);

  return (
    <WidgetSplit
      main={cards(arrangement.left)}
      side={cards(arrangement.right)}
      bottom={cards(arrangement.bottom, "xl:col-span-12")}
    />
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
          <WidgetRow>
            <div className="flex min-w-0 flex-col gap-6">
              {renderCard("moon")}
              <HoursTodayWidget />
            </div>
            {renderCard("timeline")}
          </WidgetRow>
        ),
        week: renderCard("weekly"),
        chart: (
          <WidgetRow>
            {renderCard("wheel")}
            {renderCard("placements")}
          </WidgetRow>
        ),
        aspects: (
          <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
            {renderCard("matrix", "xl:col-span-9")}
            <AspectKeyWidget className="xl:col-span-3" />
          </div>
        ),
      }}
    />
  );
};

const renderCard = (id: DailyCard, className = "") => {
  switch (id) {
    case "hour":
      return <PlanetaryHourWidget className={className} />;
    case "timeline":
      return <AscendantTodayWidget className={className} />;
    case "moon":
      return <MoonTimingsWidget className={className} />;
    case "weekly":
      return <WeeklyTimingsWidget className={className} />;
    case "wheel":
      return <ZodiacWheelWidget className={className} />;
    case "matrix":
      return <AspectMatrixWidget className={className} />;
    case "placements":
      return <PlacementsWidget className={className} />;
  }
};

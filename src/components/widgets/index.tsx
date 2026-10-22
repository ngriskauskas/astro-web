import type { ReactNode } from "react";
import { AspectKey } from "../chart-views/AspectKey";
import { AspectMatrix } from "../chart-views/AspectMatrix";
import { AtAGlance } from "../chart-views/AtAGlance";
import { DailyAscendantTimeline } from "../chart-views/DailyAscendantTimeline";
import { HoursToday, UpcomingHours } from "../chart-views/HoursToday";
import { MoonTimings } from "../chart-views/MoonTimings";
import { MultiAspectMatrix } from "../chart-views/MultiAspectMatrix";
import { NatalSnapshot } from "../chart-views/NatalSnapshot";
import { PlacementsTable } from "../chart-views/PlacementsTable";
import { PlanetaryHourWidget as PlanetaryHour } from "../chart-views/PlanetaryHourWidget";
import { TransitPlacements } from "../chart-views/TransitPlacements";
import { WeeklyTimingWidget } from "../chart-views/WeeklyTimingWidget";
import { MultiZodiacWheel } from "../wheel/MultiZodiacWheel";
import { ZodiacWheel } from "../wheel/ZodiacWheel";
import { ZodiacWheelSettings } from "../wheel/ZodiacWheelSettings";
import { ChartScope, type ChartKind } from "./scopes";
import { Widget, type WidgetProps } from "./Widget";

// The widget library. Each widget is a self-contained card: it draws its own frame, loads
// the data it needs, and opens the same description drawer as every other widget. A page
// only decides which widgets to place and where.
//
//   <WidgetPage chart="time">
//     <WidgetSplit main={<MoonTimingsWidget />} side={<AscendantTodayWidget />} />
//   </WidgetPage>
//
// Widgets read the chart their page shares (see WidgetPage). A widget that cannot show that
// chart brings its own, so any widget works on any page.

const SINGLE_CHARTS: readonly ChartKind[] = ["natal", "time", "moment"];
const TWO_CHARTS: readonly ChartKind[] = ["transit", "synastry"];
const ANY_CHART: readonly ChartKind[] = [...SINGLE_CHARTS, ...TWO_CHARTS];

const scoped =
  (accepts: readonly ChartKind[], fallback: ChartKind) =>
  <P extends object>(Body: (props: P) => ReactNode) =>
  (props: P) => (
    <ChartScope accepts={accepts} fallback={fallback}>
      <Body {...props} />
    </ChartScope>
  );

// --- Sky: what the heavens are doing now -------------------------------------------------

export const AtAGlanceWidget = scoped(["time"], "time")(AtAGlance);
export const MoonTimingsWidget = scoped(["time"], "time")(MoonTimings);
export const PlanetaryHourWidget = scoped(ANY_CHART, "time")(PlanetaryHour);
export const HoursTodayWidget = scoped(ANY_CHART, "time")(HoursToday);
export const UpcomingHoursWidget = scoped(ANY_CHART, "time")(UpcomingHours);
// Timings follow the shared chart: the sky itself, or the sky against a birth chart.
export const AscendantTodayWidget = scoped(["time", "transit"], "time")(DailyAscendantTimeline);
export const WeeklyTimingsWidget = scoped(["time", "transit"], "time")(WeeklyTimingWidget);

// --- Natal: a birth chart ------------------------------------------------------------------

export const NatalSnapshotWidget = scoped(["natal"], "natal")(NatalSnapshot);

// --- Chart: the wheel, its aspects and placements, for whichever chart the page shares ----

export const ZodiacWheelWidget = scoped(SINGLE_CHARTS, "natal")(
  ({
    title = "Zodiac Wheel",
    headingLevel = 2,
    className,
  }: WidgetProps & { title?: string; headingLevel?: 1 | 2 }) => (
    <Widget id="chart" title={title} headingLevel={headingLevel} className={className}>
      <div className="mx-auto w-full max-w-[650px]">
        <ZodiacWheel />
      </div>
    </Widget>
  ),
);

export const AspectMatrixWidget = scoped(SINGLE_CHARTS, "natal")(
  ({ className }: WidgetProps) => (
    <Widget id="matrix" title="Aspect Matrix" className={className}>
      <AspectMatrix />
    </Widget>
  ),
);

export const AspectKeyWidget = AspectKey;

export const PlacementsWidget = scoped(SINGLE_CHARTS, "natal")(({ className }: WidgetProps) => (
  <Widget id="placements" title="Placements" className={className}>
    <PlacementsTable />
  </Widget>
));

export const ChartSettingsWidget = scoped(ANY_CHART, "natal")(({ className }: WidgetProps) => (
  <Widget id="settings" title="Chart Settings" className={className}>
    <ZodiacWheelSettings className="space-y-6 p-0 text-xs" />
  </Widget>
));

// --- Two charts: transits and synastry -------------------------------------------------------

export const TwoChartWheelWidget = scoped(TWO_CHARTS, "transit")(
  ({
    title,
    headingLevel = 2,
    className,
  }: WidgetProps & { title: string; headingLevel?: 1 | 2 }) => (
    <Widget id="chart" title={title} headingLevel={headingLevel} className={className}>
      <div className="mx-auto w-full max-w-[720px]">
        <MultiZodiacWheel />
      </div>
    </Widget>
  ),
);

export const TwoChartMatrixWidget = scoped(TWO_CHARTS, "transit")(
  ({ title = "Aspect Matrix", className }: WidgetProps & { title?: string }) => (
    <Widget id="matrix" title={title} className={className}>
      <MultiAspectMatrix />
    </Widget>
  ),
);

export const TwoChartPlacementsWidget = scoped(TWO_CHARTS, "transit")(TransitPlacements);

// --- Navigation ---------------------------------------------------------------------------------

export { QuickLinks as QuickLinksWidget } from "./QuickLinks";
export { Widget, WidgetLink, WidgetViewSwitch, type WidgetProps, type WidgetTone } from "./Widget";
export { WidgetPage, WidgetRow, WidgetSplit } from "./layout";
export { ChartScope, type ChartKind } from "./scopes";

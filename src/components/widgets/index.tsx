import { useState, type ReactNode } from "react";
import { AspectKey } from "../chart-views/AspectKey";
import { AspectMatrix } from "../chart-views/AspectMatrix";
import { AtAGlance } from "../chart-views/AtAGlance";
import { ChartRuler } from "../chart-views/ChartRuler";
import { DignitiesBoard } from "../chart-views/Dignities";
import { HemispheresBoard } from "../chart-views/Hemispheres";
import { DailyAscendantTimeline } from "../chart-views/DailyAscendantTimeline";
import { HoursToday, UpcomingHours } from "../chart-views/HoursToday";
import { HousesTable } from "../chart-views/HousesTable";
import { MoonTimings } from "../chart-views/MoonTimings";
import { MultiAspectMatrix } from "../chart-views/MultiAspectMatrix";
import { NatalSnapshot } from "../chart-views/NatalSnapshot";
import { NatalSummary, TightestAspects } from "../chart-views/NatalSummary";
import { PlanetInChart } from "../chart-views/PlanetInChart";
import { PlanetReturns } from "../chart-views/PlanetReturns";
import { PlacementsTable } from "../chart-views/PlacementsTable";
import { PlanetaryHourWidget as PlanetaryHour } from "../chart-views/PlanetaryHourWidget";
import { TransitPlacements } from "../chart-views/TransitPlacements";
import { WeeklyTimingWidget } from "../chart-views/WeeklyTimingWidget";
import { MultiZodiacWheel } from "../wheel/MultiZodiacWheel";
import { ZodiacWheel } from "../wheel/ZodiacWheel";
import { ZodiacWheelSettings } from "../wheel/ZodiacWheelSettings";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { ChartScope, type ChartKind } from "./scopes";
import { Widget, WidgetDisclosure, type WidgetProps } from "./Widget";

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

// The chart's shape at a glance: element and modality balance and the tightest aspects. It
// reads whichever single chart the page shares: a birth chart, the sky now, or a chosen moment.
const ChartSummaryCard = ({ className }: WidgetProps) => (
  <Widget id="chart-summary" title="Summary" className={className}>
    <NatalSummary />
  </Widget>
);

export const ChartSummaryWidget = scoped(SINGLE_CHARTS, "time")(ChartSummaryCard);

export const HousesWidget = scoped(SINGLE_CHARTS, "natal")(({ className }: WidgetProps) => (
  <Widget id="houses" title="Houses" className={className}>
    <HousesTable />
  </Widget>
));

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

// The planets shown first when placements are summarised: the luminaries, Venus, Mars and
// the two social planets that most readings start from.
const KEY_PLACEMENT_PLANETS: readonly PlanetName[] = [
  "SUN",
  "MOON",
  "VENUS",
  "MARS",
  "JUPITER",
  "SATURN",
];

const PlacementsCard = ({ className, summary }: WidgetProps & { summary: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const collapsed = summary && !expanded;
  return (
    <Widget id="placements" title="Placements" className={className}>
      <div id="placements-table">
        <PlacementsTable planets={collapsed ? KEY_PLACEMENT_PLANETS : undefined} />
      </div>
      {summary && (
        <WidgetDisclosure
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
          controls="placements-table"
          collapsedLabel="Show all placements"
          expandedLabel="Show key placements"
        />
      )}
    </Widget>
  );
};

export const PlacementsWidget = scoped(SINGLE_CHARTS, "natal")(
  ({ className, summary = false }: WidgetProps & { summary?: boolean }) => (
    <PlacementsCard className={className} summary={summary} />
  ),
);

// A planet's returns and its place in this chart, as widgets: the planet drawer shows the same
// two sections.
export const PlanetReturnsWidget = ({ planet, className }: WidgetProps & { planet: PlanetName }) => (
  <Widget id="planet-returns" title={`${PlanetsData[planet].displayName} returns`} className={className}>
    <PlanetReturns planet={planet} />
  </Widget>
);

export const PlanetInChartWidget = scoped(SINGLE_CHARTS, "natal")(
  ({ planet, className }: WidgetProps & { planet: PlanetName }) => (
    <Widget id="planet-in-chart" title={`${PlanetsData[planet].displayName} in this chart`} className={className}>
      <PlanetInChart planetName={planet} />
    </Widget>
  ),
);

// The chart's shape: who rules it, which planets are strong or weak, and which half and quarter
// hold its placements. Each one reads the shared chart, so each works on a birth chart, the sky
// now or a chosen moment.
export const ChartRulerWidget = scoped(SINGLE_CHARTS, "natal")(({ className }: WidgetProps) => (
  <Widget id="chart-ruler" title="Chart ruler" className={className}>
    <ChartRuler />
  </Widget>
));

export const DignitiesWidget = scoped(SINGLE_CHARTS, "natal")(({ className }: WidgetProps) => (
  <Widget id="dignities" title="Dignities" className={className}>
    <DignitiesBoard />
  </Widget>
));

export const HemispheresWidget = scoped(SINGLE_CHARTS, "natal")(({ className }: WidgetProps) => (
  <Widget id="hemispheres" title="Hemispheres and quadrants" className={className}>
    <HemispheresBoard />
  </Widget>
));

export const KeyAspectsWidget = scoped(SINGLE_CHARTS, "natal")(
  ({ className, limit = 6 }: WidgetProps & { limit?: number }) => (
    <Widget id="key-aspects" title="Key aspects" className={className}>
      <TightestAspects limit={limit} headingId="key-aspects-heading" />
    </Widget>
  ),
);

export const ChartSettingsWidget = scoped(ANY_CHART, "natal")(({ className }: WidgetProps) => (
  <Widget id="settings" title="Chart Settings" hideTitle className={className}>
    <ZodiacWheelSettings className="space-y-3 p-0 text-xs" />
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
export {
  Widget,
  WidgetDisclosure,
  WidgetLink,
  WidgetViewSwitch,
  type WidgetProps,
  type WidgetTone,
} from "./Widget";
export { WidgetPage, WidgetRow, WidgetSplit } from "./layout";
export { ChartScope, type ChartKind } from "./scopes";

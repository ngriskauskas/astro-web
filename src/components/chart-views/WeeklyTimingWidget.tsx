import { useState } from "react";
import { useCurrentTimings } from "../../hooks/timings/useTimings";
import { Widget, WidgetDisclosure, WidgetViewSwitch, type WidgetProps } from "../widgets/Widget";
import { WeeklyPlanetaryTimeline } from "./WeeklyPlanetaryTimeline";
import { WeeklyPlanetaryTimings } from "./WeeklyPlanetaryTimings";

type WeeklyTimingView = "grouped" | "timeline";

const VIEWS = [
  { id: "grouped", label: "By day" },
  { id: "timeline", label: "Timeline" },
] as const;

// Today and this many days after it, when the week is shown collapsed.
const COLLAPSED_UPCOMING_DAYS = 3;

export const WeeklyTimingWidget = ({
  className,
  link,
  summary = false,
}: WidgetProps & { link?: { to: string; label: string }; summary?: boolean }) => {
  const [view, setView] = useState<WeeklyTimingView>("grouped");
  const [expanded, setExpanded] = useState(false);
  const timingResult = useCurrentTimings({ filterKeyAngleAspects: true });
  const collapsed = summary && !expanded;

  return (
    <Widget
      id="weekly"
      title="Weekly Timings"
      tone="weekly"
      className={className}
      link={link}
      actions={
        <WidgetViewSwitch
          label="Weekly timing view"
          value={view}
          options={VIEWS}
          onChange={setView}
        />
      }
    >
      <div id="weekly-days">
        {view === "grouped" ? (
          <WeeklyPlanetaryTimings
            {...timingResult}
            embedded
            upcomingDays={collapsed ? COLLAPSED_UPCOMING_DAYS : undefined}
          />
        ) : (
          <WeeklyPlanetaryTimeline {...timingResult} embedded />
        )}
      </div>
      {summary && view === "grouped" && (
        <WidgetDisclosure
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
          controls="weekly-days"
          collapsedLabel="Show the whole week"
          expandedLabel="Show today and the next two days"
        />
      )}
    </Widget>
  );
};

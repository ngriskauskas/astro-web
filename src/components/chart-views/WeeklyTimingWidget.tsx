import { useState } from "react";
import { useCurrentTimings } from "../../hooks/timings/useTimings";
import { Widget, WidgetViewSwitch, type WidgetProps } from "../widgets/Widget";
import { WeeklyPlanetaryTimeline } from "./WeeklyPlanetaryTimeline";
import { WeeklyPlanetaryTimings } from "./WeeklyPlanetaryTimings";

type WeeklyTimingView = "grouped" | "timeline";

const VIEWS = [
  { id: "grouped", label: "By day" },
  { id: "timeline", label: "Timeline" },
] as const;

export const WeeklyTimingWidget = ({
  className,
  link,
}: WidgetProps & { link?: { to: string; label: string } }) => {
  const [view, setView] = useState<WeeklyTimingView>("grouped");
  const timingResult = useCurrentTimings({ filterKeyAngleAspects: true });

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
      {view === "grouped" ? (
        <WeeklyPlanetaryTimings {...timingResult} embedded />
      ) : (
        <WeeklyPlanetaryTimeline {...timingResult} embedded />
      )}
    </Widget>
  );
};

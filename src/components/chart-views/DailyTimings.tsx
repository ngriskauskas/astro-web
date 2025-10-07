import { useDesc } from "../../contexts/DescContext";
import {
  useDailyTimings,
  type DailyAspectTiming,
  type KeyAngleTiming,
} from "../../hooks/timings/useDailyTimings";
import { DailyAspectPreview } from "../descriptions/DailyAspectTimingPanel";
import { KeyAnglePreview } from "../descriptions/KeyAngleTimingPanel";
import { Timeline } from "../timeline/Timeline";
import type { TimelineEvent } from "../timeline/types";
import { Spinner } from "../utils/Spinner";
import { CollapsibleSection } from "./CurrentTimings";

const splitByTime = <T extends { start_time: string; end_time: string }>(
  items: T[],
) => {
  const now = new Date();
  const current: T[] = [];

  items.forEach((item) => {
    const start = new Date(item.start_time);
    const end = new Date(item.end_time);

    if (start <= now && now <= end) current.push(item);
  });

  return current;
};

export const DailyTimings = () => {
  const {
    timings: { daily_aspects, key_angles },
    loading,
  } = useDailyTimings();

  const currentKeyAngles = splitByTime(key_angles);
  const currentAspects = splitByTime(daily_aspects);

  const keyAngleEvents = keyAnglesToEvents(key_angles);
  const dailyAspectEvents = dailyAspectsToEvents(daily_aspects);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4 ml-4 pb-4">
      <h2 className="font-semibold text-lg">Current</h2>
      {currentKeyAngles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-fit">
          {currentKeyAngles.map((k, i) => (
            <KeyAnglePreview key={i} timing={k} />
          ))}
        </div>
      )}
      {currentAspects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-fit">
          {currentAspects.map((a, i) => (
            <DailyAspectPreview key={i} aspect={a} />
          ))}
        </div>
      )}

      <div className="mt-7">
        <h2 className="font-semibold text-lg">Timeline</h2>
        <Timeline events={[...keyAngleEvents, ...dailyAspectEvents]} />
      </div>
    </div>
  );
};

const keyAnglesToEvents = (keyAngles: KeyAngleTiming[]): TimelineEvent[] =>
  keyAngles.map((ka) => ({
    start: new Date(ka.start_time),
    end: new Date(ka.end_time),
    renderPreview: () => <KeyAnglePreview timing={ka} />,
  }));

const dailyAspectsToEvents = (aspects: DailyAspectTiming[]): TimelineEvent[] =>
  aspects.map((aspect) => ({
    start: new Date(aspect.start_time),
    end: new Date(aspect.end_time),
    renderPreview: () => <DailyAspectPreview aspect={aspect} />,
  }));

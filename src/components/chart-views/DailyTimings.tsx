import { useDailyTimings } from "../../hooks/timings/useDailyTimings";
import type { AngleTiming, AspectTiming } from "../../types/timings";
import { DailyAspectEventPreview } from "../descriptions/DailyAspectTimingPanel";
import { DailyAnglePreview } from "../descriptions/KeyAngleTimingPanel";
import { Timeline } from "../timeline/Timeline";
import type { TimelineEvent } from "../timeline/types";
import { Spinner } from "../utils/Spinner";

export const DailyTimings = () => {
  const { timings, loading } = useDailyTimings();

  if (loading) return <Spinner />;

  const { aspects, angleTimings } = timings;
  const now = new Date();
  const currentAspects = aspects.filter(
    (aspect) =>
      new Date(aspect.startAspect.dateTime) <= now && now <= new Date(aspect.endAspect.dateTime),
  );
  const aspectEvents = dailyAspectsToEvents(aspects);
  const angleEvents = dailyAnglesToEvents(angleTimings);

  return (
    <div className="space-y-4 ml-4 pb-4">
      <h2 className="font-semibold text-lg">Current</h2>
      {currentAspects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-fit">
          {currentAspects.map((aspect, index) => (
            <DailyAspectEventPreview
              key={index}
              timing={aspect}
              dateTime={aspect.startAspect.dateTime}
              eventType="start"
            />
          ))}
        </div>
      )}

      <div className="mt-7">
        <h2 className="font-semibold text-lg">Timeline</h2>
        <Timeline events={[...angleEvents, ...aspectEvents]} />
      </div>
    </div>
  );
};

const dailyAnglesToEvents = (angles: AngleTiming[]): TimelineEvent[] =>
  angles.map((timing) => ({
    start: new Date(timing.dateTime),
    renderPreview: () => <DailyAnglePreview timing={timing} />,
  }));

const dailyAspectsToEvents = (aspects: AspectTiming[]): TimelineEvent[] =>
  aspects.flatMap((timing) => [
    {
      start: new Date(timing.startAspect.dateTime),
      renderPreview: () => (
        <DailyAspectEventPreview
          timing={timing}
          dateTime={timing.startAspect.dateTime}
          eventType="start"
        />
      ),
    },
    ...timing.exactDateRanges.map((exact) => ({
      start: new Date(exact.dateTime),
      renderPreview: () => (
        <DailyAspectEventPreview timing={timing} dateTime={exact.dateTime} eventType="exact" />
      ),
    })),
    {
      start: new Date(timing.endAspect.dateTime),
      renderPreview: () => (
        <DailyAspectEventPreview
          timing={timing}
          dateTime={timing.endAspect.dateTime}
          eventType="end"
        />
      ),
    },
  ]);

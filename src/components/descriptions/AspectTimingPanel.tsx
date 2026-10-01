import { Section } from "../utils/Section";
import { BackButton, CloseButton } from "./Helpers";
import { AspectChip } from "../utils/AspectChip";
import { useDesc } from "../../contexts/DescContext";
import { DateTimeChip } from "../utils/DateChip";
import type { Aspect } from "../../types/aspect";
import type { AspectTiming, TimingEvent } from "../../types/timings";
import { AspectData } from "../../types/aspect";
import { TimingAspectTitle } from "../utils/TimingAspectTitle";
import { TimingChipRow } from "./DailyAspectTimingPanel";
import { useWheel } from "../../hooks/useWheel";
import { getLocalISODateTime } from "../../utils/funcs";
import { useTimingAspectDesc } from "../../hooks/descriptions/useAspectDesc";

type AspectEvent = Extract<TimingEvent, { type: "aspect" }>;

const getEventAspect = (event: AspectEvent): AspectTiming["aspect"] => {
  if (event.event === "start") return event.data.startAspect.aspect;
  if (event.event === "end") return event.data.endAspect.aspect;

  return (
    event.data.exactDateRanges.find((snapshot) => snapshot.dateTime === event.date)?.aspect ??
    event.data.aspect
  );
};

export const AspectTimingPanel = ({ event }: { event: AspectEvent }) => {
  const aspect = event.data;
  const selectedAspect = getEventAspect(event);
  const aspectInfo = AspectData[selectedAspect.type];
  const { loading: descriptionLoading, aspectDesc } = useTimingAspectDesc({
    aspect: selectedAspect,
    timeScale: "LONG_TERM",
  });
  const wheel = useWheel();
  const chartAspects = "chartAspects" in wheel ? wheel.chartAspects : [];
  const currentAspect = getCurrentAspect(aspect, chartAspects);
  const currentDateTime = getLocalISODateTime();
  const timedAspects = [
    { label: "Start", value: aspect.startAspect },
    ...aspect.exactDateRanges.map((value, index) => ({
      label: `Exact${aspect.exactDateRanges.length > 1 ? ` ${index + 1}` : ""}`,
      value,
    })),
    { label: "End", value: aspect.endAspect },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        <BackButton />
        <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
          <TimingAspectTitle aspect={selectedAspect} />
        </h2>
        <CloseButton />
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{aspectInfo.glyph}</span>
            <span className="font-semibold">{aspectInfo.name}</span>
          </div>
          <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
            {aspectInfo.description}
          </div>
        </Section>
        <Section title="Times">
          <div className="space-y-6 text-xs text-gray-700">
            {currentAspect ? (
              <TimingChipRow
                label="Current"
                aspect={currentAspect}
                dateTime={currentDateTime}
                showDate
              />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Current</span>
                  <DateTimeChip datetime={currentDateTime} format />
                </div>
                <span className="text-gray-500">Not currently in orb</span>
              </div>
            )}
            {timedAspects.map(({ label, value }) => (
              <TimingChipRow
                key={`${label}-${value.dateTime}`}
                label={label}
                aspect={value.aspect}
                dateTime={value.dateTime}
                showDate
              />
            ))}
          </div>
        </Section>
        <Section title="Details" loading={descriptionLoading}>
          <p className="text-sm text-gray-600">
            {selectedAspect.motion.toLowerCase()}, orb {selectedAspect.orb.toFixed(2)}°
          </p>
          {aspectDesc.description && (
            <p className="text-sm text-gray-600 mt-2">{aspectDesc.description}</p>
          )}
        </Section>
      </div>
    </div>
  );
};

const getCurrentAspect = (timing: AspectTiming, chartAspects: Aspect[]): Aspect | undefined => {
  return chartAspects.find(
    (current) => current.type === timing.aspect.type && sameAspectPoints(current, timing.aspect),
  );
};

const sameAspectPoints = (current: Aspect, target: AspectTiming["aspect"]) => {
  const samePoint = (left: Aspect["point1"], right: Aspect["point1"]) =>
    left.type === right.type && left.value.name === right.value.name;

  return (
    (samePoint(current.point1, target.point1) && samePoint(current.point2, target.point2)) ||
    (samePoint(current.point1, target.point2) && samePoint(current.point2, target.point1))
  );
};
export const AspectPreview = ({
  aspect,
  showLabel = true,
}: {
  aspect: AspectEvent;
  showLabel?: boolean;
}) => {
  const { open } = useDesc();

  const data = getEventAspect(aspect);

  const eventLabel =
    aspect.event === "start" ? "starts" : aspect.event === "end" ? "ends" : "exact";

  return (
    <div
      className="rounded-lg border bg-white shadow-sm p-1 flex flex-col gap-1 min-w-[160px]
                cursor-pointer"
      onClick={() => open({ type: "aspectTiming", value: aspect })}
    >
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-1">
          <AspectChip aspect={data} showSign showPlanetName={false} />
          {showLabel && <span className="text-xs font-semibold text-gray-500">{eventLabel}</span>}
        </div>
      </div>
    </div>
  );
};

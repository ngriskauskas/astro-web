import { Section } from "../utils/Section";
import { BackButton, CloseButton } from "./Helpers";
import { AspectChip } from "../utils/AspectChip";
import type { AspectTiming } from "../../types/timings";
import { useDesc } from "../../contexts/DescContext";
import { DateTimeChip, TimeChip } from "../utils/DateChip";
import { AspectData } from "../../types/aspect";
import type { Aspect, AspectPoint } from "../../types/aspect";
import { isMulti, useWheel } from "../../hooks/useWheel";
import { useChartSettings } from "../../contexts/ChartSettingsContext";
import type { AspectOptions } from "../../types/astrologySettings";
import { getLocalISODateTime } from "../../utils/funcs";
import { TimingAspectTitle } from "../utils/TimingAspectTitle";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useTimingAspectDesc } from "../../hooks/descriptions/useAspectDesc";

export const DailyAspectTimingPanel = ({ timing }: { timing: AspectTiming }) => {
  const aspectInfo = AspectData[timing.aspect.type];
  const wheel = useWheel();
  const isTransitDailyTiming = wheel.type === "transit";
  const { loading: descriptionLoading, aspectDesc } = useTimingAspectDesc({
    aspect: timing.aspect,
    timeScale: "DAILY",
    relationship: isTransitDailyTiming ? "CURRENT" : undefined,
    firstOwner: isTransitDailyTiming ? "other" : undefined,
    secondOwner: isTransitDailyTiming ? "other" : undefined,
  });
  const {
    settings: { aspectOptions },
  } = useChartSettings();
  const currentAspect = isMulti(wheel)
    ? getCurrentMultiAscAspect({
        timing,
        chartAspects: wheel.chartAspects,
        aspectOptions,
        ascendantOwner: wheel.type === "transit" ? "other" : "main",
      })
    : getCurrentAscAspect({ timing, chartAspects: wheel.chartAspects, aspectOptions });
  const currentDateTime = getLocalISODateTime();
  const timedAspects = [
    { label: "Start", value: timing.startAspect },
    ...timing.exactDateRanges.map((value, index) => ({
      label: `Exact${timing.exactDateRanges.length > 1 ? ` ${index + 1}` : ""}`,
      value,
    })),
    { label: "End", value: timing.endAspect },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
        <BackButton />
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TimingAspectTitle aspect={timing.aspect} />
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
            <div className="space-y-1">
              {currentAspect ? (
                <TimingChipRow label="Current" aspect={currentAspect} dateTime={currentDateTime} />
              ) : (
                <>
                  <TimingLabel label="Current" dateTime={currentDateTime} />
                  <span className="block text-gray-500">Not currently in orb</span>
                </>
              )}
            </div>
            {timedAspects.map(({ label, value }) => (
              <TimingChipRow
                key={`${label}-${value.dateTime}`}
                label={label}
                aspect={value.aspect}
                dateTime={value.dateTime}
              />
            ))}
          </div>
        </Section>
        <Section title="Details" loading={descriptionLoading}>
          <p className="text-sm text-gray-600">
            {timing.aspect.motion.toLowerCase()}, orb {timing.aspect.orb.toFixed(2)}°
          </p>
          {aspectDesc.description && (
            <p className="text-sm text-gray-600 mt-2">{aspectDesc.description}</p>
          )}
        </Section>
      </div>
    </div>
  );
};

export const TimingChipRow = ({
  label,
  aspect,
  dateTime,
  showDate = false,
}: {
  label: string;
  aspect: AspectTiming["aspect"];
  dateTime: string;
  showDate?: boolean;
}) => (
  <div className="space-y-1">
    <TimingLabel label={label} dateTime={dateTime} showDate={showDate} />
    <div className="w-fit max-w-full">
      <AspectChip aspect={aspect} showSign />
    </div>
  </div>
);

const TimingLabel = ({
  label,
  dateTime,
  showDate = false,
}: {
  label: string;
  dateTime: string;
  showDate?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <span className="font-medium">{label}</span>
    {showDate ? <DateTimeChip datetime={dateTime} format /> : <TimeChip datetime={dateTime} />}
  </div>
);

const getCurrentAscAspect = ({
  timing,
  chartAspects,
  aspectOptions,
}: {
  timing: AspectTiming;
  chartAspects: SingleWheelContextType["chartAspects"];
  aspectOptions: AspectOptions;
}): Aspect | undefined => {
  const planetName = getAscendantPlanetName(timing.aspect);
  const options = aspectOptions[timing.aspect.type];
  if (!planetName || !options.show) return undefined;

  return chartAspects.find(
    (aspect) =>
      aspect.type === timing.aspect.type &&
      aspect.orb <= options.minOrb &&
      hasAscendantPlanetPoints(aspect, planetName),
  );
};

const getCurrentMultiAscAspect = ({
  timing,
  chartAspects,
  aspectOptions,
  ascendantOwner,
}: {
  timing: AspectTiming;
  chartAspects: Aspect[];
  aspectOptions: AspectOptions;
  ascendantOwner: "main" | "other";
}): Aspect | undefined => {
  const planetName = getAscendantPlanetName(timing.aspect);
  const options = aspectOptions[timing.aspect.type];
  if (!planetName || !options.show) return undefined;

  return chartAspects.find((aspect) => {
    if (aspect.type !== timing.aspect.type || aspect.orb > options.minOrb) return false;

    const point1Owner = aspect.point1Owner ?? "main";
    const point2Owner = point1Owner === "main" ? "other" : "main";
    const ascendantIsPoint1 = aspect.point1.type === "Angle";
    const ascendant = ascendantIsPoint1 ? aspect.point1 : aspect.point2;
    const planet = ascendantIsPoint1 ? aspect.point2 : aspect.point1;
    const owner = ascendantIsPoint1 ? point1Owner : point2Owner;

    return (
      ascendant.type === "Angle" &&
      ascendant.value.name === "ASC" &&
      owner === ascendantOwner &&
      planet.type === "Planet" &&
      planet.value.name === planetName
    );
  });
};

const getAscendantPlanetName = (aspect: Aspect): string | undefined => {
  const planetPoint =
    aspect.point1.type === "Planet"
      ? aspect.point1
      : aspect.point2.type === "Planet"
        ? aspect.point2
        : undefined;
  const hasAscendant =
    (aspect.point1.type === "Angle" && aspect.point1.value.name === "ASC") ||
    (aspect.point2.type === "Angle" && aspect.point2.value.name === "ASC");

  return planetPoint && hasAscendant ? planetPoint.value.name : undefined;
};

const hasAscendantPlanetPoints = (aspect: Aspect, planetName: string) => {
  const isAscendant = (point: AspectPoint) => point.type === "Angle" && point.value.name === "ASC";
  const isPlanet = (point: AspectPoint) =>
    point.type === "Planet" && point.value.name === planetName;

  return (
    (isPlanet(aspect.point1) && isAscendant(aspect.point2)) ||
    (isAscendant(aspect.point1) && isPlanet(aspect.point2))
  );
};

export const DailyAspectEventPreview = ({
  timing,
  dateTime,
  eventType,
}: {
  timing: AspectTiming;
  dateTime: string;
  eventType: "start" | "exact" | "end";
}) => {
  const { open } = useDesc();
  const start = new Date(dateTime);
  const time = start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className="flex items-center gap-1 px-1 py-0.5 rounded-md border border-green-300 bg-green-50/30 shadow-sm text-[10px] cursor-pointer transition-all duration-150 hover:shadow-md hover:border-green-400"
      onClick={() => open({ type: "dailyAspectTiming", value: timing })}
    >
      <span className="text-gray-700 font-mono text-xs">{time}</span>
      <AspectChip aspect={timing.aspect} showSign showPlanetName={false} />
      <span className="text-gray-500 capitalize">{eventType}</span>
    </div>
  );
};

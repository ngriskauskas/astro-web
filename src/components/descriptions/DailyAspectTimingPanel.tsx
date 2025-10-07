import { Section } from "../utils/Section";
import { BackButton, CloseButton } from "./Helpers";
import { AspectChip } from "../utils/AspectChip";
import { SignChip, SignCircle } from "../utils/SignChip";
import type { DailyAspectTiming } from "../../hooks/timings/useDailyTimings";
import { useDesc } from "../../contexts/DescContext";
import { TimeChip } from "../utils/DateChip";
import { AspectData } from "../../types/aspect";
import { useAspectDesc } from "../../hooks/descriptions/useAspectDesc";
import { PlanetsData, type PlanetName } from "../../types/planet";

export const DailyAspectTimingPanel = ({
  timing,
}: {
  timing: DailyAspectTiming;
}) => {
  const aspectInfo = AspectData[timing.aspect_type];
  const { loading, aspectDesc } = useAspectDesc({
    aspect: timing.aspect_type,
    planet1: { name: timing.angle_type, sign: timing.sign },
    planet2: { name: timing.planet, sign: timing.sign },
  });
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
        <BackButton />
        <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
          <div>
            <span className="inline-block font-mono tracking-tight">
              <span className="capitalize">{timing.angle_type.charAt(0)}</span>
              <span className="relative -top-1 text-xs">
                {timing.angle_type.slice(1)}
              </span>
            </span>
          </div>

          <span className="text-xl">{aspectInfo.glyph}</span>

          <div>
            <span className="text-xl mr-1">
              {PlanetsData[timing.planet as PlanetName].glyph}
            </span>
            <span className="capitalize">{timing.planet}</span>
          </div>
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
          <div className="text-xs text-gray-700 flex flex-col gap-3">
            <div>
              Start: <TimeChip datetime={timing.start_time} />
            </div>
            <div>
              End: <TimeChip datetime={timing.end_time} />
            </div>
          </div>
        </Section>

        <Section title="Details" loading={loading}>
          <div className="flex items-center gap-2">
            <AspectChip
              aspect={{
                type: timing.aspect_type,
                planet1: { name: timing.angle_type, sign: timing.sign },
                planet2: { name: timing.planet, sign: timing.sign },
              }}
            />
            <span className="text-gray-600 text-sm">in</span>
            <SignChip sign={timing.sign} />
          </div>
          {aspectDesc && (
            <div className="text-xs text-gray-600 mt-2 pl-2">
              {aspectDesc.description}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export const DailyAspectPreview = ({
  aspect,
}: {
  aspect: DailyAspectTiming;
}) => {
  const { open } = useDesc();
  const start = new Date(aspect.start_time);
  const hours = start.getHours() % 12 || 12;
  const minutes = start.getMinutes().toString().padStart(2, "0");
  const startTime = `${hours}:${minutes}`;

  return (
    <div
      className="
        flex items-center gap-1 px-1 py-0.5 rounded-md
        border border-green-300
        bg-green-50/30
        shadow-sm
        text-[10px]
        cursor-pointer
        transition-all duration-150
        hover:shadow-md hover:border-green-400
      "
      onClick={() => open({ type: "dailyAspectTiming", value: aspect })}
    >
      <span className="text-gray-700 font-mono text-xs">{startTime}</span>
      <AspectChip
        aspect={{
          type: aspect.aspect_type,
          planet1: { name: aspect.angle_type, sign: aspect.sign },
          planet2: { name: aspect.planet, sign: aspect.sign },
        }}
      />
      <span className="text-gray-500">→</span>
      <SignCircle sign={aspect.sign} />
    </div>
  );
};

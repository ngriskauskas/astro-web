import { useDesc } from "../../contexts/DescContext";
import {
  useDailyTimings,
  type AspectTiming,
  type KeyAngleTiming,
} from "../../hooks/timings/useDailyTimings";
import { Timeline } from "../timeline/Timeline";
import type { TimelineEvent } from "../timeline/types";
import { AspectChip } from "../utils/AspectChip";
import { TimeChip } from "../utils/DateChip";
import { KeyAngleChip } from "../utils/KeyAngleChip";
import { SignChip, SignCircle } from "../utils/SignChip";
import { Spinner } from "../utils/Spinner";
import { CollapsibleSection } from "./CurrentTimings";

const splitByTime = <T extends { start_time: string; end_time: string }>(
  items: T[],
) => {
  const now = new Date();
  const past: T[] = [];
  const current: T[] = [];
  const upcoming: T[] = [];

  items.forEach((item) => {
    const start = new Date(item.start_time);
    const end = new Date(item.end_time);

    if (end < now) past.push(item);
    else if (start <= now && now <= end) current.push(item);
    else upcoming.push(item);
  });

  return { past, current, upcoming };
};

export const DailyTimings = () => {
  const {
    timings: { daily_aspects, key_angles },
    loading,
  } = useDailyTimings();

  const { current: currentKeyAngles } = splitByTime(key_angles);
  const { current: currentAspects } = splitByTime(daily_aspects);

  const keyAngleEvents = keyAnglesToEvents(key_angles);
  const dailyAspectEvents = dailyAspectsToEvents(daily_aspects);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 ml-4 pb-4">
      <div className="mb-10">
        <Timeline events={[...keyAngleEvents, ...dailyAspectEvents]} />
      </div>

      {currentKeyAngles.length > 0 && (
        <CollapsibleSection title="Current Key Angles" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentKeyAngles.map((k, i) => (
              <KeyAngleCard key={i} keyAngle={k} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {currentAspects.length > 0 && (
        <CollapsibleSection title="Current Aspects" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentAspects.map((a, i) => (
              <DailyAspectCard key={i} aspect={a} />
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

const KeyAngleCard = ({ keyAngle }: { keyAngle: KeyAngleTiming }) => {
  const { open } = useDesc();

  const handleCardClick = () =>
    open({ type: "angle", value: keyAngle.angle_type });

  return (
    <div
      onClick={handleCardClick}
      className="relative rounded-md shadow-sm transition-shadow duration-200 hover:shadow-md cursor-pointer"
    >
      <div className="relative z-10 rounded-md p-4 bg-white border-2 border-blue-200 hover:border-blue-400 transition-colors duration-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">
            <KeyAngleChip angle={keyAngle.angle_type} />
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <SignChip sign={keyAngle.sign} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div
            className="bg-blue-50 rounded p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-blue-800">Start</p>
            <TimeChip datetime={keyAngle.start_time} />
          </div>
          <div
            className="bg-blue-50 rounded p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-blue-800">End</p>
            <TimeChip datetime={keyAngle.end_time} />
          </div>
        </div>
      </div>
    </div>
  );
};

const keyAnglesToEvents = (keyAngles: KeyAngleTiming[]): TimelineEvent[] => {
  return keyAngles.map((ka) => {
    const start = new Date(ka.start_time);
    const end = new Date(ka.end_time);

    return {
      start,
      end,
      renderPreview: () => {
        const startTime = new Date(ka.start_time)
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace(/ AM| PM/, "")
          .replace(/^0/, "");

        return (
          <div
            className="
        flex items-center gap-1 px-1 py-0.5 rounded-md
        border border-purple-300
        bg-purple-50/30
        shadow-sm
        text-[10px]
        pointer-events-none
        transition-all duration-150
        hover:shadow-md hover:border-purple-400
      "
          >
            <span className="text-gray-700 font-mono text-xs">{startTime}</span>
            <KeyAngleChip angle={ka.angle_type} small />
            <span className="text-gray-500">→</span>
            <SignCircle sign={ka.sign} />
          </div>
        );
      },
      renderDetail: () => <KeyAngleCard keyAngle={ka} />,
    };
  });
};

const DailyAspectCard = ({ aspect }: { aspect: AspectTiming }) => {
  const { open } = useDesc();

  const aspectDisplay = {
    type: aspect.aspect_type,
    planet1: { name: aspect.angle_type, sign: aspect.sign },
    planet2: { name: aspect.planet, sign: aspect.sign },
  };

  return (
    <div className="relative rounded-md shadow-sm transition-shadow duration-200 hover:shadow-md cursor-pointer">
      <div
        className="relative z-10 rounded-md p-4 bg-white border-2 border-green-200 hover:border-green-400 transition-colors duration-200"
        onClick={() =>
          open({
            type: "aspect",
            value: {
              planet1: { name: aspect.planet, sign: aspect.sign },
              planet2: { name: aspect.angle_type, sign: aspect.sign },
              type: aspect.aspect_type,
              sign: aspect.sign,
              planet1Owner: "main",
            },
          })
        }
      >
        <div className="flex justify-between items-center mb-2">
          <AspectChip aspect={aspectDisplay} />

          <div onClick={(e) => e.stopPropagation()}>
            <SignChip sign={aspect.sign} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div
            className="bg-green-50 rounded p-2 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-green-800">Start</p>
            <TimeChip datetime={aspect.start_time} />
          </div>
          <div
            className="bg-green-50 rounded p-2 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-green-800">End</p>
            <TimeChip datetime={aspect.end_time} />
          </div>
        </div>
      </div>
    </div>
  );
};

const dailyAspectsToEvents = (aspects: AspectTiming[]): TimelineEvent[] => {
  return aspects.map((aspect, i) => {
    const start = new Date(aspect.start_time);
    const end = new Date(aspect.end_time);

    const startTime = (() => {
      const hours = start.getHours() % 12 || 12;
      const minutes = start.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    })();

    return {
      start,
      end,
      renderPreview: () => (
        <div
          key={i}
          className="
      flex items-center gap-1 px-1 py-0.5 rounded-md
      border border-green-300
      bg-green-50/30
      shadow-sm
      text-[10px]
      pointer-events-none
      transition-all duration-150
      hover:shadow-md hover:border-green-400
    "
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
      ),
      renderDetail: () => <DailyAspectCard aspect={aspect} />,
    };
  });
};

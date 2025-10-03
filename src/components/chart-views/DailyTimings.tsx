import { useDesc } from "../../contexts/DescContext";
import {
  useDailyTimings,
  type AspectTiming,
  type KeyAngleTiming,
} from "../../hooks/timings/useDailyTimings";
import { Timeline } from "../timeline/Timeline";
import { AspectChip } from "../utils/AspectChip";
import { TimeChip } from "../utils/DateChip";
import { KeyAngleChip } from "../utils/KeyAngleChip";
import { SignChip } from "../utils/SignChip";
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

  const {
    past: pastKeyAngles,
    current: currentKeyAngles,
    upcoming: upcomingKeyAngles,
  } = splitByTime(key_angles);
  const {
    past: pastAspects,
    current: currentAspects,
    upcoming: upcomingAspects,
  } = splitByTime(daily_aspects);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 ml-4 pb-4">
      <div className="mb-10">
        <Timeline horizon="minutes" />
      </div>

      {pastKeyAngles.length > 0 && (
        <CollapsibleSection title="Past Key Angles" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastKeyAngles.map((k, i) => (
              <KeyAngleCard key={i} keyAngle={k} />
            ))}
          </div>
        </CollapsibleSection>
      )}
      {currentKeyAngles.length > 0 && (
        <CollapsibleSection title="Current Key Angles" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentKeyAngles.map((k, i) => (
              <KeyAngleCard key={i} keyAngle={k} />
            ))}
          </div>
        </CollapsibleSection>
      )}
      {upcomingKeyAngles.length > 0 && (
        <CollapsibleSection title="Upcoming Key Angles" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingKeyAngles.map((k, i) => (
              <KeyAngleCard key={i} keyAngle={k} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Aspects */}
      {pastAspects.length > 0 && (
        <CollapsibleSection title="Past Aspects" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastAspects.map((a, i) => (
              <DailyAspectCard key={i} aspect={a} />
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
      {upcomingAspects.length > 0 && (
        <CollapsibleSection title="Upcoming Aspects" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAspects.map((a, i) => (
              <DailyAspectCard key={i} aspect={a} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {key_angles.length === 0 && daily_aspects.length === 0 && (
        <p className="text-gray-500">No daily timings available.</p>
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
        onClick={() => open({ type: "aspect", value: aspectDisplay })}
      >
        <div className="flex justify-between items-center mb-2">
          <AspectChip aspect={aspectDisplay} />

          <div onClick={(e) => e.stopPropagation()}>
            <SignChip sign={aspect.sign} />
          </div>
        </div>

        {/* Aspect Type + Start / End Times */}
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
          <div className="bg-green-50 rounded p-2 pointer-events-auto">
            <p className="font-semibold text-green-800">Aspect</p>
            <span>{aspect.aspect_type}</span>
          </div>
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

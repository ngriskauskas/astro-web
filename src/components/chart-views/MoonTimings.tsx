import { useState } from "react";
import { useDesc } from "../../contexts/DescContext";
import {
  useMoonTimings,
  type IngressTiming,
  type MoonPhaseTiming,
} from "../../hooks/timings/useMoonTimings";
import { MoonPhasesData } from "../../types/moon";
import {
  DateChip,
  DateTimeChip,
  SignChip,
  Spinner,
} from "../descriptions/Helpers";
import { useIngressDesc, usePlanetDesc } from "../../hooks/useDescData";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export const MoonTimings = () => {
  const { loading, timings } = useMoonTimings();

  if (loading) return <div>Loading...</div>;

  const { ingresses = [], phases = [] } = timings;

  const sortedIngresses = [...ingresses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const sortedPhases = [...phases].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const now = Date.now();
  const currentIngressIndex = [...sortedIngresses]
    .reverse()
    .findIndex((ingress) => new Date(ingress.date).getTime() <= now);

  const currentIndex =
    currentIngressIndex === -1
      ? 0
      : sortedIngresses.length - 1 - currentIngressIndex;

  const upcomingIngresses = sortedIngresses.slice(currentIndex);
  const currentPhaseIndex = sortedPhases.reduceRight((acc, phase, idx) => {
    return acc === -1 && new Date(phase.date).getTime() <= now ? idx : acc;
  }, -1);

  return (
    <div className="p-4 ml-4 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Moon Phases
        </h2>
        {sortedPhases.length === 0 ? (
          <div>No Moon phases available for this period.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedPhases.map((phase, i) => (
              <div key={i}>
                {renderMoonPhase(phase, i === currentPhaseIndex)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Moon Ingresses
        </h2>
        {upcomingIngresses.length === 0 ? (
          <div>No upcoming Moon ingresses in this period.</div>
        ) : (
          <div className="space-y-3">
            {upcomingIngresses.map((ingress, i) => (
              <MoonIngress key={i} ingress={ingress} isCurrent={i === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MoonIngress = ({
  ingress,
  isCurrent,
}: {
  ingress: IngressTiming;
  isCurrent: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { loading, ingressDesc } = useIngressDesc(
    { planet: "moon", sign: ingress.sign },
    expanded,
  );

  return (
    <div
      className={`mr-15 ml-5 p-3 border rounded-md shadow-sm flex flex-col transition transform ${
        isCurrent
          ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 ring-2 ring-blue-300 scale-105"
          : "bg-white border-gray-200 hover:shadow-md"
      }`}
    >
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => {
          setOpen(!open);
          setExpanded(true);
        }}
      >
        <div className="flex items-center space-x-2">
          <DateChip date={ingress.date} />
          <span className="text-gray-700 font-medium">
            {isCurrent ? "Current" : "enters"}
          </span>
          <SignChip sign={ingress.sign} />
        </div>
        <div>
          {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>
      </div>

      {open && (
        <div className="mt-2 text-gray-600 text-sm">
          {loading ? (
            <Spinner />
          ) : (
            ingressDesc?.description || "No description available."
          )}
        </div>
      )}
    </div>
  );
};

const renderMoonPhase = (phase: MoonPhaseTiming, isCurrent: boolean) => {
  const { open } = useDesc();
  const phaseData = MoonPhasesData[phase.phase];

  return (
    <div
      className={`p-4 flex flex-col items-center justify-center rounded-full shadow-lg border transition-transform duration-200 transform hover:scale-110 cursor-pointer
        ${
          isCurrent
            ? "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-400 ring-4 ring-purple-300 "
            : "bg-white border-gray-200 hover:shadow-xl"
        }`}
      onClick={() => open({ type: "moonphase", value: phase })}
    >
      <div className="text-sm text-gray-500 mb-2">
        <DateTimeChip datetime={phase.date} format />
      </div>
      <div className="flex flex-col items-center">
        <div className="text-5xl mb-2">{phaseData.glyph}</div>
        <div className="text-md font-semibold capitalize">{phase.phase}</div>
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <SignChip sign={phase.sign} />
      </div>
    </div>
  );
};

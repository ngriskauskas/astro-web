import { Section } from "../utils/Section";
import { BackButton, CloseButton } from "./Helpers";
import { DateChip } from "../utils/DateChip";
import { useDesc } from "../../contexts/DescContext";
import type {
  IngressTiming,
  TimingEvent,
} from "../../hooks/timings/useTimings";
import { PlanetChip } from "../utils/PlanetChip";
import { SignChip, SignCircle } from "../utils/SignChip";
import { useIngressDesc } from "../../hooks/descriptions/useIngressDesc";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { ZodiacData } from "../../types/zodiac";

export const IngressTimingPanel = ({ ingress }: { ingress: TimingEvent }) => {
  const ingressData = ingress.data as IngressTiming;
  const { loading, ingressDesc } = useIngressDesc({
    planet: ingressData.planet,
    sign: ingressData.sign,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        <BackButton />
        <h2 className="text-xl font-semibold">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xl mr-1">
                {PlanetsData[ingressData.planet as PlanetName].glyph}
              </span>
              <span className="capitalize">{ingressData.planet}</span>
            </div>
            <span className="text-gray-500">→</span>
            <img
              src={ZodiacData[ingressData.sign].glyph}
              width={22}
              height={22}
            />
            <h2 className="text-xl font-semibold capitalize">
              {ingressData.sign}
            </h2>
          </div>
        </h2>
        <CloseButton />
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="flex items-center gap-2 mb-2"></div>
          <div className="p-2 bg-white border rounded shadow-sm text-sm">
            An ingress occurs when a planet moves into a new zodiac sign,
            marking a shift in the planetary energy and its influence on that
            sign. This can signal changes in the themes and focus associated
            with that planet during its transit.
          </div>
        </Section>
        <Section title="Times">
          <div className="text-xs text-gray-700 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold shrink-0 text-xs text-gray-500">
                Date:
              </span>
              <DateChip date={ingressData.date} format />
            </div>
          </div>
        </Section>

        <Section title="Details" loading={loading}>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <PlanetChip planet={ingressData.planet} />
              <span className="text-gray-500 text-sm tracking-wide font-semibold">
                enters
              </span>
              <SignChip sign={ingressData.sign} />
            </div>
            {ingressDesc && (
              <div className="text-xs text-gray-600 mt-2 pl-2">
                {ingressDesc.description}
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};

export const IngressPreview = ({ ingress }: { ingress: TimingEvent }) => {
  const { open } = useDesc();
  const ingressData = ingress.data as IngressTiming;
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-md border cursor-pointer"
      onClick={() => open({ type: "ingressTiming", value: ingress })}
    >
      <div className="flex items-center gap-3">
        <PlanetChip planet={ingressData.planet} />
        <span className="text-gray-500">→</span>
        <SignCircle sign={ingressData.sign} />
      </div>
    </div>
  );
};

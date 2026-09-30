import { Section } from "../utils/Section";
import { BackButton, CloseButton } from "./Helpers";
import { DateTimeChip } from "../utils/DateChip";
import { useDesc } from "../../contexts/DescContext";
import type { TimingEvent } from "../../types/timings";
import { PlanetChip } from "../utils/PlanetChip";
import { SignChip, SignCircle } from "../utils/SignChip";
import { useIngressDesc } from "../../hooks/descriptions/useIngressDesc";
import { PlanetsData } from "../../types/planet";
import { ZodiacData } from "../../types/zodiac";

type IngressEvent = Extract<TimingEvent, { type: "ingress" }>;

export const IngressTimingPanel = ({ ingress }: { ingress: IngressEvent }) => {
  const ingressData = ingress.data;
  const planet = ingressData.planet.name;
  const sign = ingressData.endPlanet.planet.sign;
  const { loading, ingressDesc } = useIngressDesc({
    planet,
    fromSign: ingressData.startPlanet.planet.sign,
    toSign: sign,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        <BackButton />
        <h2 className="text-xl font-semibold">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xl mr-1">{PlanetsData[planet].glyph}</span>
              <span>{PlanetsData[planet].displayName}</span>
            </div>
            <span className="text-gray-500">→</span>
            <img src={ZodiacData[sign].glyph} width={22} height={22} />
            <h2 className="text-xl font-semibold">{ZodiacData[sign].displayName}</h2>
          </div>
        </h2>
        <CloseButton />
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="flex items-center gap-2 mb-2"></div>
          <div className="p-2 bg-white border rounded shadow-sm text-sm">
            An ingress occurs when a planet moves into a new zodiac sign, marking a shift in the
            planetary energy and its influence on that sign. This can signal changes in the themes
            and focus associated with that planet during its transit.
          </div>
        </Section>
        <Section title="Times">
          <div className="text-xs text-gray-700 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold shrink-0 text-xs text-gray-500">Date:</span>
              <DateTimeChip datetime={ingressData.endPlanet.dateTime} format />
            </div>
          </div>
        </Section>

        <Section title="Details" loading={loading}>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <PlanetChip planet={planet} />
              <span className="text-gray-500 text-sm tracking-wide font-semibold">enters</span>
              <SignChip sign={sign} />
            </div>
            {ingressDesc && (
              <div className="text-xs text-gray-600 mt-2 pl-2">{ingressDesc.description}</div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};

export const IngressPreview = ({ ingress }: { ingress: IngressEvent }) => {
  const { open } = useDesc();
  const ingressData = ingress.data;
  const planet = ingressData.planet.name;
  const sign = ingressData.endPlanet.planet.sign;
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-md border cursor-pointer"
      onClick={() => open({ type: "ingressTiming", value: ingress })}
    >
      <div className="flex items-center gap-3">
        <PlanetChip planet={planet} />
        <span className="text-gray-500">→</span>
        <SignCircle sign={sign} />
      </div>
    </div>
  );
};

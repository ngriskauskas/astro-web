import { ZodiacData } from "../../types/zodiac";
import {
  BackButton,
  CloseButton,
  OverviewCard,
  PlanetGroup,
  Section,
} from "./Helpers";
import { type ZodiacSign } from "../../types/zodiac";
import { useDesc } from "../../contexts/DescContext";

export const SignPanel = ({
  sign,
  desc,
}: {
  sign: ZodiacSign;
  desc: string;
}) => {
  const { open } = useDesc();
  const signInfo = ZodiacData[sign];
  const { info } = signInfo;

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200"
        style={{ backgroundColor: signInfo.color }}
      >
        <BackButton />
        <img src={signInfo.glyph} alt={sign} width={32} height={32} />
        <h2 className="text-xl font-semibold capitalize">{sign}</h2>
        <img src={signInfo.drawing} alt={sign} width={32} height={32} />
        <CloseButton />
      </div>

      <div className="p-2 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
            {signInfo.info.description}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <OverviewCard
              title="Element"
              glyph={info.element.glyph}
              value={info.element.name}
            />
            <OverviewCard
              title="Modality"
              glyph={info.modality.glyph}
              value={info.modality.name}
            />
            <OverviewCard
              title="Polarity"
              glyph={<span className="text-xs">{info.polarity.glyph}</span>}
              value={info.polarity.name}
            />
            <OverviewCard
              title="House"
              value={info.house}
              onClick={() => open({ type: "house", value: info.house })}
            />
          </div>
          <div className="mt-3 space-y-2">
            <PlanetGroup title="Rulers" planets={info.rulers} />
            <PlanetGroup title="Exalted" planets={info.exalted} />
            <PlanetGroup title="Detriment" planets={info.detriment} />
            <PlanetGroup title="Fall" planets={info.fall} />
          </div>
        </Section>

        <Section title="Planets" startOpen={false}>
          {desc}
        </Section>
      </div>
    </div>
  );
};

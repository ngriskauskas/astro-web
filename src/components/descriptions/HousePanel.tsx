import { useDesc } from "../../contexts/DescContext";
import { HouseData } from "../../types/cusp";
import { ZodiacData } from "../../types/zodiac";
import { BackButton, CloseButton, OverviewCard, Section } from "./Helpers";

export const HousePanel = ({ house }: { house: string; desc: string }) => {
  const houseInfo = HouseData[house];
  const { open } = useDesc();

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200"
        style={{ backgroundColor: houseInfo.color }}
      >
        <BackButton />
        <h2 className="text-xl font-semibold capitalize">{houseInfo.name}</h2>
        <CloseButton />
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
            {houseInfo.info.description}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <OverviewCard
              title="Element"
              glyph={houseInfo.info.element.glyph}
              value={houseInfo.info.element.name}
            />
            <OverviewCard
              title="Modality"
              glyph={houseInfo.info.modality.glyph}
              value={houseInfo.info.modality.name}
            />
            <OverviewCard
              title="Polarity"
              glyph={
                <span className="text-xs">{houseInfo.info.polarity.glyph}</span>
              }
              value={houseInfo.info.polarity.name}
            />
            <OverviewCard
              title="Sign"
              value={houseInfo.info.sign}
              glyph={ZodiacData[houseInfo.info.sign].glyph}
              onClick={() => open({ type: "sign", value: houseInfo.info.sign })}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

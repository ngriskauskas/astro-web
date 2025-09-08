import { AngleData } from "../../types/cusp";
import { BackButton, CloseButton, Section } from "./Helpers";

export const AnglePanel = ({ angle }: { angle: string; desc: string }) => {
  const angleInfo = AngleData[angle];

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200"
        style={{ backgroundColor: angleInfo.color }}
      >
        <BackButton />
        <h2 className="text-xl font-semibold capitalize">{angle}</h2>
        <CloseButton />
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <Section title="Overview">
          <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
            {angleInfo.info.description}
          </div>
        </Section>
      </div>
    </div>
  );
};

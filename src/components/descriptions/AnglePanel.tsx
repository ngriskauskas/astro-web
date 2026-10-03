import type { OwnerType } from "../../contexts/MultiWheelContext";
import { LoadError } from "../utils/LoadError";
import { useKeyAngleData } from "../../hooks/chart/useChartData";
import { useKeyAngleDesc } from "../../hooks/descriptions/useKeyAngleDesc";
import { AngleData, type KeyType } from "../../types/cusp";
import { Section } from "../utils/Section";
import { SignChip } from "../utils/SignChip";
import { BackButton, CloseButton } from "./Helpers";

export const AnglePanel = ({ angle, owner }: { angle: KeyType; owner?: OwnerType }) => {
  const { sign } = useKeyAngleData(angle, owner);

  const { loading, error, keyAngleDesc } = useKeyAngleDesc({ sign, angle, owner });
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
      <div className="p-3 flex-1 overflow-y-auto overscroll-contain">
        <Section title="Overview">
          <div className="p-2 bg-white border rounded shadow-sm text-sm mb-3">
            {angleInfo.info.description}
          </div>
        </Section>
        <Section title="Details" loading={loading}>
          <div className="w-fit">
            <SignChip sign={sign} />
          </div>
          {error && <LoadError message="Could not load this description." />}
          {keyAngleDesc && (
            <div className="text-xs text-gray-600 mt-2 pl-2">{keyAngleDesc.sign}</div>
          )}
        </Section>
      </div>
    </div>
  );
};

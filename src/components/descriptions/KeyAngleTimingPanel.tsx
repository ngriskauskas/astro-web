import { useDesc } from "../../contexts/DescContext";
import { useKeyAngleDesc } from "../../hooks/descriptions/useKeyAngleDesc";
import type { AngleTiming } from "../../types/timings";
import { AngleData } from "../../types/cusp";
import { TimeChip } from "../utils/DateChip";
import { KeyAngleChip } from "../utils/KeyAngleChip";
import { Section } from "../utils/Section";
import { SignChip, SignCircle } from "../utils/SignChip";
import { BackButton, CloseButton } from "./Helpers";
import { useWheel } from "../../hooks/useWheel";

export const KeyAngleTimingPanel = ({ timing }: { timing: AngleTiming }) => {
  const angle = timing.angle.name;
  const angleInfo = AngleData[angle];
  const { type } = useWheel();

  const { loading, keyAngleDesc } = useKeyAngleDesc({
    sign: timing.angle.sign,
    angle,
    owner: type === "transit" ? "other" : undefined,
  });

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

        <Section title="Times">
          <div className="text-xs text-gray-700 flex flex-col gap-3">
            <div>
              Time: <TimeChip datetime={timing.dateTime} />
            </div>
          </div>
        </Section>

        <Section title="Details" loading={loading}>
          <div>
            <div className="flex gap-1 items-center">
              <KeyAngleChip angle={angle} />
              <span className="text-gray-500">→</span>
              <SignChip sign={timing.angle.sign} />
            </div>
            {keyAngleDesc && (
              <div className="text-xs text-gray-600 mt-2 pl-2">{keyAngleDesc.sign}</div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};

export const KeyAnglePreview = ({ timing }: { timing: AngleTiming }) => {
  const { open } = useDesc();
  const startTime = new Date(timing.dateTime)
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
        border border-purple-300 cursor-pointer
        bg-purple-50/30
        shadow-sm
        text-[10px]
        transition-all duration-150
        hover:shadow-md hover:border-purple-400
      "
      onClick={() => open({ type: "keyAngleTiming", value: timing })}
    >
      <span className="text-gray-700 font-mono text-xs">{startTime}</span>
      <KeyAngleChip angle={timing.angle.name} small />
      <span className="text-gray-500">→</span>
      <SignCircle sign={timing.angle.sign} />
    </div>
  );
};

export const DailyAnglePreview = ({ timing }: { timing: AngleTiming }) => {
  const { open } = useDesc();
  const startTime = new Date(timing.dateTime)
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/ AM| PM/, "")
    .replace(/^0/, "");

  return (
    <div
      className="flex items-center gap-1 px-1 py-0.5 rounded-md border border-purple-300 bg-purple-50/30 shadow-sm text-[10px] cursor-pointer transition-all duration-150 hover:shadow-md hover:border-purple-400"
      onClick={() => open({ type: "keyAngleTiming", value: timing })}
    >
      <span className="text-gray-700 font-mono text-xs">{startTime}</span>
      <KeyAngleChip angle={timing.angle.name} small />
      <span className="text-gray-500">→</span>
      <SignCircle sign={timing.angle.sign} />
    </div>
  );
};

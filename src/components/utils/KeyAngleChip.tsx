import { useDesc } from "../../contexts/DescContext";
import { AngleData, type KeyType } from "../../types/cusp";
import { CHIP_BASE, CHIP_INTERACTIVE, chipTint } from "./chipStyles";

export const KeyAngleChip = ({
  angle,
  small = false,
  interactive = true,
}: {
  angle: KeyType;
  small?: boolean;
  interactive?: boolean;
}) => {
  const { open } = useDesc();
  const data = AngleData[angle];
  const style = chipTint(data.color);
  const content = (
    <>
      <span className="font-mono font-semibold tracking-tight">{angle}</span>
      {!small && <span className="capitalize">{data.name}</span>}
    </>
  );

  if (!interactive) {
    return (
      <span className={CHIP_BASE} style={style}>
        {content}
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-label={data.name}
      className={`${CHIP_BASE} ${CHIP_INTERACTIVE}`}
      onClick={() => open({ type: "angle", value: angle })}
      style={style}
    >
      {content}
    </button>
  );
};

import { useDesc } from "../../contexts/DescContext";
import { AngleData, type KeyType } from "../../types/cusp";

const CHIP =
  "flex items-center gap-1 px-1.5 py-0.5 bg-white border rounded shadow-sm text-xs font-medium justify-center";

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

  const label = angle.charAt(0);
  const superscript = angle.slice(1);
  const style = {
    backgroundColor: `${data.color}11`,
    borderColor: `${data.color}55`,
  };
  const content = (
    <>
      <span className="inline-block font-mono tracking-tight" aria-hidden="true">
        <span className="text-base capitalize">{label}</span>
        <span className="relative -top-1 text-xs">{superscript}</span>
      </span>
      {!small && <span className="ml-1 capitalize">{data.name}</span>}
    </>
  );

  if (!interactive) {
    return (
      <span className={CHIP} style={style}>
        {content}
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-label={data.name}
      className={`${CHIP} cursor-pointer hover:shadow-md transition-all`}
      onClick={() => open({ type: "angle", value: angle })}
      style={style}
    >
      {content}
    </button>
  );
};

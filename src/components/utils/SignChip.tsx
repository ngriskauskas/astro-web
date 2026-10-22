import { useDesc } from "../../contexts/DescContext";
import { ZodiacData, type ZodiacSign } from "../../types/zodiac";
import { CHIP_BASE, CHIP_INTERACTIVE, chipTint } from "./chipStyles";

export const SignChip = ({
  sign,
  interactive = true,
}: {
  sign: ZodiacSign;
  interactive?: boolean;
}) => {
  const { open } = useDesc();
  const signData = ZodiacData[sign];
  const style = chipTint(signData.color);
  const content = (
    <>
      <img src={signData.glyph} alt="" className="h-4 w-3.5 shrink-0 object-contain" />
      <span>{signData.displayName}</span>
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
      className={`${CHIP_BASE} ${CHIP_INTERACTIVE}`}
      onClick={() => open({ type: "sign", value: sign })}
      style={style}
    >
      {content}
    </button>
  );
};

export const SignGroup = ({ title, signs }: { title: string; signs: ZodiacSign[] }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{title}</span>

    <div className="flex flex-wrap gap-1.5">
      {signs.length === 0 ? (
        <span className="text-sm text-gray-500">—</span>
      ) : (
        signs.map((sign) => <SignChip key={sign} sign={sign} />)
      )}
    </div>
  </div>
);

// A small round sign glyph, for use beside other text or inside another chip.
export const SignCircle = ({ sign }: { sign: ZodiacSign }) => {
  const signData = ZodiacData[sign];

  return (
    <span
      title={signData.displayName}
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
      style={chipTint(signData.color)}
    >
      <img src={signData.glyph} alt={signData.displayName} className="h-2.5 w-2.5 object-contain" />
    </span>
  );
};

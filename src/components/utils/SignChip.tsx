import { useDesc } from "../../contexts/DescContext";
import { ZodiacData, type ZodiacSign } from "../../types/zodiac";

const CHIP =
  "flex items-center gap-1 px-1.5 py-0.5 bg-white border rounded shadow-sm text-xs font-medium justify-center";

export const SignChip = ({
  sign,
  interactive = true,
}: {
  sign: ZodiacSign;
  interactive?: boolean;
}) => {
  const { open } = useDesc();
  const signData = ZodiacData[sign];
  const color = signData.color;
  const style = {
    backgroundColor: `${color}11`,
    borderColor: `${color}55`,
  };
  const content = (
    <>
      <img src={signData.glyph} alt="" className="w-4.5 h-6" />
      <span>{signData.displayName}</span>
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
      className={`${CHIP} cursor-pointer hover:shadow-md transition-all`}
      onClick={() => open({ type: "sign", value: sign })}
      style={style}
    >
      {content}
    </button>
  );
};

export const SignGroup = ({ title, signs }: { title: string; signs: ZodiacSign[] }) => (
  <div className="flex flex-col gap-1">
    <span className="text-gray-500 text-xs uppercase tracking-wide">{title}</span>

    <div className="flex flex-wrap gap-1">
      {signs.length === 0 ? (
        <span className="text-gray-500">—</span>
      ) : (
        signs.map((sign) => <SignChip key={sign} sign={sign} />)
      )}
    </div>
  </div>
);

export const SignCircle = ({ sign, size = 10 }: { sign: ZodiacSign; size?: number }) => {
  const signData = ZodiacData[sign];
  const color = signData.color;

  const sizeClass = `w-${size} h-${size}`;

  return (
    <div
      title={signData.displayName}
      className={`
        ${sizeClass} 
        flex items-center justify-center 
        rounded-full border 
      `}
      style={{
        borderColor: `${color}55`,
        backgroundColor: `${color}33`,
        borderWidth: 1,
      }}
    >
      <img src={signData.glyph} alt={signData.displayName} className="w-1/2 h-1/2 object-contain" />
    </div>
  );
};

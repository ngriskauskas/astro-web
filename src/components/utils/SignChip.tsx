import { useDesc } from "../../contexts/DescContext";
import { ZodiacData, type ZodiacSign } from "../../types/zodiac";

export const SignChip = ({ sign }: { sign: ZodiacSign }) => {
  const { open } = useDesc();
  const signData = ZodiacData[sign];
  const color = signData.color;

  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 bg-white border rounded shadow-sm text-xs font-medium cursor-pointer hover:shadow-md transition-all justify-center"
      onClick={() => open({ type: "sign", value: sign })}
      style={{
        backgroundColor: `${color}11`,
        borderColor: `${color}55`,
      }}
    >
      <img src={signData.glyph} alt={sign} className="w-4.5 h-6" />
      <span className="capitalize">{sign}</span>
    </div>
  );
};

export const SignGroup = ({
  title,
  signs,
}: {
  title: string;
  signs: ZodiacSign[];
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-gray-500 text-xs uppercase tracking-wide">
      {title}
    </span>

    <div className="flex flex-wrap gap-1">
      {signs.length === 0 ? (
        <span className="text-gray-500">—</span>
      ) : (
        signs.map((sign) => <SignChip key={sign} sign={sign} />)
      )}
    </div>
  </div>
);

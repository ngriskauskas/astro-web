import { useDesc } from "../../contexts/DescContext";
import { FiX, FiArrowLeft } from "react-icons/fi";

// The header behind these takes the colour of the item shown, which can be dark, so
// each sits on its own light disc.
const CONTROL =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70 text-gray-900 hover:bg-white cursor-pointer";

export const CloseButton = () => {
  const { close } = useDesc();
  return (
    <button type="button" aria-label="Close" onClick={close} className={`${CONTROL} -mr-1`}>
      <FiX size={20} />
    </button>
  );
};

export const BackButton = () => {
  const { goBack } = useDesc();
  return (
    <button type="button" aria-label="Back" onClick={goBack} className={`${CONTROL} -ml-1`}>
      <FiArrowLeft size={20} />
    </button>
  );
};

export const OverviewCard = ({
  title,
  glyph,
  value,
  onClick,
}: {
  title: string;
  glyph?: string | React.ReactNode;
  value: string | number;
  onClick?: () => void;
}) => {
  const content = (
    <>
      <span className="text-gray-400 text-xs uppercase tracking-wide mb-1 text-center">{title}</span>

      <div className="flex items-center gap-1 mt-1">
        {typeof glyph === "string" ? <img src={glyph} alt="" width={20} height={20} /> : glyph}
        <span className="font-medium text-sm capitalize">{value}</span>
      </div>
    </>
  );
  const className = "flex flex-col items-center p-1 bg-white border rounded shadow-sm";

  return onClick ? (
    <button type="button" className={`${className} cursor-pointer hover:shadow-md`} onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
};

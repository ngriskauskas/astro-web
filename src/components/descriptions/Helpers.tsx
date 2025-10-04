import { useDesc } from "../../contexts/DescContext";
import { FiX, FiArrowLeft } from "react-icons/fi";

export const CloseButton = () => {
  const { close } = useDesc();
  return (
    <button
      onClick={close}
      className="text-gray-700 hover:text-gray-900 cursor-pointer"
    >
      <FiX size={20} />
    </button>
  );
};

export const BackButton = () => {
  const { goBack } = useDesc();
  return (
    <button
      onClick={goBack}
      className="text-gray-700 hover:text-gray-900 cursor-pointer"
    >
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
}) => (
  <div
    className={`flex flex-col items-center p-1 bg-white border rounded shadow-sm ${
      onClick ? "cursor-pointer hover:shadow-md" : ""
    }`}
    onClick={onClick}
  >
    <span className="text-gray-400 text-xs uppercase tracking-wide mb-1 text-center">
      {title}
    </span>

    <div className="flex items-center gap-1 mt-1">
      {typeof glyph === "string" ? (
        <img src={glyph} alt={String(value)} width={20} height={20} />
      ) : (
        glyph
      )}
      <span className="font-medium text-sm capitalize">{value}</span>
    </div>
  </div>
);

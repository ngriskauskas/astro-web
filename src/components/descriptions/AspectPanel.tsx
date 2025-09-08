import { useDesc } from "../../contexts/DescContext";
import { type Aspect } from "../../types/zodiac";

export const AspectPanel = ({
  aspect,
  desc,
}: {
  aspect: Aspect;
  desc: string;
}) => {
  const { close } = useDesc();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold capitalize">{aspect.type}</h2>
        <button
          onClick={close}
          className="text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          ✕
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">{desc}</div>
    </div>
  );
};

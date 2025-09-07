import { DescriptionSidePanel } from "../components/DescriptionSidePanel";
import { MultiZodiacWheel } from "../components/wheel/MultiZodiacWheel";
import { MultiWheelProvider } from "../contexts/MultiWheelContext";

export const Transits = () => {
  return (
    <MultiWheelProvider type="transit">
      <div className="flex items-center justify-center mt-10">
        <div className="w-[90%] max-w-5xl">
          <MultiZodiacWheel />
        </div>
      </div>
      <DescriptionSidePanel />
    </MultiWheelProvider>
  );
};

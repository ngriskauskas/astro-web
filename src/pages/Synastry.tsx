import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { MultiZodiacWheel } from "../components/wheel/MultiZodiacWheel";
import { DescProvider } from "../contexts/DescContext";
import { MultiWheelProvider } from "../contexts/MultiWheelContext";

export const Synastry = () => {
  return (
    <MultiWheelProvider type="synastry">
      <DescProvider>
        <div className="flex mt-5">
          <div className="w-[88%] max-w-5xl">
            <MultiZodiacWheel />
          </div>
        </div>
        <DescriptionSidePanel />
      </DescProvider>
    </MultiWheelProvider>
  );
};

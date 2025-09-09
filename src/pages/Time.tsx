import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { ZodiacWheel } from "../components/wheel/ZodiacWheel";
import { DescProvider } from "../contexts/DescContext";
import { SingleWheelProvider } from "../contexts/SingleWheelContext";

export const Time = () => {
  return (
    <SingleWheelProvider type="time">
      <DescProvider>
        <div className="flex mt-5">
          <div className="w-[88%] max-w-5xl">
            <ZodiacWheel />
          </div>
        </div>
        <DescriptionSidePanel />
      </DescProvider>
    </SingleWheelProvider>
  );
};

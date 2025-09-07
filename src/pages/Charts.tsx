import { DescriptionSidePanel } from "../components/DescriptionSidePanel";
import { ZodiacWheel } from "../components/wheel/ZodiacWheel";
import { SingleWheelProvider } from "../contexts/SingleWheelContext";

export const Charts = () => {
  return (
    <SingleWheelProvider type="natal">
      <div className="flex mt-5">
        <div className="w-[88%] max-w-5xl">
          <ZodiacWheel />
        </div>
      </div>
      <DescriptionSidePanel />
    </SingleWheelProvider>
  );
};

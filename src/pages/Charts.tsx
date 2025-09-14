import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { ViewSelector } from "../components/ViewSelector";
import { ZodiacWheelSettings } from "../components/wheel/ZodiacWheelSettings";
import { DescProvider } from "../contexts/DescContext";
import { SingleWheelProvider } from "../contexts/SingleWheelContext";

export const Charts = () => {
  return (
    <SingleWheelProvider type="natal">
      <DescProvider>
        <div className="flex mt-5">
          <div className="w-[88%] max-w-5xl">
            <div className="flex flex-row items-center gap-5">
              <div className="flex-[3]">
                <ViewSelector />
              </div>
              <div className="flex-[1] max-h-[600px] overflow-y-auto my-5">
                <ZodiacWheelSettings />
              </div>
            </div>
          </div>
        </div>
        <DescriptionSidePanel />
      </DescProvider>
    </SingleWheelProvider>
  );
};

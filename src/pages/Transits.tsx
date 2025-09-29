import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { ViewSelector } from "../components/ViewSelector";
import { ZodiacWheelSettings } from "../components/wheel/ZodiacWheelSettings";
import { DescProvider } from "../contexts/DescContext";
import { MultiWheelProvider } from "../contexts/MultiWheelContext";

export const Transits = () => {
  return (
    <MultiWheelProvider type="transit">
      <DescProvider>
        <div className="flex mt-5">
          <div className="w-[95%] ">
            <div className="flex flex-row items-center gap-5">
              <div className="flex-[4]">
                <ViewSelector isMulti={true} page="transit" />
              </div>
              <div className="flex-[1] max-h-[600px] overflow-y-auto my-5">
                <ZodiacWheelSettings />
              </div>
            </div>
          </div>
        </div>
        <DescriptionSidePanel />
      </DescProvider>
    </MultiWheelProvider>
  );
};

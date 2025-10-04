import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { ViewSelector } from "../components/ViewSelector";
import { ZodiacWheelSettings } from "../components/wheel/ZodiacWheelSettings";
import { DescProvider } from "../contexts/DescContext";
import { SingleWheelProvider } from "../contexts/SingleWheelContext";

export const Moment = () => {
  return (
    <SingleWheelProvider type="moment">
      <DescProvider>
        <div className="flex mt-5">
          <div className="w-[90%]">
            <div className="flex flex-row items-center gap-10">
              <div className="flex-[5]">
                <ViewSelector page="moment" />
              </div>
              <div className="flex-[1.5] max-h-[600px] overflow-y-auto my-5">
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

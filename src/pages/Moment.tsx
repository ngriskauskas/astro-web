import { useSearchParams } from "react-router-dom";
import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { ViewSelector } from "../components/ViewSelector";
import { ZodiacWheelSettings } from "../components/wheel/ZodiacWheelSettings";
import { DescProvider } from "../contexts/DescContext";
import { SingleWheelProvider } from "../contexts/SingleWheelContext";

export const Moment = () => {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const defaultTime = "23:59:00";

  return (
    <SingleWheelProvider
      type="moment"
      initialDate={dateParam || undefined}
      initialTime={(dateParam && defaultTime) || undefined}
    >
      <DescProvider>
        <div className="flex mt-5">
          <div className="w-[88%] max-w-5xl">
            <div className="flex flex-row items-center gap-5">
              <div className="flex-[3]">
                <ViewSelector page="moment" />
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

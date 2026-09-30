import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { ZodiacWheelSettings } from "../components/wheel/ZodiacWheelSettings";
import { DescProvider } from "../contexts/DescContext";
import { MultiWheelProvider } from "../contexts/MultiWheelContext";
import { MultiZodiacWheel } from "../components/wheel/MultiZodiacWheel";
import { MultiAspectMatrix } from "../components/chart-views/MultiAspectMatrix";
import { DailyAscendantTimeline } from "../components/chart-views/DailyAscendantTimeline";
import { TransitPlacements } from "../components/chart-views/TransitPlacements";
import { WeeklyTimingWidget } from "../components/chart-views/WeeklyTimingWidget";

export const Transits = () => {
  return (
    <MultiWheelProvider type="transit">
      <DescProvider>
        <div className="mx-auto max-w-[1800px] p-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section className="flex flex-col items-center border border-gray-200 bg-white p-4 xl:col-span-7">
              <h1 className="mb-4 self-start text-lg font-semibold text-gray-900">Transit Chart</h1>
              <div className="w-full max-w-[720px]">
                <MultiZodiacWheel />
              </div>
            </section>

            <div className="flex flex-col gap-6 xl:col-span-5">
              <div>
                <h2 className="mb-3 text-sm font-semibold text-gray-900">Chart Settings</h2>
                <ZodiacWheelSettings />
              </div>
              <section className="border border-gray-200 bg-white px-4">
                <DailyAscendantTimeline />
              </section>
              <WeeklyTimingWidget />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section className="min-w-0 overflow-hidden border border-gray-200 bg-white p-4 xl:col-span-7">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Aspect Matrix</h2>
              <div className="overflow-x-auto">
                <MultiAspectMatrix />
              </div>
            </section>
            <div className="min-w-0 xl:col-span-5">
              <TransitPlacements />
            </div>
          </div>
        </div>
        <DescriptionSidePanel />
      </DescProvider>
    </MultiWheelProvider>
  );
};

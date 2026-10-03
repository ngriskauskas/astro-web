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
        <main className="mx-auto max-w-[1800px] p-3 sm:p-6">
          {/* Two independent columns on wide screens, so the wheel's card is not stretched
              to the height of the taller column beside it. Below that the two wrappers
              dissolve (display: contents) and the order classes give the reading order:
              wheel, side widgets, matrix, placements. */}
          <div className="flex flex-col gap-6 xl:grid xl:grid-cols-12 xl:items-start">
            <div className="contents xl:col-span-7 xl:flex xl:min-w-0 xl:flex-col xl:gap-6">
              <section
                aria-labelledby="chart-heading"
                className="order-1 flex min-w-0 flex-col items-center border border-gray-200 bg-white p-2 sm:p-4"
              >
                <h1
                  id="chart-heading"
                  className="mb-4 self-start text-xl font-semibold text-gray-900"
                >
                  Transit Chart
                </h1>
                <div className="w-full max-w-[720px]">
                  <MultiZodiacWheel />
                </div>
              </section>
              <section
                aria-labelledby="matrix-heading"
                className="order-3 min-w-0 border border-gray-200 bg-white p-2 sm:p-4"
              >
                <h2 id="matrix-heading" className="mb-4 text-lg font-semibold text-gray-900">
                  Aspect Matrix
                </h2>
                <MultiAspectMatrix />
              </section>
            </div>

            <div className="contents xl:col-span-5 xl:flex xl:min-w-0 xl:flex-col xl:gap-6">
              <div className="order-2 flex min-w-0 flex-col gap-6">
                <section aria-labelledby="settings-heading">
                  <h2 id="settings-heading" className="mb-3 text-lg font-semibold text-gray-900">
                    Chart Settings
                  </h2>
                  <ZodiacWheelSettings />
                </section>
                <div className="border border-gray-200 bg-white px-2 sm:px-4">
                  <DailyAscendantTimeline />
                </div>
                <WeeklyTimingWidget />
              </div>
              <div className="order-4 min-w-0">
                <TransitPlacements />
              </div>
            </div>
          </div>
        </main>
        <DescriptionSidePanel />
      </DescProvider>
    </MultiWheelProvider>
  );
};

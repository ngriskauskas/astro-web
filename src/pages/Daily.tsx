import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { DescProvider } from "../contexts/DescContext";
import { SingleWheelProvider } from "../contexts/SingleWheelContext";
import { ZodiacWheel } from "../components/wheel/ZodiacWheel";
import { PlacementsTable } from "../components/chart-views/PlacementsTable";
import { AspectMatrix } from "../components/chart-views/AspectMatrix";
import { DailyAscendantTimeline } from "../components/chart-views/DailyAscendantTimeline";
import { WeeklyTimingWidget } from "../components/chart-views/WeeklyTimingWidget";
import { MoonTimings } from "../components/chart-views/MoonTimings";

export const Daily = () => {
  return (
    <SingleWheelProvider type="time">
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
                <h2 id="chart-heading" className="mb-4 self-start text-xl font-bold">
                  Zodiac Wheel
                </h2>
                <div className="w-full max-w-[650px]">
                  <ZodiacWheel />
                </div>
              </section>
              <section
                aria-labelledby="matrix-heading"
                className="order-3 min-w-0 border border-gray-200 bg-white p-2 sm:p-4"
              >
                <h2 id="matrix-heading" className="mb-4 text-xl font-bold">
                  Aspect Matrix
                </h2>
                <AspectMatrix />
              </section>
            </div>

            <div className="contents xl:col-span-5 xl:flex xl:min-w-0 xl:flex-col xl:gap-6">
              <div className="order-2 flex min-w-0 flex-col gap-6">
                <DailyAscendantTimeline />
                <MoonTimings />
                <WeeklyTimingWidget />
              </div>
              <section
                aria-labelledby="placements-heading"
                className="order-4 min-w-0 border border-gray-200 bg-white p-2 sm:p-4"
              >
                <h2 id="placements-heading" className="mb-4 text-xl font-bold">
                  Placements
                </h2>
                <PlacementsTable />
              </section>
            </div>
          </div>
        </main>
        <DescriptionSidePanel />
      </DescProvider>
    </SingleWheelProvider>
  );
};

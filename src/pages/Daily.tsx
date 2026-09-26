import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { ZodiacWheelSettings } from "../components/wheel/ZodiacWheelSettings";
import { DescProvider } from "../contexts/DescContext";
import { SingleWheelProvider } from "../contexts/SingleWheelContext";

// Import your components
import { ZodiacWheel } from "../components/wheel/ZodiacWheel";
import { PlacementsTable } from "../components/chart-views/PlacementsTable";
import { AspectMatrix } from "../components/chart-views/AspectMatrix";

export const Daily = () => {
  return (
    <SingleWheelProvider type="moment">
      <DescProvider>
        <div className="p-6 max-w-[1800px] mx-auto">
          {/* Main Grid: Left side gets more width for the large wheel */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Large Wheel Hero (Takes up 7 cols) */}
            <div className="xl:col-span-7 border-2 border-red-500 p-4 flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4 self-start">Zodiac Wheel</h2>
              {/* Force the wheel container to be large and square-ish */}
              <div className="w-full max-w-[650px] h-[650px]">
                <ZodiacWheel />
              </div>
            </div>

            {/* RIGHT COLUMN: Settings & Stacked Widgets (Takes up 5 cols) */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              {/* Settings Box */}
              <div className="border-2 border-red-500 p-4">
                <h2 className="text-xl font-bold mb-4">Settings</h2>
                <div className="max-h-[300px] overflow-y-auto">
                  <ZodiacWheelSettings />
                </div>
              </div>

              {/* Placements Box */}
              <div className="border-2 border-red-500 p-4">
                <h2 className="text-xl font-bold mb-4">Placements</h2>
                <div className="max-h-[400px] overflow-y-auto">
                  <PlacementsTable />
                </div>
              </div>
            </div>
          </div>

          {/* Full-width section down below if needed, e.g., Aspect Matrix */}
          <div className="mt-6 border-2 border-red-500 p-4">
            <h2 className="text-xl font-bold mb-4">Aspect Matrix</h2>
            <div className="overflow-x-auto">
              <AspectMatrix />
            </div>
          </div>
        </div>
        <DescriptionSidePanel />
      </DescProvider>
    </SingleWheelProvider>
  );
};

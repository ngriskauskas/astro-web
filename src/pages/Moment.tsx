import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { AspectMatrix } from "../components/chart-views/AspectMatrix";
import { PlacementsTable } from "../components/chart-views/PlacementsTable";
import { ZodiacWheel } from "../components/wheel/ZodiacWheel";
import { ZodiacWheelSettings } from "../components/wheel/ZodiacWheelSettings";
import { DescProvider } from "../contexts/DescContext";
import { SingleWheelProvider } from "../contexts/SingleWheelContext";

export const Moment = () => {
  return (
    <SingleWheelProvider type="moment">
      <DescProvider>
        <main className="mx-auto max-w-[1800px] p-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section className="flex flex-col items-center border border-gray-200 bg-white p-4 xl:col-span-7">
              <h1 className="mb-4 self-start text-xl font-semibold text-gray-900">Moment Chart</h1>
              <div className="w-full max-w-[650px]">
                <ZodiacWheel />
              </div>
            </section>
            <aside className="flex flex-col gap-6 xl:col-span-5">
              <section>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Chart Settings</h2>
                <ZodiacWheelSettings />
              </section>
            </aside>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section className="min-w-0 overflow-hidden border border-gray-200 bg-white p-4 xl:col-span-7">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Aspect Matrix</h2>
              <div className="overflow-x-auto">
                <AspectMatrix />
              </div>
            </section>
            <section className="min-w-0 border border-gray-200 bg-white p-4 xl:col-span-5">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Placements</h2>
              <div className="max-h-[400px] overflow-auto">
                <PlacementsTable />
              </div>
            </section>
          </div>
        </main>
        <DescriptionSidePanel />
      </DescProvider>
    </SingleWheelProvider>
  );
};

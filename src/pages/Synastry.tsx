import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { MultiAspectMatrix } from "../components/chart-views/MultiAspectMatrix";
import { TransitPlacements } from "../components/chart-views/TransitPlacements";
import { MultiZodiacWheel } from "../components/wheel/MultiZodiacWheel";
import { ZodiacWheelSettings } from "../components/wheel/ZodiacWheelSettings";
import { DescProvider } from "../contexts/DescContext";
import { MultiWheelProvider } from "../contexts/MultiWheelContext";

export const Synastry = () => {
  return (
    <MultiWheelProvider type="synastry">
      <DescProvider>
        <main className="mx-auto max-w-[1800px] p-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section className="flex flex-col items-center border border-gray-200 bg-white p-4 xl:col-span-7">
              <h1 className="mb-4 self-start text-xl font-semibold text-gray-900">Synastry</h1>
              <div className="w-full max-w-[720px]">
                <MultiZodiacWheel />
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
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Synastry Aspects</h2>
              <div className="overflow-x-auto">
                <MultiAspectMatrix />
              </div>
            </section>
            <div className="min-w-0 xl:col-span-5">
              <TransitPlacements otherLabel="Other Profile" />
            </div>
          </div>
        </main>
        <DescriptionSidePanel />
      </DescProvider>
    </MultiWheelProvider>
  );
};

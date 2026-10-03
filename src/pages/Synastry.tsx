import { Link } from "react-router-dom";
import { DescriptionSidePanel } from "../components/descriptions/DescriptionSidePanel";
import { MultiAspectMatrix } from "../components/chart-views/MultiAspectMatrix";
import { TransitPlacements } from "../components/chart-views/TransitPlacements";
import { MultiZodiacWheel } from "../components/wheel/MultiZodiacWheel";
import { ZodiacWheelSettings } from "../components/wheel/ZodiacWheelSettings";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";
import { DescProvider } from "../contexts/DescContext";
import { MultiWheelProvider } from "../contexts/MultiWheelContext";

export const Synastry = () => {
  const { profiles } = useBirthProfiles();

  // Synastry compares the user's chart with someone else's, so it needs a second profile.
  if (!profiles.some((profile) => !profile.isMain)) {
    return (
      <main className="mx-auto max-w-[1800px] p-3 sm:p-6">
        <section
          aria-labelledby="chart-heading"
          className="border border-gray-200 bg-white p-4 sm:p-6"
        >
          <h1 id="chart-heading" className="mb-4 text-xl font-semibold text-gray-900">
            Synastry
          </h1>
          <p className="mb-4 text-gray-700">
            Synastry compares two birth profiles. Add a second profile to use it.
          </p>
          <Link
            to="/profile"
            className="inline-flex min-h-11 items-center rounded bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-700"
          >
            Go to Profile
          </Link>
        </section>
      </main>
    );
  }

  return (
    <MultiWheelProvider type="synastry">
      <DescProvider>
        <main className="mx-auto max-w-[1800px] p-3 sm:p-6">
          {/* Two independent columns on wide screens, so no card is stretched to the height
              of the column beside it. Below that the two wrappers dissolve (display:
              contents) and the order classes give the reading order: wheel, settings,
              matrix, placements. */}
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
                  Synastry
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
                  Synastry Aspects
                </h2>
                <MultiAspectMatrix />
              </section>
            </div>

            <div className="contents xl:col-span-5 xl:flex xl:min-w-0 xl:flex-col xl:gap-6">
              <section aria-labelledby="settings-heading" className="order-2 min-w-0">
                <h2 id="settings-heading" className="mb-3 text-lg font-semibold text-gray-900">
                  Chart Settings
                </h2>
                <ZodiacWheelSettings />
              </section>
              <div className="order-4 min-w-0">
                <TransitPlacements otherLabel="Other Profile" />
              </div>
            </div>
          </div>
        </main>
        <DescriptionSidePanel />
      </DescProvider>
    </MultiWheelProvider>
  );
};

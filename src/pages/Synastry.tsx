import { Link } from "react-router-dom";
import {
  ChartSettingsWidget,
  TwoChartMatrixWidget,
  TwoChartPlacementsWidget,
  TwoChartWheelWidget,
  Widget,
  WidgetPage,
  WidgetSplit,
} from "../components/widgets";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";

export const Synastry = () => {
  const { profiles } = useBirthProfiles();

  // Synastry compares the user's chart with someone else's, so it needs a second profile.
  if (!profiles.some((profile) => !profile.isMain)) {
    return (
      <main className="mx-auto max-w-[1800px] px-3 pb-10 pt-4 sm:px-6 sm:pt-6">
        <Widget
          id="chart"
          title="Synastry"
          headingLevel={1}
          subtitle="Synastry compares two birth profiles. Add a second profile to use it."
        >
          <Link
            to="/profile"
            className="mt-1 inline-flex min-h-11 cursor-pointer items-center rounded bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Go to Profile
          </Link>
        </Widget>
      </main>
    );
  }

  return (
    <WidgetPage chart="synastry">
      <WidgetSplit
        main={
          <>
            <TwoChartWheelWidget title="Synastry" headingLevel={1} className="order-1" />
            <TwoChartMatrixWidget title="Synastry Aspects" className="order-3" />
          </>
        }
        side={
          <>
            <ChartSettingsWidget className="order-2" />
            <TwoChartPlacementsWidget otherLabel="Other Profile" className="order-4" />
          </>
        }
      />
    </WidgetPage>
  );
};

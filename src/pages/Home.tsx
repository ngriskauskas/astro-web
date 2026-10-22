import { Link } from "react-router-dom";
import {
  AscendantTodayWidget,
  AtAGlanceWidget,
  MoonTimingsWidget,
  NatalSnapshotWidget,
  PlanetaryHourWidget,
  QuickLinksWidget,
  WeeklyTimingsWidget,
  Widget,
  WidgetPage,
  WidgetSplit,
} from "../components/widgets";
import { Spinner } from "../components/utils/Spinner";
import { useAuth } from "../contexts/AuthContext";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";

export const Home = () => {
  const { user, loading: userLoading } = useAuth();
  const { mainProfile, loading: profilesLoading } = useBirthProfiles();

  if (userLoading || profilesLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <Spinner />
      </main>
    );
  }

  if (!mainProfile) {
    return (
      <HomeNotice
        eyebrow="Welcome to Astro"
        title="Start with your birth chart"
        detail="Add your birth details to see your chart and a sky dashboard tailored to you."
        action="Add birth details"
      />
    );
  }

  if (!user?.location.address) {
    return (
      <HomeNotice
        eyebrow="Your chart is ready"
        title="Add your location to see today's sky"
        detail="Daily planetary hours and local timings need your location. Add it to your profile to complete your home dashboard."
        action="Add your location"
      />
    );
  }

  return (
    <WidgetPage chart="time">
      <QuickLinksWidget />
      <WidgetSplit
        main={
          <>
            <AtAGlanceWidget />
            <PlanetaryHourWidget />
            <NatalSnapshotWidget link={{ to: "/natal", label: "Open natal chart" }} />
          </>
        }
        side={
          <>
            <MoonTimingsWidget />
            <AscendantTodayWidget />
          </>
        }
        bottom={
          <WeeklyTimingsWidget
            className="xl:col-span-12"
            link={{ to: "/daily", label: "Explore Daily" }}
          />
        }
      />
    </WidgetPage>
  );
};

const HomeNotice = ({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  action: string;
}) => (
  <main className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
    <Widget id="home-notice" eyebrow={eyebrow} title={title} subtitle={detail} headingLevel={1}>
      <Link
        to="/profile"
        className="mt-3 inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-indigo-600 px-4 font-medium text-white hover:bg-indigo-700"
      >
        {action}
      </Link>
    </Widget>
  </main>
);

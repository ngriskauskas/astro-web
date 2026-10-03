import { useDesc } from "../../contexts/DescContext";
import type { ZodiacSign } from "../../types/zodiac";
import { PlanetPanel } from "./PlanetPanel";
import { SignPanel } from "./SignPanel";
import { AspectPanel } from "./AspectPanel";
import { HousePanel } from "./HousePanel";
import { type PlanetName } from "../../types/planet";
import { type AspectDisplay } from "../../types/aspect";
import { AnglePanel } from "./AnglePanel";
import type { CuspType, KeyType } from "../../types/cusp";
import { KeyAngleTimingPanel } from "./KeyAngleTimingPanel";
import type { AngleTiming, AspectTiming, TimingEvent } from "../../types/timings";
import { DailyAspectTimingPanel } from "./DailyAspectTimingPanel";
import { AspectTimingPanel } from "./AspectTimingPanel";
import { IngressTimingPanel } from "./IngressPanel";
import { RetrogradeTimingPanel } from "./RetrogradeTimingPanel";
import { StationTimingPanel } from "./StationTimingPanel";
import { MoonPhasePanel } from "./MoonPhasePanel";
import type { MoonPhaseDescriptionValue } from "../../types/moon";

export const DescriptionSidePanel = () => {
  const { active } = useDesc();

  if (!active) return null;

  const renderPanel = () => {
    switch (active.type) {
      case "planet":
        return <PlanetPanel planetName={active.value as PlanetName} owner={active.owner} />;
      case "sign":
        return <SignPanel sign={active.value as ZodiacSign} />;
      case "aspect":
        return <AspectPanel aspect={active.value as AspectDisplay} />;
      case "house":
        return <HousePanel houseName={active.value as CuspType} owner={active.owner} />;
      case "angle":
        return <AnglePanel angle={active.value as KeyType} owner={active.owner} />;
      case "keyAngleTiming":
        return <KeyAngleTimingPanel timing={active.value as AngleTiming} />;
      case "dailyAspectTiming":
        return <DailyAspectTimingPanel timing={active.value as AspectTiming} />;
      case "aspectTiming":
        return (
          <AspectTimingPanel event={active.value as Extract<TimingEvent, { type: "aspect" }>} />
        );
      case "ingressTiming":
        return (
          <IngressTimingPanel ingress={active.value as Extract<TimingEvent, { type: "ingress" }>} />
        );
      case "retrogradeTiming":
        return (
          <RetrogradeTimingPanel
            retrograde={active.value as Extract<TimingEvent, { type: "retrograde" }>}
          />
        );
      case "stationTiming":
        return (
          <StationTimingPanel station={active.value as Extract<TimingEvent, { type: "station" }>} />
        );
      case "moonphase":
        return <MoonPhasePanel value={active.value as MoonPhaseDescriptionValue} />;
      default:
        return null;
    }
  };
  // Covers the screen on a phone; a panel on the right from tablet width up.
  return (
    <aside
      aria-label="Description"
      className="fixed inset-0 z-50 flex flex-col bg-white shadow-2xl md:left-auto md:w-100 md:max-w-full md:border-l md:border-gray-200"
    >
      {renderPanel()}
    </aside>
  );
};

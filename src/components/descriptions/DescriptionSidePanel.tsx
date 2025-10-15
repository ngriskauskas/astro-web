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
import { MoonPhasePanel } from "./MoonPhasePanel";
import type { MoonPhaseTiming } from "../../hooks/timings/useMoonTimings";
import { KeyAngleTimingPanel } from "./KeyAngleTimingPanel";
import type {
  DailyAspectTiming,
  KeyAngleTiming,
} from "../../hooks/timings/useDailyTimings";
import { DailyAspectTimingPanel } from "./DailyAspectTimingPanel";
import { AspectTimingPanel } from "./AspectTimingPanel";
import type { TimingEvent } from "../../hooks/timings/useTimings";
import { IngressTimingPanel } from "./IngressPanel";
import { RetrogradeTimingPanel } from "./RetrogradeTimingPanel";

export const DescriptionSidePanel = () => {
  const { active } = useDesc();

  if (!active) return null;

  const renderPanel = () => {
    switch (active.type) {
      case "planet":
        return (
          <PlanetPanel
            planetName={active.value as PlanetName}
            owner={active.owner}
          />
        );
      case "sign":
        return <SignPanel sign={active.value as ZodiacSign} />;
      case "aspect":
        return <AspectPanel aspect={active.value as AspectDisplay} />;
      case "house":
        return (
          <HousePanel
            houseName={active.value as CuspType}
            owner={active.owner}
          />
        );
      case "angle":
        return <AnglePanel angle={active.value as KeyType} />;
      case "moonphase":
        return <MoonPhasePanel phase={active.value as MoonPhaseTiming} />;
      case "keyAngleTiming":
        return <KeyAngleTimingPanel timing={active.value as KeyAngleTiming} />;
      case "dailyAspectTiming":
        return (
          <DailyAspectTimingPanel timing={active.value as DailyAspectTiming} />
        );
      case "aspectTiming":
        return <AspectTimingPanel event={active.value as TimingEvent} />;
      case "ingressTiming":
        return <IngressTimingPanel ingress={active.value as TimingEvent} />;
      case "retrogradeTiming":
        return (
          <RetrogradeTimingPanel retrograde={active.value as TimingEvent} />
        );
      default:
        return null;
    }
  };
  return (
    <div
      className="fixed top-0 right-0 h-full w-100 bg-white shadow-2xl border-l 
        border-gray-200 z-50 flex flex-col"
    >
      {renderPanel()}
    </div>
  );
};

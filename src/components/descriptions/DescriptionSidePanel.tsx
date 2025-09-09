import { useDesc } from "../../contexts/DescContext";
import type { ZodiacSign } from "../../types/zodiac";
import { PlanetPanel } from "./PlanetPanel";
import { SignPanel } from "./SignPanel";
import { AspectPanel } from "./AspectPanel";
import { HousePanel } from "./HousePanel";
import { type PlanetName } from "../../types/planet";
import { type Aspect } from "../../types/aspect";
import { AnglePanel } from "./AnglePanel";

export const DescriptionSidePanel = () => {
  const { active } = useDesc();

  if (!active) return null;

  const renderPanel = () => {
    switch (active.type) {
      case "planet":
        return (
          <PlanetPanel
            planet={active.value as PlanetName}
            owner={active.owner}
          />
        );
      case "sign":
        return <SignPanel sign={active.value as ZodiacSign} />;
      case "aspect":
        return <AspectPanel aspect={active.value as Aspect} />;
      case "house":
        return (
          <HousePanel house={active.value as string} owner={active.owner} />
        );
      case "angle":
        return <AnglePanel angle={active.value as string} />;
      default:
        return null;
    }
  };
  return (
    <div
      className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl border-l 
        border-gray-200 z-50 flex flex-col"
    >
      {renderPanel()}
    </div>
  );
};

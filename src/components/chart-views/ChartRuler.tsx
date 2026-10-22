import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { ZodiacData, type ZodiacSign } from "../../types/zodiac";
import { BirthTimeNotice } from "../utils/BirthTimeNotice";
import { LoadError } from "../utils/LoadError";
import { PlanetChip } from "../utils/PlanetChip";
import { SignChip } from "../utils/SignChip";
import { Spinner } from "../utils/Spinner";
import { PlanetInChart } from "./PlanetInChart";

// The Ascendant's sign and the planet that rules it. The ruler's own card follows: its sign,
// house, dignity and aspects to the angles.
export const ChartRuler = () => {
  const { keyAngles, status, timeUnknown } = useWheel() as SingleWheelContextType;
  if (status === "error") return <LoadError message="Could not load the chart ruler." />;
  if (timeUnknown) return <BirthTimeNotice />;
  const ascendant = keyAngles.find((angle) => angle.name === "ASC");
  if (status === "loading" || !ascendant) return <Spinner />;

  const sign = ascendant.sign as ZodiacSign;
  const [ruler, ...others] = ZodiacData[sign].info.rulers;
  if (ruler === undefined) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <p className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
        <span>The Ascendant is in</span>
        <SignChip sign={sign} />
        <span>so its ruler is</span>
        <PlanetChip planet={ruler} />
        {others.length > 0 && (
          <>
            <span>, also</span>
            {others.map((planet) => (
              <PlanetChip key={planet} planet={planet} />
            ))}
          </>
        )}
      </p>
      <PlanetInChart planetName={ruler} />
    </div>
  );
};

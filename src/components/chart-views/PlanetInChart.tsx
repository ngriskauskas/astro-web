import type { OwnerType } from "../../contexts/MultiWheelContext";
import { usePlanetData } from "../../hooks/chart/useChartData";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { ZodiacData } from "../../types/zodiac";
import { DIGNITY, dignitiesOf } from "../../utils/natalSummary";
import { AspectChip } from "../utils/AspectChip";
import { CHIP_BASE, chipTint } from "../utils/chipStyles";
import { HouseChip } from "../utils/HouseChip";


// Where a planet sits in this chart: its sign and house, whether it is strong or weak there,
// and its aspects to the angles.
export const PlanetInChart = ({
  planetName,
  owner,
}: {
  planetName: PlanetName;
  owner?: OwnerType;
}) => {
  const { planet, aspects } = usePlanetData(planetName, owner);
  const dignities = dignitiesOf(planetName, planet.sign);
  const sign = ZodiacData[planet.sign];
  const angleAspects = aspects.filter(
    (aspect) => aspect.point1.type === "Angle" || aspect.point2.type === "Angle",
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div
          className="flex min-w-0 items-center gap-3 rounded-xl border p-3"
          style={{ borderColor: `${sign.color}55`, background: `linear-gradient(135deg, ${sign.color}1f, transparent 80%)` }}
        >
          <img src={sign.glyph} alt="" aria-hidden="true" className="h-8 w-6 shrink-0 object-contain" />
          <div className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">Sign</span>
            <span className="block truncate text-sm font-medium text-gray-900">{sign.displayName}</span>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">House</span>
            <span className="mt-1 block">
              <HouseChip house={planet.house} owner={owner} />
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {dignities.length === 0 ? (
          <span className={`${CHIP_BASE} border-gray-200 bg-white text-gray-600`}>
            {PlanetsData[planetName].displayName} is neither strong nor weak in this sign
          </span>
        ) : (
          dignities.map((dignity) => (
            <span key={dignity} className={CHIP_BASE} style={chipTint(DIGNITY[dignity].color)}>
              {DIGNITY[dignity].text}
            </span>
          ))
        )}
      </div>

      <div>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Aspects to the angles
        </h4>
        {angleAspects.length === 0 ? (
          <p className="text-sm text-gray-500">No aspects to the angles.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {angleAspects.map((aspect, index) => (
              <li key={index}>
                <AspectChip aspect={aspect} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

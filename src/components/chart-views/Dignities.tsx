import { useState } from "react";
import { useDesc } from "../../contexts/DescContext";
import type { SingleWheelContextType } from "../../contexts/SingleWheelContext";
import { useWheel } from "../../hooks/useWheel";
import { HouseData, type CuspType } from "../../types/cusp";
import type { PlanetName } from "../../types/planet";
import { PlanetsData } from "../../types/planet";
import { ZodiacData, type ZodiacSign } from "../../types/zodiac";
import {
  CORE_PLANETS,
  DIGNITY,
  dignitiesOf,
  houseStrengthOf,
  inJoy,
  type Dignity,
  type HouseStrength,
} from "../../utils/natalSummary";
import { CHIP_BASE, CHIP_INTERACTIVE, chipTint } from "../utils/chipStyles";
import { LoadError } from "../utils/LoadError";
import { Spinner } from "../utils/Spinner";

type Basis = "sign" | "house";

// Sign view: the four ways a planet can stand in its sign, strongest first.
const SIGN_GROUPS: readonly { dignity: Dignity; heading: string; note: string }[] = [
  { dignity: "ruling", heading: "At home", note: "It rules the sign it is in." },
  { dignity: "exalted", heading: "Exalted", note: "Especially strong in this sign." },
  { dignity: "detriment", heading: "Detriment", note: "Opposite its home sign, so strained." },
  { dignity: "fall", heading: "Fall", note: "Opposite its exaltation, so at its weakest." },
];

// House view: the three house strengths, strongest first.
const HOUSE_GROUPS: readonly { strength: HouseStrength; heading: string; note: string; color: string }[] = [
  { strength: "angular", heading: "Angular", note: "Houses 1, 4, 7 and 10. Acts most directly.", color: "#4f46e5" },
  { strength: "succedent", heading: "Succedent", note: "Houses 2, 5, 8 and 11. Steady, built over time.", color: "#c08a2b" },
  { strength: "cadent", heading: "Cadent", note: "Houses 3, 6, 9 and 12. Works in the background.", color: "#6b7280" },
];

// Every core planet with the sign and house it sits in, and what that means for each basis.
export const DignitiesBoard = () => {
  const { planetAngles, status } = useWheel() as SingleWheelContextType;
  const [basis, setBasis] = useState<Basis>("sign");
  if (status === "error") return <LoadError message="Could not load the dignities." />;
  if (status === "loading" || planetAngles.length === 0) return <Spinner />;

  const placed = planetAngles
    .filter((planet) => CORE_PLANETS.includes(planet.name))
    .map((planet) => ({
      name: planet.name,
      sign: planet.sign as ZodiacSign,
      house: planet.house,
      dignities: dignitiesOf(planet.name, planet.sign as ZodiacSign),
    }));

  return (
    <div className="flex flex-col gap-5">
      <div
        role="group"
        aria-label="Dignity basis"
        className="flex w-fit items-center gap-1 rounded-full border border-gray-200 bg-white p-1"
      >
        {(["sign", "house"] as const).map((option) => {
          const selected = basis === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => setBasis(option)}
              className={`cursor-pointer rounded-full px-3 py-1 text-sm transition-colors ${
                selected ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {option === "sign" ? "By sign" : "By house"}
            </button>
          );
        })}
      </div>

      {basis === "sign" ? <SignView placed={placed} /> : <HouseView placed={placed} />}
    </div>
  );
};

type Placed = {
  name: PlanetName;
  sign: ZodiacSign;
  house: CuspType;
  dignities: Dignity[];
};

const SignView = ({ placed }: { placed: Placed[] }) => {
  const plain = placed.filter((planet) => planet.dignities.length === 0).length;
  return (
    <>
      {SIGN_GROUPS.map(({ dignity, heading, note }) => {
        const entries = placed.filter((planet) => planet.dignities.includes(dignity));
        return (
          <Group key={dignity} heading={heading} note={note} color={DIGNITY[dignity].color}>
            {entries.map((planet) => (
              <PlacementPill
                key={planet.name}
                planet={planet.name}
                color={DIGNITY[dignity].color}
                label={
                  <>
                    in{" "}
                    <img src={ZodiacData[planet.sign].glyph} alt="" className="inline h-3.5 w-3.5 align-[-2px]" />{" "}
                    {ZodiacData[planet.sign].displayName}
                  </>
                }
              />
            ))}
          </Group>
        );
      })}
      <p className="text-sm text-gray-500">
        {plain} of {placed.length} planets have no special strength in their sign.
      </p>
    </>
  );
};

const HouseView = ({ placed }: { placed: Placed[] }) => {
  const joy = placed.filter((planet) => inJoy(planet.name, planet.house)).length;
  return (
    <>
      {HOUSE_GROUPS.map(({ strength, heading, note, color }) => {
        const entries = placed.filter((planet) => houseStrengthOf(planet.house) === strength);
        return (
          <Group key={strength} heading={heading} note={note} color={color}>
            {entries.map((planet) => (
              <PlacementPill
                key={planet.name}
                planet={planet.name}
                color={color}
                label={
                  <>
                    in {HouseData[planet.house].name}
                    {inJoy(planet.name, planet.house) && <span className="text-gray-500"> · in joy</span>}
                  </>
                }
              />
            ))}
          </Group>
        );
      })}
      <p className="text-sm text-gray-500">
        {joy} of {placed.length} planets are in their house of joy.
      </p>
    </>
  );
};

// A heading with a line saying what it means, then the planets it holds.
const Group = ({
  heading,
  note,
  color,
  children,
}: {
  heading: string;
  note: string;
  color: string;
  children: React.ReactNode;
}) => {
  const entries = Array.isArray(children) ? children : [children];
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {heading}
      </h3>
      <p className="mb-2 text-xs text-gray-500">{note}</p>
      {entries.length === 0 ? (
        <p className={`${CHIP_BASE} border-dashed border-gray-300 bg-transparent text-gray-400`}>None in this chart</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">{children}</div>
      )}
    </div>
  );
};

// One planet and where it stands, as a single chip that opens the planet's drawer.
const PlacementPill = ({
  planet,
  color,
  label,
}: {
  planet: PlanetName;
  color: string;
  label: React.ReactNode;
}) => {
  const { open } = useDesc();
  const info = PlanetsData[planet];
  return (
    <button
      type="button"
      className={`${CHIP_BASE} ${CHIP_INTERACTIVE} gap-1.5 whitespace-nowrap`}
      style={chipTint(color)}
      onClick={() => open({ type: "planet", value: planet })}
    >
      <span aria-hidden="true" className="text-sm leading-none">
        {info.glyph}
      </span>
      <span className="font-medium">
        {info.displayName} <span className="font-normal text-gray-700">{label}</span>
      </span>
    </button>
  );
};

import { useDesc } from "../../contexts/DescContext";
import { FiX, FiArrowLeft, FiChevronUp, FiChevronDown } from "react-icons/fi";
import type { ZodiacSign } from "../../types/zodiac";
import { ZodiacData } from "../../types/zodiac";
import { PlanetsData, type PlanetName } from "../../types/planet";
import { useState } from "react";
import { AspectData, type Aspect } from "../../types/aspect";
import { HouseData } from "../../types/cusp";

export const Section = ({
  title,
  children,
  startOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  startOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(startOpen);
  return (
    <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </div>
      {isOpen && (
        <div className="p-3 text-sm text-gray-800 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

export const CloseButton = () => {
  const { close } = useDesc();
  return (
    <button
      onClick={close}
      className="text-gray-700 hover:text-gray-900 cursor-pointer"
    >
      <FiX size={20} />
    </button>
  );
};

export const BackButton = () => {
  const { goBack } = useDesc();
  return (
    <button
      onClick={goBack}
      className="text-gray-700 hover:text-gray-900 cursor-pointer"
    >
      <FiArrowLeft size={20} />
    </button>
  );
};

export const OverviewCard = ({
  title,
  glyph,
  value,
  onClick,
}: {
  title: string;
  glyph?: string | React.ReactNode;
  value: string | number;
  onClick?: () => void;
}) => (
  <div
    className={`flex flex-col items-center p-1 bg-white border rounded shadow-sm ${
      onClick ? "cursor-pointer hover:shadow-md" : ""
    }`}
    onClick={onClick}
  >
    <span className="text-gray-400 text-xs uppercase tracking-wide mb-1 text-center">
      {title}
    </span>

    <div className="flex items-center gap-1 mt-1">
      {typeof glyph === "string" ? (
        <img src={glyph} alt={String(value)} width={20} height={20} />
      ) : (
        glyph
      )}
      <span className="font-medium text-sm">{value}</span>
    </div>
  </div>
);

export const PlanetChip = ({ planet }: { planet: PlanetName }) => {
  const { open } = useDesc();
  return (
    <div
      className="flex items-center gap-1 px-1 py-0.5 bg-white border rounded shadow-sm text-xs font-medium cursor-pointer hover:shadow-md"
      onClick={() => open({ type: "planet", value: planet })}
    >
      <span className="text-base">{PlanetsData[planet].glyph}</span>
      <span className="capitalize">{planet}</span>
    </div>
  );
};

export const PlanetGroup = ({
  title,
  planets,
}: {
  title: string;
  planets: PlanetName[];
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-gray-500 text-xs uppercase tracking-wide">
      {title}
    </span>

    <div className="flex flex-wrap gap-1">
      {planets.length === 0 ? (
        <span className="text-gray-500">—</span>
      ) : (
        planets.map((planet) => <PlanetChip key={planet} planet={planet} />)
      )}
    </div>
  </div>
);

export const SignChip = ({ sign }: { sign: ZodiacSign }) => {
  const { open } = useDesc();
  const signData = ZodiacData[sign];
  return (
    <div
      className="flex items-center gap-1 px-1 py-1 bg-white border rounded shadow-sm text-xs font-medium cursor-pointer hover:shadow-md"
      onClick={() => open({ type: "sign", value: sign })}
    >
      <img src={signData.glyph} alt={sign} className="w-4 h-4" />
      <span className="capitalize">{sign}</span>
    </div>
  );
};

export const SignGroup = ({
  title,
  signs,
}: {
  title: string;
  signs: ZodiacSign[];
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-gray-500 text-xs uppercase tracking-wide">
      {title}
    </span>

    <div className="flex flex-wrap gap-1">
      {signs.length === 0 ? (
        <span className="text-gray-500">—</span>
      ) : (
        signs.map((sign) => <SignChip key={sign} sign={sign} />)
      )}
    </div>
  </div>
);

export const AspectChip = ({ aspect }: { aspect: Aspect }) => {
  const { open } = useDesc();

  return (
    <div
      className="flex items-center gap-1 px-1 py-0.5 bg-white border rounded shadow-sm text-xs font-medium cursor-pointer hover:shadow-md"
      onClick={() => open({ type: "aspect", value: aspect })}
    >
      <span className="text-base">
        {PlanetsData[aspect.planet1.name].glyph}
      </span>
      <span className="capitalize">{aspect.planet1.name}</span>
      <span className="text-base">{AspectData[aspect.type].glyph}</span>
      <span className="text-base">
        {PlanetsData[aspect.planet2.name].glyph}
      </span>
      <span className="capitalize">{aspect.planet2.name}</span>
      <span className="text-gray-500 text-[10px] ml-1">{aspect.orb}°</span>
    </div>
  );
};

export const HouseChip = ({ house }: { house: number }) => {
  const { open } = useDesc();
  const houseInfo = HouseData[house];
  return (
    <div
      className="flex items-center gap-1 px-1 py-1 bg-white border rounded shadow-sm text-xs font-medium cursor-pointer hover:shadow-md"
      onClick={() => open({ type: "house", value: house })}
    >
      <span className="font-xs">{houseInfo.name}</span>
    </div>
  );
};

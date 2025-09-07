import { PlanetsData, ZodiacData } from "../constants/zodiac";
import { useDesc } from "../contexts/DescContext";

type SvgComp = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export const DescriptionSidePanel = () => {
  const { active, close } = useDesc();

  if (!active) return null;
  const zodiacInfo = ZodiacData[active.id as keyof typeof ZodiacData];
  const planetInfo = PlanetsData[active.id as keyof typeof PlanetsData];
  const SignGlyph = zodiacInfo?.glyph as unknown as SvgComp | undefined;
  const PlanetGlyph = planetInfo?.glyph as unknown as SvgComp | undefined;
  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200"
        style={{ backgroundColor: zodiacInfo?.color ?? "#fff" }}
      >
        <div className="flex items-center gap-3">
          {/* Glyph */}
          {zodiacInfo && (
            <div className="text-3xl" style={{ color: zodiacInfo.color }}>
              <img src={zodiacInfo.glyph} width={25} height={25} />
            </div>
          )}
          {planetInfo && (
            <div
              className="text-3xl"
              style={{ transform: `scale(${planetInfo.scale})` }}
            >
              {planetInfo.glyph}
            </div>
          )}
          {/* Title */}
          <h2 className="text-xl font-semibold capitalize">{active.id}</h2>
        </div>
        <button
          onClick={close}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-gray-700 leading-relaxed">{active.desc}</p>
      </div>
    </div>
  );
};

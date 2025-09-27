import { useDesc } from "../../contexts/DescContext";
import { PlanetsData } from "../../types/planet";
import { AspectData, type AspectDisplay } from "../../types/aspect";

export const AspectChip = ({ aspect }: { aspect: AspectDisplay }) => {
  const { open } = useDesc();
  const { color, glyph: aspectGylph } = AspectData[aspect.type];
  return (
    <div
      className="flex items-center gap-1 px-1 py-0.5 bg-white border rounded shadow-sm text-xs font-medium cursor-pointer hover:shadow-md"
      onClick={() => open({ type: "aspect", value: aspect })}
      style={{
        backgroundColor: `${color}11`,
        borderColor: `${color}55`,
      }}
    >
      <span className="text-base">
        {PlanetsData[aspect.planet1.name].glyph}
      </span>
      <span className="capitalize">{aspect.planet1.name}</span>
      <span className="text-base">{aspectGylph}</span>
      <span className="text-base">
        {PlanetsData[aspect.planet2.name].glyph}
      </span>
      <span className="capitalize">{aspect.planet2.name}</span>
      {aspect.orb && (
        <span className="text-gray-500 text-[10px] ml-1">{aspect.orb}°</span>
      )}
    </div>
  );
};

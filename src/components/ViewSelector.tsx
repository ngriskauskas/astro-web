import { useState } from "react";
import { MultiZodiacWheel } from "./wheel/MultiZodiacWheel";
import { ZodiacWheel } from "./wheel/ZodiacWheel";
import { PlacementsTable } from "./chart-views/PlacementsTable";
import { AspectMatrix } from "./chart-views/AspectMatrix";

export const ViewSelector = ({ isMulti = false }: { isMulti?: boolean }) => {
  const [view, setView] = useState("wheel");

  const renderView = () => {
    switch (view) {
      case "wheel":
        return isMulti ? <MultiZodiacWheel /> : <ZodiacWheel />;
      case "placements":
        return <PlacementsTable />;
      case "aspectMatrix":
        return <AspectMatrix />;
    }
  };

  return (
    <div className="mt-5 flex flex-col items-center">
      <div className="flex items-center mb-4 gap-2">
        <label
          htmlFor="chart-view"
          className="text-sm font-medium text-gray-700"
        >
          Chart View:
        </label>
        <select
          id="chart-view"
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="p-2 border rounded text-sm"
        >
          <option value="wheel">Zodiac Wheel</option>
          <option value="placements">Basic</option>
          <option value="aspectMatrix">Aspect Matrix</option>
          <option value="houses">House Overview</option>
          <option value="elements">Elements and Qualities</option>
          <option value="dignity">Planetary Strength</option>
          <option value="graph">Aspect Graph</option>
          <option value="summary">Summary / Insights</option>
        </select>
      </div>
      <div className="w-full max-w-5xl h-[600px]">{renderView()}</div>
    </div>
  );
};

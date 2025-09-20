import { useState } from "react";
import { MultiZodiacWheel } from "./wheel/MultiZodiacWheel";
import { ZodiacWheel } from "./wheel/ZodiacWheel";
import { PlacementsTable } from "./chart-views/PlacementsTable";
import { AspectMatrix } from "./chart-views/AspectMatrix";
import { MultiAspectMatrix } from "./chart-views/MultiAspectMatrix";
import { CurrentTimings } from "./chart-views/CurrentTimings";

type PageType = "natal" | "time" | "transit" | "synastry" | "moment";

export const ViewSelector = ({
  isMulti = false,
  page,
}: {
  isMulti?: boolean;
  page: PageType;
}) => {
  const [view, setView] = useState("wheel");

  const renderView = () => {
    switch (view) {
      case "wheel":
        return isMulti ? <MultiZodiacWheel /> : <ZodiacWheel />;
      case "placements":
        return <PlacementsTable />;
      case "aspectMatrix":
        return isMulti ? <MultiAspectMatrix /> : <AspectMatrix />;
      case "timings":
        return <CurrentTimings />;
    }
  };

  return (
    <div className="mt-5 flex flex-col">
      <div className="flex items-center mb-4 gap-2 ml-8">
        <label
          htmlFor="chart-view"
          className="text-sm font-medium text-gray-700"
        >
          View:
        </label>
        <select
          id="chart-view"
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="p-2 border rounded text-sm"
        >
          <option value="wheel">Zodiac Wheel</option>
          {!isMulti && <option value="placements">Basic</option>}
          {page === "time" && <option value="timings">Timings</option>}
          <option value="aspectMatrix">Aspect Matrix</option>
        </select>
      </div>
      <div className="w-full max-w-5xl h-[600px]">{renderView()}</div>
    </div>
  );
};

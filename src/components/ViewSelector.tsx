import {
  useLocation,
  useNavigate,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { MultiZodiacWheel } from "./wheel/MultiZodiacWheel";
import { ZodiacWheel } from "./wheel/ZodiacWheel";
import { PlacementsTable } from "./chart-views/PlacementsTable";
import { AspectMatrix } from "./chart-views/AspectMatrix";
import { MultiAspectMatrix } from "./chart-views/MultiAspectMatrix";
import { CurrentTimings } from "./chart-views/CurrentTimings";
import { useEffect, useState } from "react";
import { MoonTimings } from "./chart-views/MoonTimings";
import { PlanetTimings } from "./chart-views/PlanetTimings";

type PageType = "natal" | "time" | "transit" | "synastry" | "moment";

interface ViewSelectorProps {
  isMulti?: boolean;
  page: PageType;
}

export const ViewSelector = ({ isMulti = false, page }: ViewSelectorProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split("/").filter(Boolean);
  const currentView = pathParts[1] || "zodiac-wheel";
  const [selectedView, setSelectedView] = useState(currentView);

  useEffect(() => {
    setSelectedView(currentView);
  }, [currentView]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedView(e.target.value);
    navigate(`/${page}/${e.target.value}`);
  };
  const renderView = (view: string) => {
    switch (view) {
      case "zodiac-wheel":
        return isMulti ? <MultiZodiacWheel /> : <ZodiacWheel />;
      case "placements":
        return <PlacementsTable />;
      case "aspect-matrix":
        return isMulti ? <MultiAspectMatrix /> : <AspectMatrix />;
      case "timings":
        return <CurrentTimings />;
      case "moon-timings":
        return <MoonTimings />;
      case "planet-timings":
        return <PlanetTimings />;
      default:
        return <div>Unknown view</div>;
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
          value={selectedView}
          onChange={handleChange}
          className="p-2 border rounded text-sm"
        >
          <option value="zodiac-wheel">Zodiac Wheel</option>
          <option value="aspect-matrix">Aspect Matrix</option>
          {!isMulti && <option value="placements">Basic</option>}
          {(page === "time" || page === "transit") && (
            <option value="timings">Timings</option>
          )}
          {page === "time" && (
            <option value="moon-timings">Moon Timings</option>
          )}
          {page === "transit" && (
            <option value="planet-timings">Planet Timings</option>
          )}
        </select>
      </div>

      <div className="w-full max-w-5xl h-[600px] mt-2">
        <Routes>
          <Route index element={<Navigate to="zodiac-wheel" replace />} />
          <Route path="zodiac-wheel" element={renderView("zodiac-wheel")} />
          {!isMulti && (
            <Route path="placements" element={renderView("placements")} />
          )}
          <Route path="timings" element={renderView("timings")} />
          <Route path="aspect-matrix" element={renderView("aspect-matrix")} />
          <Route path="moon-timings" element={renderView("moon-timings")} />
          <Route path="planet-timings" element={renderView("planet-timings")} />
        </Routes>
      </div>
    </div>
  );
};

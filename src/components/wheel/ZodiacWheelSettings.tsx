import { useState } from "react";
import type { BirthProfile } from "../../contexts/BirthProfilesContext";
import {
  AYANAMSAS,
  HOUSE_SYSTEMS,
  ZODIAC_SYSTEMS,
  type Ayanamsa,
  type HouseSystem,
  type ZodiacSystem,
} from "../../contexts/ChartContext";

export interface AspectOptions {
  conjunction: {
    show: boolean;
    minOrb: number;
  };
  opposition: {
    show: boolean;
    minOrb: number;
  };
  trine: {
    show: boolean;
    minOrb: number;
  };
  square: {
    show: boolean;
    minOrb: number;
  };
  sextile: {
    show: boolean;
    minOrb: number;
  };
}

export interface ObjectOptions {
  showChiron: boolean;
  lilith: "true" | "mean" | false;
}

export interface DisplayOptions {
  tickMarks: boolean;
  angleLabels: boolean;
}

export interface ZodiacWheelOptions {
  profileId?: number;
  zodiacSystem: ZodiacSystem;
  houseSystem: HouseSystem;
  ayanamsa?: Ayanamsa;
  aspectOptions: AspectOptions;
  displayOptions: DisplayOptions;
  objectOptions: ObjectOptions;
}

interface ZodiacWheelSettingsProps {
  options: ZodiacWheelOptions;
  profiles?: BirthProfile[];
  onChange: <K extends keyof ZodiacWheelOptions>(params: {
    key: K;
    value: ZodiacWheelOptions[K];
  }) => void;
}

export const ZodiacWheelSettings = ({
  options,
  profiles,
  onChange,
}: ZodiacWheelSettingsProps) => {
  const aspectKeys = Object.keys(
    options.aspectOptions,
  ) as (keyof typeof options.aspectOptions)[];
  const [aspectsOpen, setAspectsOpen] = useState(false);
  const [displayOpen, setDisplayOpen] = useState(false);
  const [objectOpen, setObjectOpen] = useState(false);

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-md text-xs">
      {/* Profile selector */}
      {profiles && (
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Profile</label>
          <select
            value={options.profileId}
            onChange={(e) =>
              onChange({ key: "profileId", value: Number(e.target.value) })
            }
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {profiles
              .filter((p) => p.name === "My Profile")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            {profiles
              .filter((p) => p.name !== "My Profile")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Zodiac & House System */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">
            Zodiac System
          </label>
          <select
            value={options.zodiacSystem}
            onChange={(e) =>
              onChange({ key: "zodiacSystem", value: e.target.value as any })
            }
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {ZODIAC_SYSTEMS.map((z) => (
              <option key={z} value={z}>
                {capitalize(z)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">House System</label>
          <select
            value={options.houseSystem}
            onChange={(e) =>
              onChange({ key: "houseSystem", value: e.target.value as any })
            }
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {HOUSE_SYSTEMS.map((h) => (
              <option key={h} value={h}>
                {capitalize(h)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ayanamsa (only for sidereal) */}
      {options.zodiacSystem === "sidereal" && (
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Ayanamsa</label>
          <select
            value={options.ayanamsa || ""}
            onChange={(e) =>
              onChange({ key: "ayanamsa", value: e.target.value as any })
            }
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {AYANAMSAS.map((a) => (
              <option key={a} value={a}>
                {capitalize(a)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Object Options */}
      <div>
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setObjectOpen(!objectOpen)}
        >
          <h3 className="font-semibold text-gray-800">Objects</h3>
          <span className="text-gray-500">{objectOpen ? "▼" : "▶"}</span>
        </div>
        {objectOpen && (
          <div className="mt-2 space-y-2">
            {/* Chiron */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.objectOptions.showChiron}
                onChange={(e) =>
                  onChange({
                    key: "objectOptions",
                    value: {
                      ...options.objectOptions,
                      showChiron: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-gray-700 font-medium">Show Chiron</span>
            </label>
            {/* Lilith */}
            <div className="flex flex-col">
              <label className="font-medium text-gray-700 mb-1">Lilith</label>
              <select
                value={
                  options.objectOptions.lilith === false
                    ? "false"
                    : options.objectOptions.lilith
                }
                onChange={(e) =>
                  onChange({
                    key: "objectOptions",
                    value: {
                      ...options.objectOptions,
                      lilith:
                        e.target.value === "false"
                          ? false
                          : (e.target.value as "true" | "mean"),
                    },
                  })
                }
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="false">Hide</option>
                <option value="true">True</option>
                <option value="mean">Mean</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Aspect Options */}
      <div>
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setAspectsOpen(!aspectsOpen)}
        >
          <h3 className="font-semibold text-gray-800">Aspects</h3>
          <span className="text-gray-500">{aspectsOpen ? "▼" : "▶"}</span>
        </div>

        {aspectsOpen && (
          <div className="mt-2 space-y-2">
            {aspectKeys.map((aspect) => (
              <div
                key={aspect}
                className="border rounded p-2 flex items-center justify-between bg-gray-50"
              >
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.aspectOptions[aspect].show}
                    onChange={(e) =>
                      onChange({
                        key: "aspectOptions",
                        value: {
                          ...options.aspectOptions,
                          [aspect]: {
                            ...options.aspectOptions[aspect],
                            show: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="text-gray-700 font-medium capitalize">
                    {aspect}
                  </span>
                </label>

                <input
                  type="number"
                  value={options.aspectOptions[aspect].minOrb}
                  onChange={(e) =>
                    onChange({
                      key: "aspectOptions",
                      value: {
                        ...options.aspectOptions,
                        [aspect]: {
                          ...options.aspectOptions[aspect],
                          minOrb: Number(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-12 border rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Display Options */}
      <div>
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setDisplayOpen(!displayOpen)}
        >
          <h3 className="font-semibold text-gray-800">Display</h3>
          <span className="text-gray-500">{displayOpen ? "▼" : "▶"}</span>
        </div>
        {displayOpen && (
          <div className="mt-2 space-y-2">
            {/* Tick Marks */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.displayOptions.tickMarks}
                onChange={(e) =>
                  onChange({
                    key: "displayOptions",
                    value: {
                      ...options.displayOptions,
                      tickMarks: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-gray-700 font-medium">Show Tick Marks</span>
            </label>

            {/* Angle Labels */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.displayOptions.angleLabels}
                onChange={(e) =>
                  onChange({
                    key: "displayOptions",
                    value: {
                      ...options.displayOptions,
                      angleLabels: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-gray-700 font-medium">
                Show Angle Labels
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

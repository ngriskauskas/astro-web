import { useState } from "react";
import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import { AYANAMSAS, type Ayanamsa } from "../../types/ayanamsa";
import { HOUSE_SYSTEMS, type HouseSystem } from "../../types/house-system";
import { ZODIAC_SYSTEMS, type ZodiacSystem } from "../../types/zodiac-system";

import { useWheel } from "../../hooks/useWheel";

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
  showLilith: boolean;
}

export interface DisplayOptions {
  tickMarks: boolean;
  angleLabels: boolean;
}

export interface ZodiacWheelOptions {
  profileId?: number;
  otherProfileId?: number;
  zodiacSystem: ZodiacSystem;
  houseSystem: HouseSystem;
  ayanamsa?: Ayanamsa;
  aspectOptions: AspectOptions;
  displayOptions: DisplayOptions;
  objectOptions: ObjectOptions;
  datetimeOptions?: {
    date: string;
    time: string;
  };
}

export const ZodiacWheelSettings = () => {
  const {
    type,
    settings: {
      aspectOptions,
      profileId,
      otherProfileId,
      datetimeOptions,
      objectOptions,
      displayOptions,
      houseSystem,
      zodiacSystem,
      ayanamsa,
    },
    setSettings,
  } = useWheel();

  const { profiles } = useBirthProfiles();

  const aspectKeys = Object.keys(
    aspectOptions,
  ) as (keyof typeof aspectOptions)[];
  const [aspectsOpen, setAspectsOpen] = useState(false);
  const [displayOpen, setDisplayOpen] = useState(false);
  const [objectOpen, setObjectOpen] = useState(false);

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-md text-xs">
      {/* Profile selector */}
      {type !== "time" && profiles && (
        <div>
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1">Profile</label>
            <select
              value={profileId}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  profileId: Number(e.target.value),
                }))
              }
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {profiles
                .filter((p) => p.id !== otherProfileId)
                .filter((p) => p.name === "My Profile")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              {profiles
                .filter((p) => p.id !== otherProfileId)
                .filter((p) => p.name !== "My Profile")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>
          {otherProfileId && (
            <div className="flex flex-col mt-4">
              <label className="font-medium text-gray-700 mb-1">
                Other Profile
              </label>
              <select
                value={otherProfileId}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    otherProfileId: Number(e.target.value),
                  }))
                }
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {profiles
                  .filter((p) => p.id !== profileId)
                  .filter((p) => p.name === "My Profile")
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                {profiles
                  .filter((p) => p.id !== profileId)
                  .filter((p) => p.name !== "My Profile")
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      )}
      {/* Date and Time Picker */}
      {datetimeOptions && (
        <div className="grid grid-cols-1 gap-4">
          {/* Date */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1 text-xs">
              Date
            </label>
            <input
              type="date"
              value={datetimeOptions.date}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  datetimeOptions: {
                    ...prev.datetimeOptions!,
                    date: e.target.value,
                  },
                }))
              }
              className="border rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Time */}
          <div className="flex flex-col">
            <label className="font-medium text-gray-700 mb-1 text-xs">
              Time
            </label>
            <input
              type="time"
              value={datetimeOptions.time}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  datetimeOptions: {
                    ...prev.datetimeOptions!,
                    time: e.target.value,
                  },
                }))
              }
              className="border rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>
      )}

      {/* Zodiac & House System */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">
            Zodiac System
          </label>
          <select
            value={zodiacSystem}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                zodiacSystem: e.target.value as ZodiacSystem,
              }))
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
            value={houseSystem}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                houseSystem: e.target.value as HouseSystem,
              }))
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
      {zodiacSystem === "sidereal" && (
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Ayanamsa</label>
          <select
            value={ayanamsa || ""}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                ayanamsa: e.target.value as Ayanamsa,
              }))
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
                checked={objectOptions.showChiron}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    objectOptions: {
                      ...prev.objectOptions,
                      showChiron: e.target.checked,
                    },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-gray-700 font-medium">Show Chiron</span>
            </label>
            {/* Lilith */}
            <div className="flex flex-col">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={objectOptions.showLilith}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      objectOptions: {
                        ...prev.objectOptions,
                        showLilith: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-400"
                />
                <span className="text-gray-700 font-medium">Show Llilith</span>
              </label>
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
                    checked={aspectOptions[aspect].show}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        aspectOptions: {
                          ...prev.aspectOptions,
                          [aspect]: {
                            ...prev.aspectOptions[aspect],
                            show: e.target.checked,
                          },
                        },
                      }))
                    }
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="text-gray-700 font-medium capitalize">
                    {aspect}
                  </span>
                </label>

                <input
                  type="number"
                  value={aspectOptions[aspect].minOrb}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      aspectOptions: {
                        ...prev.aspectOptions,
                        [aspect]: {
                          ...prev.aspectOptions[aspect],
                          minOrb: Number(e.target.value),
                        },
                      },
                    }))
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
                checked={displayOptions.tickMarks}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    displayOptions: {
                      ...prev.displayOptions,
                      tickMarks: e.target.checked,
                    },
                  }))
                }
                className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-gray-700 font-medium">Show Tick Marks</span>
            </label>

            {/* Angle Labels */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={displayOptions.angleLabels}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    displayOptions: {
                      ...prev.displayOptions,
                      angleLabels: e.target.checked,
                    },
                  }))
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

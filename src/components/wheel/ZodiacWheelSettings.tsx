import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import { useWheel } from "../../hooks/useWheel";

export interface ZodiacWheelOptions {
  profileId?: number;
  otherProfileId?: number;
  datetimeOptions?: {
    date: string;
    time: string;
  };
}

export const ZodiacWheelSettings = () => {
  const {
    type,
    settings: { profileId, otherProfileId, datetimeOptions },
    setSettings,
  } = useWheel();

  const { profiles } = useBirthProfiles();

  return (
    <div className="space-y-6 p-3 bg-white rounded-xl shadow-md text-xs border border-gray-400">
      {/* Profile selector */}
      {type !== "time" && type !== "moment" && profiles && (
        <div>
          <div className="flex flex-col">
            <label htmlFor="chart-profile" className="font-medium text-gray-700 mb-1">
              Profile
            </label>
            <select
              id="chart-profile"
              value={profileId}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  profileId: Number(e.target.value),
                }))
              }
              className="w-full min-w-0 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {profiles
                .filter((p) => p.id !== otherProfileId)
                .filter((p) => p.isMain === true)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              {profiles
                .filter((p) => p.id !== otherProfileId)
                .filter((p) => p.isMain !== true)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>
          {otherProfileId && (
            <div className="flex flex-col mt-4">
              <label htmlFor="chart-other-profile" className="font-medium text-gray-700 mb-1">
                Other Profile
              </label>
              <select
                id="chart-other-profile"
                value={otherProfileId}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    otherProfileId: Number(e.target.value),
                  }))
                }
                className="w-full min-w-0 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {profiles
                  .filter((p) => p.id !== profileId)
                  .filter((p) => p.isMain === true)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                {profiles
                  .filter((p) => p.id !== profileId)
                  .filter((p) => p.isMain !== true)
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
            <label htmlFor="chart-date" className="font-medium text-gray-700 mb-1 text-xs">
              Date
            </label>
            <input
              id="chart-date"
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
              className="w-full min-w-0 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs"
            />
          </div>

          {/* Time */}
          <div className="flex flex-col">
            <label htmlFor="chart-time" className="font-medium text-gray-700 mb-1 text-xs">
              Time
            </label>
            <input
              id="chart-time"
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
              className="w-full min-w-0 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};

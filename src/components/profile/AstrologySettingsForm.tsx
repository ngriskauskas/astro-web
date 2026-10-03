import { useEffect, useId, useState } from "react";
import toast from "react-hot-toast";
import { useChartSettings } from "../../contexts/ChartSettingsContext";
import type { AspectOptions, AstrologySettings } from "../../types/astrologySettings";
import { AYANAMSAS, type Ayanamsa } from "../../types/ayanamsa";
import { HOUSE_SYSTEMS, type HouseSystem } from "../../types/house-system";
import { ZODIAC_SYSTEMS, type ZodiacSystem } from "../../types/zodiac-system";

const formatEnumLabel = (value: string) =>
  value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export const AstrologySettingsForm = () => {
  const { settings: contextSettings, updateSettings, resetSettings, loading } = useChartSettings();

  const [settings, setSettings] = useState<AstrologySettings>(contextSettings);
  const [saving, setSaving] = useState(false);
  const fieldId = useId();

  useEffect(() => {
    setSettings(contextSettings);
  }, [contextSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings(settings);
      toast.success("Astrology settings updated");
    } catch (err) {
      toast.error((err instanceof Error && err.message) || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      await resetSettings();
      toast.success("Settings reset to defaults");
    } catch (err) {
      toast.error((err instanceof Error && err.message) || "Failed to reset settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAspectToggle = (key: keyof AspectOptions) => {
    setSettings((prev) => ({
      ...prev,
      aspectOptions: {
        ...prev.aspectOptions,
        [key]: {
          ...prev.aspectOptions[key],
          show: !prev.aspectOptions[key].show,
        },
      },
    }));
  };

  const handleOrbChange = (key: keyof AspectOptions, value: number) => {
    setSettings((prev) => ({
      ...prev,
      aspectOptions: {
        ...prev.aspectOptions,
        [key]: {
          ...prev.aspectOptions[key],
          minOrb: Math.min(15, Math.max(0, value)),
        },
      },
    }));
  };

  if (loading) {
    return <div className="text-sm text-gray-500 p-4">Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Systems & Calculation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`${fieldId}-zodiac`}
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Zodiac System
            </label>
            <select
              id={`${fieldId}-zodiac`}
              value={settings.zodiacType}
              onChange={(e) => {
                const newZodiacType = e.target.value as ZodiacSystem;
                setSettings({
                  ...settings,
                  zodiacType: newZodiacType,
                  ayanamsa:
                    newZodiacType === "SIDEREAL" ? settings.ayanamsa || "LAHIRI" : undefined,
                });
              }}
              className="w-full rounded-lg border border-gray-300 p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {ZODIAC_SYSTEMS.map((system) => (
                <option key={system} value={system}>
                  {formatEnumLabel(system)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`${fieldId}-house`}
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              House System
            </label>
            <select
              id={`${fieldId}-house`}
              value={settings.houseSystem}
              onChange={(e) =>
                setSettings({ ...settings, houseSystem: e.target.value as HouseSystem })
              }
              className="w-full rounded-lg border border-gray-300 p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {HOUSE_SYSTEMS.map((system) => (
                <option key={system} value={system}>
                  {formatEnumLabel(system)}
                </option>
              ))}
            </select>
          </div>

          {settings.zodiacType === "SIDEREAL" && (
            <div className="sm:col-span-2">
              <label
                htmlFor={`${fieldId}-ayanamsa`}
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Ayanamsa
              </label>
              <select
                id={`${fieldId}-ayanamsa`}
                value={settings.ayanamsa || "LAHIRI"}
                onChange={(e) => setSettings({ ...settings, ayanamsa: e.target.value as Ayanamsa })}
                className="w-full rounded-lg border border-gray-300 p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {AYANAMSAS.map((system) => (
                  <option key={system} value={system}>
                    {formatEnumLabel(system)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Aspects & Maximum Orbs (Degrees)
        </h3>
        <div className="space-y-3">
          {(Object.keys(settings.aspectOptions) as (keyof AspectOptions)[]).map((aspectKey) => {
            const aspect = settings.aspectOptions[aspectKey];
            return (
              <div
                key={aspectKey}
                className="flex items-center justify-between gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aspect.show}
                    onChange={() => handleAspectToggle(aspectKey)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium capitalize">{aspectKey.toLowerCase()}</span>
                </label>

                <div className="flex items-center space-x-2">
                  <span className="hidden min-[360px]:inline text-xs text-gray-500">Max Orb:</span>
                  <input
                    type="number"
                    aria-label={`${aspectKey.toLowerCase()} max orb`}
                    min="0"
                    max="15"
                    step="0.5"
                    disabled={!aspect.show}
                    value={aspect.minOrb}
                    onChange={(e) => handleOrbChange(aspectKey, parseFloat(e.target.value) || 0)}
                    className="w-16 rounded-md border border-gray-300 px-1 py-2 text-center text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-gray-100"
                  />
                  <span className="text-xs text-gray-500">°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Objects & Asteroids
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-100">
            <input
              type="checkbox"
              checked={settings.objectOptions.showChiron}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  objectOptions: { ...settings.objectOptions, showChiron: e.target.checked },
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Chiron</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-100">
            <input
              type="checkbox"
              checked={settings.objectOptions.showLilith}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  objectOptions: { ...settings.objectOptions, showLilith: e.target.checked },
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Black Moon Lilith</span>
          </label>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Wheel Display Options
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-100">
            <input
              type="checkbox"
              checked={settings.displayOptions.tickMarks}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  displayOptions: { ...settings.displayOptions, tickMarks: e.target.checked },
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Degree Ticks</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-100">
            <input
              type="checkbox"
              checked={settings.displayOptions.angleLabels}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  displayOptions: { ...settings.displayOptions, angleLabels: e.target.checked },
                })
              }
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">Show Angle Labels (ASC/MC)</span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer disabled:opacity-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Chart Settings"}
        </button>
      </div>
    </form>
  );
};

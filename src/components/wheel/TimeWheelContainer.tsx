import { useEffect, useState } from "react";
import { type SingleChart, useCharts } from "../../contexts/ChartContext";
import { ZodiacWheel } from "./ZodiacWheel";
import {
  ZodiacWheelSettings,
  type ZodiacWheelOptions,
} from "./ZodiacWheelSettings";
import { useAuth } from "../../contexts/AuthContext";

export const TimeWheelContainer = ({ }: {}) => {
  const [chart, setChart] = useState<SingleChart | undefined>();
  const { getCurrentChart } = useCharts();
  const { user } = useAuth();
  const [settings, setSettings] = useState<ZodiacWheelOptions>({
    profileId: undefined,
    zodiacSystem: "tropical",
    houseSystem: "placidus",
    ayanamsa: "lahiri",
    aspectOptions: {
      conjunction: { show: true, minOrb: 6 },
      opposition: { show: true, minOrb: 6 },
      square: { show: true, minOrb: 6 },
      trine: { show: true, minOrb: 6 },
      sextile: { show: true, minOrb: 6 },
    },
    objectOptions: {
      showChiron: true,
      lilith: "true",
    },
    displayOptions: {
      angleLabels: true,
      tickMarks: true,
    },
  });

  const fetchChart = async () => {
    const now = new Date();
    const localISODate =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");
    const data = await getCurrentChart({
      location: { lon: user!.longitude, lat: user!.latitude },
      time: now.toTimeString().slice(0, 8),
      date: localISODate,
      zodiac_system: settings.zodiacSystem,
      house_system: settings.houseSystem,
      ayanamsa:
        settings.zodiacSystem === "sidereal" ? settings.ayanamsa : undefined,
    });
    setChart(data);
  };

  useEffect(() => {
    fetchChart();

    const intervalId = setInterval(() => {
      fetchChart();
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [settings.zodiacSystem, settings.ayanamsa, settings.houseSystem]);

  return (
    <div className="flex gap-5 items-center">
      <div className="flex-[3] flex-shrink-0 flex justify-center">
        {chart ? (
          <ZodiacWheel chart={chart} options={settings} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading...
          </div>
        )}
      </div>

      <div className="flex-[1] max-h-[600px] overflow-y-auto my-5">
        <ZodiacWheelSettings
          options={settings}
          onChange={({ key, value }) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
          }}
        />
      </div>
    </div>
  );
};

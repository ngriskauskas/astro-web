import { useEffect, useState } from "react";
import { type SingleChart, useCharts } from "../../contexts/ChartContext";
import { ZodiacWheel } from "./ZodiacWheel";
import {
  ZodiacWheelSettings,
  type ZodiacWheelOptions,
} from "./ZodiacWheelSettings";
import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import { unstable_batchedUpdates } from "react-dom";

export const ZodiacWheelContainer = ({
  initialProfileId,
}: {
  initialProfileId: number;
}) => {
  const [chart, setChart] = useState<SingleChart | undefined>();
  const { getNatalChart } = useCharts();
  const { profiles } = useBirthProfiles();
  const [settings, setSettings] = useState<ZodiacWheelOptions>({
    profileId: initialProfileId,
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
  });

  const fetchChart = async () => {
    const data = await getNatalChart({
      birth_profile_id: settings.profileId,
      zodiac_system: settings.zodiacSystem,
      house_system: settings.houseSystem,
      ayanamsa:
        settings.zodiacSystem === "sidereal" ? settings.ayanamsa : undefined,
    });
    setChart(data);
  };

  useEffect(() => {
    fetchChart();
  }, [
    settings.profileId,
    settings.zodiacSystem,
    settings.ayanamsa,
    settings.houseSystem,
  ]);

  return (
    <div className="flex gap-5 items-center">
      <div className="flex-[3] flex-shrink-0 flex justify-center">
        {chart ? (
          <ZodiacWheel chart={chart} options={settings} aspectMinOrb={6} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading...
          </div>
        )}
      </div>

      <div className="flex-[1] max-h-[600px] overflow-y-auto my-5">
        <ZodiacWheelSettings
          options={settings}
          profiles={profiles}
          onChange={({ key, value }) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
          }}
        />
      </div>
    </div>
  );
};

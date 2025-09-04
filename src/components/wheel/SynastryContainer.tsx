import { useEffect, useState } from "react";
import { useCharts, type MultiChart } from "../../contexts/ChartContext";
import {
  ZodiacWheelSettings,
  type ZodiacWheelOptions,
} from "./ZodiacWheelSettings";
import { type BirthProfile } from "../../contexts/BirthProfilesContext";
import { MultiZodiacWheel } from "./MultiZodiacWheel";

export const SynastryContainer = ({
  initialProfileId,
  profiles,
}: {
  initialProfileId: number;
  profiles: BirthProfile[];
}) => {
  const [chart, setChart] = useState<MultiChart | undefined>();
  const { getSynastryChart } = useCharts();
  const [settings, setSettings] = useState<ZodiacWheelOptions>({
    profileId: initialProfileId,
    otherProfileId: profiles[0].id,
    zodiacSystem: "tropical",
    houseSystem: "placidus",
    ayanamsa: "lahiri",
    aspectOptions: {
      conjunction: { show: true, minOrb: 3 },
      opposition: { show: true, minOrb: 3 },
      square: { show: true, minOrb: 3 },
      trine: { show: true, minOrb: 3 },
      sextile: { show: true, minOrb: 3 },
    },
    objectOptions: {
      showChiron: true,
      lilith: "true",
    },
    displayOptions: {
      angleLabels: false,
      tickMarks: true,
    },
  });

  const fetchChart = async () => {
    const data = await getSynastryChart({
      main_birth_profile_id: settings.profileId!,
      other_birth_profile_id: settings.otherProfileId!,
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
    settings.otherProfileId,
    settings.zodiacSystem,
    settings.ayanamsa,
    settings.houseSystem,
  ]);

  return (
    <div className="flex gap-5 items-center">
      <div className="flex-[3] flex-shrink-0 flex justify-center">
        {chart ? (
          <MultiZodiacWheel chart={chart} options={settings} />
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

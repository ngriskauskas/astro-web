import { useEffect, useState } from "react";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";
import { type SingleChart, useCharts } from "../contexts/ChartContext";
import { ZodiacWheel } from "../components/wheel/ZodiacWheel";

export const Home = () => {
  const { getNatalChart } = useCharts();
  const { mainProfile } = useBirthProfiles();
  const [chart, setChart] = useState<SingleChart | undefined>();

  const fetchNatal = async () => {
    const data = await getNatalChart({
      birth_profile_id: mainProfile!.id,
      zodiac_system: "tropical",
      house_system: "placidus",
    });
    console.log(data);
    setChart(data);
  };

  useEffect(() => {
    if (!mainProfile) return;
    fetchNatal();
  }, [mainProfile]);

  return (
    <div className="flex items-center justify-center mt-10 bg-gray-100">
      {chart && <ZodiacWheel showAspects={true} chart={chart} />}
    </div>
  );
};

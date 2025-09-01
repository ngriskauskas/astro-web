import { useBirthProfiles } from "../contexts/BirthProfilesContext";
import { ZodiacWheelContainer } from "../components/wheel/ZodiacWheelContainer";

export const Home = () => {
  const { mainProfile } = useBirthProfiles();

  return (
    <div className="flex items-center justify-center mt-10 bg-gray-100">
      <div className="w-11/12 h-1/2">
        {mainProfile && (
          <ZodiacWheelContainer initialProfileId={mainProfile.id} />
        )}
      </div>
    </div>
  );
};

import { ZodiacWheelContainer } from "../components/wheel/ZodiacWheelContainer";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";

export const Charts = () => {
  const { mainProfile, profiles } = useBirthProfiles();

  return (
    <div className="flex items-center justify-center mt-10 bg-gray-100">
      <div className="w-11/12">
        {mainProfile && (
          <ZodiacWheelContainer
            profiles={profiles}
            initialProfileId={mainProfile.id}
          />
        )}
      </div>
    </div>
  );
};

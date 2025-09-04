import { TransitContainer } from "../components/wheel/TransitContainer";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";

export const Transits = () => {
  const { mainProfile, profiles } = useBirthProfiles();

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="w-[90%] max-w-5xl">
        {mainProfile && (
          <TransitContainer
            profiles={profiles}
            initialProfileId={mainProfile.id}
          />
        )}
      </div>
    </div>
  );
};

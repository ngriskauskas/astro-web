import { SynastryContainer } from "../components/wheel/SynastryContainer";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";

export const Synastry = () => {
  const { mainProfile, profiles } = useBirthProfiles();

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="w-[90%] max-w-5xl">
        {mainProfile && (
          <SynastryContainer
            profiles={profiles}
            initialProfileId={mainProfile.id}
          />
        )}
      </div>
    </div>
  );
};

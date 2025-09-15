import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import { useWheel } from "../useWheel";

export const useProfileNames = () => {
  const {
    settings: { otherProfileId, profileId },
    type,
  } = useWheel();
  const { profiles } = useBirthProfiles();

  const otherProfileName =
    otherProfileId && profiles
      ? profiles.find((x) => x.id === otherProfileId)?.name
      : type === "transit"
        ? "Transit"
        : "Other";

  const mainProfileName =
    profileId && profiles
      ? profiles.find((x) => x.id === profileId)?.name
      : "Your";

  return { mainProfileName, otherProfileName };
};

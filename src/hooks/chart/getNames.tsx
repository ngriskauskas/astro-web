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

// The name to show for one of the two charts on a two-chart page; nothing on a
// one-chart page, where there is no owner to tell apart.
export const useOwnerName = (owner?: "main" | "other") => {
  const { mainProfileName, otherProfileName } = useProfileNames();
  if (!owner) return undefined;
  return owner === "main" ? mainProfileName : otherProfileName;
};

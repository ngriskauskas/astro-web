import { AccountInfoForm } from "../components/profile/AccountInfoForm";
import { AstrologySettingsForm } from "../components/profile/AstrologySettingsForm";
import { BirthInfoForm } from "../components/profile/BirthInfoForm";
import { CustomProfileList } from "../components/profile/CustomProfileList";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";

export const Profile = () => {
  const { mainProfile } = useBirthProfiles();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">Account Info</h2>
        <AccountInfoForm />
      </div>

      <div className="bg-white shadow rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">My Birth Info</h2>
        <BirthInfoForm profileId={mainProfile?.id} isMainProfile={true} />
      </div>

      <div className="bg-white shadow rounded-xl p-6 space-y-6">
        <CustomProfileList />
      </div>

      <div className="bg-white shadow rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">Chart Default Settings</h2>
        <AstrologySettingsForm />
      </div>
    </div>
  );
};

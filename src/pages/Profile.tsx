import { AccountInfoForm } from "../components/profile/AccountInfoForm";
import { AstrologySettingsForm } from "../components/profile/AstrologySettingsForm";
import { BirthInfoForm } from "../components/profile/BirthInfoForm";
import { CustomProfileList } from "../components/profile/CustomProfileList";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";

export const Profile = () => {
  const { mainProfile } = useBirthProfiles();

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-6 space-y-6">
      <section
        aria-label="Account Info"
        className="bg-white shadow rounded-xl p-4 sm:p-6 space-y-6"
      >
        <h2 className="text-xl font-semibold">Account Info</h2>
        <AccountInfoForm />
      </section>

      <section
        aria-label="My Birth Info"
        className="bg-white shadow rounded-xl p-4 sm:p-6 space-y-6"
      >
        <h2 className="text-xl font-semibold">My Birth Info</h2>
        <BirthInfoForm profileId={mainProfile?.id} isMainProfile={true} />
      </section>

      <section
        aria-label="Custom Profiles"
        className="bg-white shadow rounded-xl p-4 sm:p-6 space-y-6"
      >
        <CustomProfileList />
      </section>

      <section
        aria-label="Chart Default Settings"
        className="bg-white shadow rounded-xl p-4 sm:p-6 space-y-6"
      >
        <h2 className="text-xl font-semibold">Chart Default Settings</h2>
        <AstrologySettingsForm />
      </section>
    </div>
  );
};

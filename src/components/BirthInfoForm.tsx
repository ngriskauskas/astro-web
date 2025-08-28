import { useEffect, useState, type FormEvent } from "react";
import { BirthPlacePicker } from "./BirthPlacePicker";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";
import toast from "react-hot-toast";

export const BirthInfoForm = ({ profileId }: { profileId?: number }) => {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  const [birthPlace, setBirthPlace] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [isMain, setIsMain] = useState(false);
  const { createProfile, updateProfile, profiles } = useBirthProfiles();

  useEffect(() => {
    if (!profiles || !profileId) return;

    const profile = profiles.find((x) => x.id === profileId);

    setBirthPlace(profile?.birth_place || "");
    setBirthDate(profile?.birth_date || "");
    setBirthTime(profile?.birth_time || "");
    setUnknownTime(profile?.birth_time_unknown || false);
    setLongitude(profile?.longitude || 0);
    setLatitude(profile?.latitude || 0);
    setIsMain(profile?.main || false);
  }, [profiles, profileId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const updatedProfile = {
      latitude,
      longitude: longitude,
      birth_time_unknown: unknownTime,
      birth_time: birthTime,
      birth_date: birthDate,
      birth_place: birthPlace,
      main: isMain,
    };
    try {
      if (profileId) await updateProfile(profileId, updatedProfile);
      else await createProfile(updatedProfile);
      toast.success("Profile updated");
    } catch (error: any) {
      console.log(error);
      toast.error(`Failed to update Profile ${error.message}`, {
        duration: 3000,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Birth Date
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Birth Time
        </label>
        <div className="flex items-center gap-4">
          <input
            type="time"
            value={birthTime.slice(0,5)}
            onChange={(e) => setBirthTime(e.target.value)}
            className="w-auto rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={unknownTime}
          />
          <label className="ml-auto text-sm text-gray-600 flex items-center gap-1">
            <input
              type="checkbox"
              checked={unknownTime}
              onChange={(e) => {
                const checked = e.target.checked;
                setUnknownTime(checked);
                if (checked) setBirthTime("");
              }}
            />
            Unknown time?
          </label>
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Birth Place
        </label>
        <BirthPlacePicker
          initialAddress={birthPlace}
          onSelect={({ address, latitude, longitude }) => {
            setBirthPlace(address);
            setLatitude(latitude);
            setLongitude(longitude);
          }}
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

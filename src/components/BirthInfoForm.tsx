import { useEffect, useState, type FormEvent } from "react";
import { BirthPlacePicker } from "./BirthPlacePicker";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";
import toast from "react-hot-toast";

export const BirthInfoForm = ({
  profileId,
  isNew = false,
  onCancel,
  onSubmit,
}: {
  profileId?: number;
  isNew?: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
}) => {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  const [birthPlace, setBirthPlace] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [isMain, setIsMain] = useState(false);
  const [name, setName] = useState("");
  const { createProfile, updateProfile, deleteProfile, profiles } =
    useBirthProfiles();

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
    setName(profile?.name || "");
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
      name: name,
    };
    try {
      if (profileId) await updateProfile(profileId, updatedProfile);
      else await createProfile(updatedProfile);
      if(onSubmit) onSubmit();
      toast.success("Profile updated");
    } catch (error: any) {
      console.log(error);
      toast.error(`Failed to update Profile ${error.message}`, {
        duration: 3000,
      });
    }
  };

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    try {
      await deleteProfile(profileId);
      toast.success("Profile deleted");
    } catch (error: any) {
      console.log(error);
      toast.error("Error deleting Profile");
    }
  };

  const handleCancel = async (e: FormEvent) => {
    e.preventDefault();
    onCancel!();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
      {!isMain && (
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
      )}

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
            value={birthTime.slice(0, 5)}
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
      {isMain ? (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      ) : (
        <div className="flex justify-between">
          {isNew ? (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {isNew ? "Submit" : "Save Changes"}
          </button>
        </div>
      )}
    </form>
  );
};

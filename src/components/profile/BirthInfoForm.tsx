import { useEffect, useId, useState, type FormEvent } from "react";
import { BirthPlacePicker, PLACE_NOT_PICKED_MESSAGE } from "./BirthPlacePicker";
import { useBirthProfiles } from "../../contexts/BirthProfilesContext";
import toast from "react-hot-toast";

export const BirthInfoForm = ({
  profileId,
  isNew = false,
  isMainProfile = false,
  onCancel,
  onSubmit,
}: {
  profileId?: number;
  isNew?: boolean;
  isMainProfile?: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
}) => {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [isMain, setIsMain] = useState(isMainProfile);
  const [name, setName] = useState("");
  const [placePending, setPlacePending] = useState(false);
  const [placeError, setPlaceError] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fieldId = useId();
  const { createProfile, updateProfile, deleteProfile, profiles } = useBirthProfiles();

  useEffect(() => {
    if (!profiles || !profileId) return;

    const profile = profiles.find((x) => x.id === profileId);

    setLocation(profile?.location || "");
    setBirthDate(profile?.birthDate || "");
    setBirthTime(profile?.birthTime || "");
    setUnknownTime(profile?.birthTimeUnknown || false);
    setLongitude(profile?.longitude || 0);
    setLatitude(profile?.latitude || 0);
    setIsMain(profile?.isMain || false);
    setName(profile?.name || "");
  }, [profiles, profileId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (placePending || !location) {
      setPlaceError(true);
      return;
    }

    const updatedProfile = {
      latitude,
      longitude: longitude,
      birthTimeUnknown: unknownTime,
      birthTime: birthTime,
      birthDate: birthDate,
      location: location,
      isMain: isMain,
      name: isMain ? "My Profile" : name,
    };
    try {
      if (profileId) await updateProfile(profileId, updatedProfile);
      else await createProfile(updatedProfile);
      if (onSubmit) onSubmit();
      toast.success("Profile updated");
    } catch (error) {
      console.log(error);
      const message = error instanceof Error ? error.message : "";
      toast.error(`Failed to update Profile ${message}`, {
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    if (!profileId) return;
    setConfirmingDelete(false);
    try {
      await deleteProfile(profileId);
      toast.success("Profile deleted");
    } catch (error) {
      console.log(error);
      toast.error("Error deleting Profile");
    }
  };

  const saveButton = (
    <button
      type="submit"
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
    >
      {isNew ? "Submit" : "Save Changes"}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
      {!isMain && (
        <div>
          <label
            htmlFor={`${fieldId}-name`}
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            id={`${fieldId}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
      )}

      <div>
        <label
          htmlFor={`${fieldId}-date`}
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          Birth Date
        </label>
        <input
          id={`${fieldId}-date`}
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor={`${fieldId}-time`}
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          Birth Time
        </label>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <input
            id={`${fieldId}-time`}
            type="time"
            value={birthTime.slice(0, 5)}
            onChange={(e) => setBirthTime(e.target.value)}
            className="w-auto rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={unknownTime}
            required={!unknownTime}
          />
          <label className="ml-auto py-2 text-sm text-gray-600 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4"
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
        <label
          htmlFor={`${fieldId}-place`}
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          Birth Place
        </label>
        <BirthPlacePicker
          id={`${fieldId}-place`}
          initialAddress={location}
          onPendingChange={setPlacePending}
          onSelect={({ address, latitude, longitude }) => {
            setLocation(address);
            setLatitude(latitude);
            setLongitude(longitude);
            setPlaceError(false);
          }}
        />
        {placeError && (placePending || !location) && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {PLACE_NOT_PICKED_MESSAGE}
          </p>
        )}
      </div>
      {isMain ? (
        <div className="flex justify-end">{saveButton}</div>
      ) : confirmingDelete ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-700">Delete this profile?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between">
          {isNew ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              Delete
            </button>
          )}
          {saveButton}
        </div>
      )}
    </form>
  );
};

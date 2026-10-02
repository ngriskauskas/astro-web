import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";
import { BirthPlacePicker } from "./profile/BirthPlacePicker";

// Blocking post-registration screen: shown until the user has a main birth profile.
export const NewAccountModal = () => {
  const { user, updateUser } = useAuth();
  const { mainProfile, loading, createProfile } = useBirthProfiles();

  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  const [birthPlace, setBirthPlace] = useState({ address: "", latitude: 0, longitude: 0 });
  const [location, setLocation] = useState({ address: "", latitude: 0, longitude: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLocation({
      address: user.location?.address || "",
      latitude: user.location?.latitude ?? 0,
      longitude: user.location?.longitude ?? 0,
    });
  }, [user]);

  if (loading || mainProfile) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!birthPlace.address) {
      toast.error("Please select your birth place");
      return;
    }

    setSubmitting(true);
    try {
      if (location.address !== user?.location?.address) {
        await updateUser({ location: { ...user!.location, ...location } });
      }
      await createProfile({
        name: "My Profile",
        isMain: true,
        birthDate,
        birthTime,
        birthTimeUnknown: unknownTime,
        location: birthPlace.address,
        latitude: birthPlace.latitude,
        longitude: birthPlace.longitude,
      });
      toast.success("Welcome! Your profile is set up");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(`Failed to save profile ${message}`, { duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-account-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-full overflow-y-auto p-6 flex flex-col space-y-6"
      >
        <div>
          <h2 id="new-account-title" className="text-xl font-semibold">
            Welcome! Let's set up your profile
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Enter your birth info to start using your charts and timings.
          </p>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Birth Date</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Birth Time</label>
          <div className="flex items-center gap-4">
            <input
              type="time"
              value={birthTime.slice(0, 5)}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-auto rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={unknownTime}
              required={!unknownTime}
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
          <label className="block mb-1 text-sm font-medium text-gray-700">Birth Place</label>
          <BirthPlacePicker initialAddress={birthPlace.address} onSelect={setBirthPlace} />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Current Location</label>
          <BirthPlacePicker initialAddress={location.address} onSelect={setLocation} />
          <p className="mt-1 text-xs text-gray-500">
            Used for accurate daily data. Defaults to New York City.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Get Started"}
          </button>
        </div>
      </form>
    </div>
  );
};

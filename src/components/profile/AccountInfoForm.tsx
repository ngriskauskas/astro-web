import { useEffect, useId, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { BirthPlacePicker, PLACE_NOT_PICKED_MESSAGE } from "./BirthPlacePicker";

export const AccountInfoForm = () => {
  const { user, updateUser } = useAuth();
  const [userInfo, setUserInfo] = useState({
    username: "",
    location: {
      address: "",
      latitude: 0,
      longitude: 0,
      timezone: "",
    },
  });

  const [placePending, setPlacePending] = useState(false);
  const [placeError, setPlaceError] = useState(false);
  const fieldId = useId();

  useEffect(() => {
    if (user) {
      setUserInfo({
        username: user.username || "",
        location: {
          address: user.location?.address || "",
          latitude: user.location?.latitude ?? 0,
          longitude: user.location?.longitude ?? 0,
          timezone: user.location?.timezone || "",
        },
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (placePending) {
      setPlaceError(true);
      return;
    }
    try {
      await updateUser(userInfo);
      toast.success("Profile Updated");
    } catch (err) {
      if (err instanceof Error && err.message) toast.error(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor={`${fieldId}-username`}
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            id={`${fieldId}-username`}
            type="text"
            name="username"
            value={userInfo.username}
            onChange={handleChange}
            placeholder="Enter username"
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor={`${fieldId}-email`}
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id={`${fieldId}-email`}
            type="email"
            name="email"
            value={user?.email || ""}
            disabled
            className="w-full rounded-lg border border-gray-300 p-2 bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor={`${fieldId}-location`}
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <BirthPlacePicker
            id={`${fieldId}-location`}
            initialAddress={userInfo.location.address}
            onPendingChange={setPlacePending}
            onSelect={({ address, latitude, longitude }) => {
              setPlaceError(false);
              setUserInfo((prev) => ({
                ...prev,
                location: {
                  ...prev.location,
                  address,
                  latitude,
                  longitude,
                },
              }));
            }}
          />
          {placeError && placePending && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {PLACE_NOT_PICKED_MESSAGE}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

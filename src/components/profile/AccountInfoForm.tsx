import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { BirthPlacePicker } from "./BirthPlacePicker";

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
    try {
      await updateUser(userInfo);
      toast.success("Profile Updated");
    } catch (err: any) {
      if (err.message) toast.error(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            value={userInfo.username}
            onChange={handleChange}
            placeholder="Enter username"
            className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={user?.email || ""}
            disabled
            className="w-full rounded-lg border border-gray-300 p-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
          <BirthPlacePicker
            initialAddress={userInfo.location.address}
            onSelect={({ address, latitude, longitude }) => {
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

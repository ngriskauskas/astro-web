import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { BirthInfoForm } from "../components/BirthInfoForm";
import {
  useBirthProfiles,
  type BirthProfileInput,
} from "../contexts/BirthProfilesContext";

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const { mainProfile, updateProfile, createProfile } = useBirthProfiles();
  const [userInfo, setUserInfo] = useState({
    username: "",
  });
  const [birthInfoState, setBirthInfoState] = useState<BirthProfileInput>();

  useEffect(() => {
    setUserInfo({ username: user!.username });
  }, []);

  useEffect(() => {
    if (!mainProfile) return;

    setBirthInfoState({
      birth_time: mainProfile.birth_time,
      birth_place: mainProfile.birth_place,
      birth_date: mainProfile.birth_date,
      longitude: mainProfile.longitude,
      latitude: mainProfile.latitude,
      main: true,
    });
  }, [mainProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateUser(userInfo);
      if (!mainProfile) {
        await createProfile(birthInfoState!);
      } else {
        await updateProfile(mainProfile!.id, birthInfoState!);
      }
      toast.success("Profile Updated");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">Account Info</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Username
            </label>
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
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={user!.email}
              disabled
              className="w-full rounded-lg border border-gray-300 p-2 bg-gray-100"
            />
          </div>
        </div>
      </div>
      <div className="bg-white shadow rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">My Birth Info</h2>
        <BirthInfoForm
          onChange={(state) => setBirthInfoState(state)}
          initialProfile={mainProfile}
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
    </div>
  );
};

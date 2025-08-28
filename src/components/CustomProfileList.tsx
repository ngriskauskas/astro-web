import { useEffect, useState } from "react";
import {
  useBirthProfiles,
  type BirthProfile,
} from "../contexts/BirthProfilesContext";
import { BirthInfoForm } from "./BirthInfoForm";

export const CustomProfileList = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  const { profiles } = useBirthProfiles();
  const [customProfiles, setCustomProfiles] = useState<BirthProfile[]>([]);
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    setCustomProfiles(profiles.filter((x) => !x.main));
  }, [profiles]);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleAddNew = () => {
    setNewOpen(true);
    setOpenId(null);
  };

  return (
    <div className="">
      <div className="flex justify-between items-center py-2">
        <h2 className="text-xl font-semibold">Custom Profiles</h2>
        <button
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          onClick={handleAddNew}
        >
          Add New
        </button>
      </div>
      <div className="space-y-2">
        {newOpen && (
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50">
              <BirthInfoForm
                isNew={true}
                onCancel={() => setNewOpen(false)}
                onSubmit={() => setNewOpen(false)}
              />
            </div>
          </div>
        )}
        {customProfiles.map((profile) => (
          <div key={profile.id} className="border rounded-lg overflow-hidden">
            <button
              className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 flex justify-between items-center cursor-pointer"
              onClick={() => toggle(profile.id)}
            >
              <span>{profile.name}</span>
              <span>{openId === profile.id ? "−" : "+"}</span>
            </button>

            {openId === profile.id && (
              <div className="p-4">
                <BirthInfoForm profileId={profile.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

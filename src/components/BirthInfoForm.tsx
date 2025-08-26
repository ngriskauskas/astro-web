import { useEffect, useState } from "react";
import { BirthPlacePicker } from "./BirthPlacePicker";
import type {
  BirthProfile,
  BirthProfileInput,
} from "../contexts/BirthProfilesContext";

export const BirthInfoForm = ({
  initialProfile,
  onChange,
  isMainProfile,
}: {
  initialProfile?: BirthProfile;
  onChange: (profile: BirthProfileInput) => void;
  isMainProfile: boolean;
}) => {
  const [birthDate, setBirthDate] = useState(initialProfile?.birth_date || "");
  const [birthTime, setBirthTime] = useState(initialProfile?.birth_time || "");
  const [unknownTime, setUnknownTime] = useState(
    initialProfile && initialProfile.birth_time === null,
  );
  const [birthPlace, setBirthPlace] = useState(
    initialProfile?.birth_place || "",
  );
  const [latitude, setLatitude] = useState(initialProfile?.latitude || 0);
  const [longitude, setLongitude] = useState(initialProfile?.longitude || 0);

  useEffect(() => {
    onChange({
      birth_date: birthDate,
      birth_time: unknownTime ? null : birthTime,
      birth_place: birthPlace,
      latitude: latitude,
      longitude: longitude,
      main: isMainProfile,
    });
  }, [birthDate, birthPlace, birthTime, unknownTime]);

  return (
    <>
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
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="w-auto rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={unknownTime}
          />
          <label className="ml-auto text-sm text-gray-600 flex items-center gap-1">
            <input
              type="checkbox"
              checked={unknownTime}
              onChange={(e) => setUnknownTime(e.target.checked)}
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
          onSelect={({ address, latitude, longitude }) => {
            setBirthPlace(address);
            setLatitude(latitude);
            setLongitude(longitude);
          }}
        />
      </div>
    </>
  );
};

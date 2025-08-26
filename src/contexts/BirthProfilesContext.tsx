import {
  createContext,
  useEffect,
  useState,
  useContext,
  type ReactNode,
} from "react";
import { apiFetch } from "../utils/api";

export interface BirthProfile {
  id: number;
  birth_date: string;
  birth_time: string | null;
  birth_place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  main: boolean;
}

export interface BirthProfileInput {
  birth_date: string;
  birth_time: string | null;
  birth_place: string;
  latitude: number;
  longitude: number;
  main: boolean;
}
//TODO I NEED UNKOWN TIME FIELD
interface BirthProfileContextType {
  profiles: BirthProfile[];
  mainProfile: BirthProfile | undefined;
  updateProfile: (id: number, profile: BirthProfileInput) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
  createProfile: (profile: BirthProfileInput) => Promise<void>;
}

const BirthProfilesContext = createContext<BirthProfileContextType | undefined>(
  undefined,
);

export const BirthProfilesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [mainProfile, setMainProfile] = useState<BirthProfile>();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const data = await apiFetch("/me/birth_profiles", {
        method: "GET",
      });
      const birth_profiles = data.birth_profiles as BirthProfile[];
      setProfiles(birth_profiles);
      setMainProfile(birth_profiles.find((x) => x.main));
    } catch (err) {
      console.log(err);
    }
  };

  const updateProfile = async (id: number, profile: BirthProfileInput) => {
    try {
      const data = await apiFetch(`/birth_profiles/${id}`, {
        method: "PUT",
        body: JSON.stringify(profile),
      });

      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const createProfile = async (profile: BirthProfileInput) => {
    const data = await apiFetch("/me/birth_profiles", {
      method: "POST",
      body: JSON.stringify({ birth_profile: profile }),
    });
  };

  const deleteProfile = async (id: number) => {
    const data = await apiFetch(`/birth_profiles/${id}`, {
      method: "DELETE",
    });
  };

  return (
    <BirthProfilesContext.Provider
      value={{
        profiles,
        mainProfile,
        updateProfile,
        createProfile,
        deleteProfile,
      }}
    >
      {children}
    </BirthProfilesContext.Provider>
  );
};

export const useBirthProfiles = () => {
  const context = useContext(BirthProfilesContext);
  if (!context) {
    throw new Error(
      "useBirthProfiles must be used inside BirthProfilesProvider,",
    );
  }
  return context;
};

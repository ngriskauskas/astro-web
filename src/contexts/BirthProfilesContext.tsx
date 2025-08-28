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
  main: boolean;
  birth_time_unknown: boolean;
  name: string;
}

export interface BirthProfileInput {
  birth_date: string;
  birth_time: string | null;
  birth_place: string;
  latitude: number;
  longitude: number;
  main: boolean;
  birth_time_unknown: boolean;
  name: string;
}

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

  useEffect(() => {
    setMainProfile(profiles.find((x) => x.main));
  }, [profiles]);

  const fetchProfiles = async () => {
    try {
      const data = await apiFetch("/me/birth_profiles", {
        method: "GET",
      });
      const birth_profiles = data.birth_profiles as BirthProfile[];
      setProfiles(birth_profiles);
    } catch (err) {
      console.log(err);
    }
  };

  const updateProfile = async (id: number, profile: BirthProfileInput) => {
    const data = await apiFetch(`/birth_profiles/${id}`, {
      method: "PUT",
      body: JSON.stringify({ birth_profile: profile }),
    });
    setProfiles((x) =>
      x.map((profile) =>
        profile.id === data.birth_profile.id ? data.birth_profile : profile,
      ),
    );
  };

  const createProfile = async (profile: BirthProfileInput) => {
    const data = await apiFetch("/me/birth_profiles", {
      method: "POST",
      body: JSON.stringify({ birth_profile: profile }),
    });
    setProfiles((x) => [...x, data.birth_profile]);
  };

  const deleteProfile = async (id: number) => {
    await apiFetch(`/birth_profiles/${id}`, {
      method: "DELETE",
    });
    setProfiles((x) => x.filter((profile) => profile.id !== id));
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

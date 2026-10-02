import { createContext, useEffect, useState, useContext, type ReactNode } from "react";
import { apiFetch } from "../utils/api";

export interface BirthProfile {
  id: number;
  birthDate: string;
  birthTime: string | null;
  location: string;
  latitude: number;
  longitude: number;
  isMain: boolean;
  birthTimeUnknown: boolean;
  name: string;
}

export interface BirthProfileInput {
  birthDate: string;
  birthTime: string | null;
  location: string;
  latitude: number;
  longitude: number;
  isMain: boolean;
  birthTimeUnknown: boolean;
  name: string;
}

interface BirthProfileContextType {
  profiles: BirthProfile[];
  mainProfile: BirthProfile | undefined;
  loading: boolean;
  updateProfile: (id: number, profile: BirthProfileInput) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
  createProfile: (profile: BirthProfileInput) => Promise<void>;
}

const BirthProfilesContext = createContext<BirthProfileContextType | undefined>(undefined);

export const BirthProfilesProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const mainProfile = profiles.find((x) => x.isMain);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/birth-profiles", {
        method: "GET",
      });
      const birth_profiles = data as BirthProfile[];
      setProfiles(birth_profiles);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (id: number, profile: BirthProfileInput) => {
    const data = await apiFetch(`/birth-profiles/${id}`, {
      method: "PUT",
      body: JSON.stringify(profile),
    });
    setProfiles((x) => x.map((profile) => (profile.id === data.id ? data : profile)));
  };

  const createProfile = async (profile: BirthProfileInput) => {
    const data = await apiFetch("/birth-profiles", {
      method: "POST",
      body: JSON.stringify(profile),
    });
    setProfiles((x) => [...x, data]);
  };

  const deleteProfile = async (id: number) => {
    await apiFetch(`/birth-profiles/${id}`, {
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
        loading,
      }}
    >
      {children}
    </BirthProfilesContext.Provider>
  );
};

export const useBirthProfiles = () => {
  const context = useContext(BirthProfilesContext);
  if (!context) {
    throw new Error("useBirthProfiles must be used inside BirthProfilesProvider,");
  }
  return context;
};

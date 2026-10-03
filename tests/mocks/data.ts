import type { User } from "../../src/contexts/AuthContext";
import type { BirthProfile } from "../../src/contexts/BirthProfilesContext";

// Fixtures are fixed literals: nothing is derived from the current time or generated at
// random. Tests that need a variation spread a fixture and override fields.

export interface Place {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const user: User = {
  id: "user-1",
  email: "test.user@example.com",
  username: "testuser",
  location: {
    timezone: "America/New_York",
    address: "New York, United States",
    latitude: 40.7128,
    longitude: -74.006,
  },
  timezone: "America/New_York",
};

export const mainBirthProfile: BirthProfile = {
  id: 1,
  name: "My Profile",
  isMain: true,
  birthDate: "1990-05-15",
  birthTime: "08:30",
  birthTimeUnknown: false,
  location: "London, Greater London, England, United Kingdom",
  latitude: 51.5074,
  longitude: -0.1278,
};

export const places: Place[] = [
  {
    place_id: 101,
    display_name: "London, Greater London, England, United Kingdom",
    lat: "51.5074",
    lon: "-0.1278",
  },
  {
    place_id: 102,
    display_name: "London, Ontario, Canada",
    lat: "42.9849",
    lon: "-81.2453",
  },
];

// The app merges this over its own defaults, so an empty object is a valid response.
export const settings = {};

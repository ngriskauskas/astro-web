import type { User } from "../../src/contexts/AuthContext";
import type { BirthProfile } from "../../src/contexts/BirthProfilesContext";
import type { AstrologySettings } from "../../src/types/astrologySettings";

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

// A user who has not entered a location yet: Moment, Daily and Transits send them to Profile.
export const userWithoutLocation: User = {
  ...user,
  location: { ...user.location, address: "" },
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

// Profiles for other people. The last one has a long name and place, for layout.
export const customBirthProfiles: BirthProfile[] = [
  {
    id: 2,
    name: "Mum",
    isMain: false,
    birthDate: "1962-11-03",
    birthTime: "14:45",
    birthTimeUnknown: false,
    location: "London, Ontario, Canada",
    latitude: 42.9849,
    longitude: -81.2453,
  },
  {
    id: 3,
    name: "Sam",
    isMain: false,
    birthDate: "1988-02-29",
    birthTime: "",
    birthTimeUnknown: true,
    location: "London, Greater London, England, United Kingdom",
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    id: 4,
    name: "Great-grandmother Wilhelmina Bartholomew-Featherstonehaugh",
    isMain: false,
    birthDate: "1901-07-21",
    birthTime: "23:05",
    birthTimeUnknown: false,
    location:
      "Llanfairpwllgwyngyll, Isle of Anglesey, Wales, LL61 5UJ, United Kingdom of Great Britain and Northern Ireland",
    latitude: 53.2213,
    longitude: -4.2099,
  },
];

// The app merges this over its own defaults, so an empty object is a valid response.
export const settings: Partial<AstrologySettings> = {};

// Mirrors DEFAULT_SETTINGS in src/contexts/ChartSettingsContext.tsx.
export const defaultSettings: AstrologySettings = {
  zodiacType: "TROPICAL",
  houseSystem: "PLACIDUS",
  ayanamsa: "LAHIRI",
  aspectOptions: {
    CONJUNCTION: { show: true, minOrb: 8 },
    OPPOSITION: { show: true, minOrb: 8 },
    TRINE: { show: true, minOrb: 8 },
    SQUARE: { show: true, minOrb: 8 },
    SEXTILE: { show: true, minOrb: 6 },
  },
  objectOptions: { showChiron: true, showLilith: false },
  displayOptions: { tickMarks: true, angleLabels: true },
};

// Differs from the defaults in every group.
export const savedSettings: AstrologySettings = {
  zodiacType: "SIDEREAL",
  houseSystem: "WHOLE_SIGN",
  ayanamsa: "RAMAN",
  aspectOptions: {
    CONJUNCTION: { show: true, minOrb: 8 },
    OPPOSITION: { show: true, minOrb: 5.5 },
    TRINE: { show: true, minOrb: 8 },
    SQUARE: { show: true, minOrb: 8 },
    SEXTILE: { show: false, minOrb: 6 },
  },
  objectOptions: { showChiron: true, showLilith: true },
  displayOptions: { tickMarks: false, angleLabels: true },
};

const LONG_NAMES: Record<number, string> = {
  3: "Great-aunt Philippa Montgomery-Cholmondeley of Lower Slaughter",
  9: "Maximilian Alexander Fitzwilliam-Robertson the Younger",
  15: "Dr. Anastasia Konstantinopoulou-Vandersloot (work colleague)",
};

// Twenty profiles for other people, a few with long names, for long selector lists.
export const manyBirthProfiles: BirthProfile[] = Array.from({ length: 20 }, (_, index) => ({
  id: 10 + index,
  name: LONG_NAMES[index] ?? `Friend ${index + 1}`,
  isMain: false,
  birthDate: `19${70 + index}-03-${String(index + 1).padStart(2, "0")}`,
  birthTime: "12:00",
  birthTimeUnknown: false,
  location: "London, Ontario, Canada",
  latitude: 42.9849,
  longitude: -81.2453,
}));

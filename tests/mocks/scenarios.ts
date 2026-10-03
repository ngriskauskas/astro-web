import type { RequestHandler } from "msw";
import { customBirthProfiles, mainBirthProfile, userWithoutLocation } from "./data";
import {
  dailyTimingsFor,
  deleteBirthProfile,
  descriptions,
  genericChart,
  getBirthProfiles,
  getMe,
  getSettings,
  googleSignInScript,
  moonTimingsFor,
  natalChartFor,
  postBirthProfile,
  putBirthProfile,
  putMe,
  putSettings,
  resetSettings,
  searchPlaces,
  synastryChartFor,
  transitChartFor,
  weeklyTimingsFor,
} from "./handlers";

// A scenario is a named situation the backend is in. Both test layers build their
// mocks from these, so a scenario means the same thing in a browser test and an
// integration test.
export type ScenarioName = "newAccount" | "withProfile" | "withCustomProfiles" | "noLocation";

const common = (): RequestHandler[] => [
  getMe(),
  putMe(),
  postBirthProfile(),
  putBirthProfile(),
  deleteBirthProfile(),
  getSettings(),
  putSettings(),
  resetSettings(),
  searchPlaces(),
  googleSignInScript(),
  natalChartFor(),
  genericChart(),
  transitChartFor(),
  synastryChartFor(),
  ...dailyTimingsFor(),
  ...weeklyTimingsFor(),
  moonTimingsFor(),
  descriptions(),
];

const scenarios: Record<ScenarioName, () => RequestHandler[]> = {
  // Signed-in user with no birth info: the new-account modal is shown.
  newAccount: () => [getBirthProfiles([]), ...common()],
  // Signed-in user with a complete main birth profile.
  withProfile: () => [getBirthProfiles([mainBirthProfile]), ...common()],
  // The same user with profiles for other people as well.
  withCustomProfiles: () => [
    getBirthProfiles([mainBirthProfile, ...customBirthProfiles]),
    ...common(),
  ],
  // A complete main birth profile, but no location entered. The first matching handler
  // answers, so this /me goes before the common one.
  noLocation: () => [
    getMe(userWithoutLocation),
    getBirthProfiles([mainBirthProfile]),
    ...common(),
  ],
};

export const scenario = (name: ScenarioName) => scenarios[name]();

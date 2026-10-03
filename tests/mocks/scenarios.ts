import type { RequestHandler } from "msw";
import { customBirthProfiles, mainBirthProfile } from "./data";
import {
  deleteBirthProfile,
  getBirthProfiles,
  getMe,
  getSettings,
  googleSignInScript,
  postBirthProfile,
  putBirthProfile,
  putMe,
  putSettings,
  resetSettings,
  searchPlaces,
} from "./handlers";

// A scenario is a named situation the backend is in. Both test layers build their
// mocks from these, so a scenario means the same thing in a browser test and an
// integration test.
export type ScenarioName = "newAccount" | "withProfile" | "withCustomProfiles";

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
};

export const scenario = (name: ScenarioName) => scenarios[name]();

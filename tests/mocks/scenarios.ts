import type { RequestHandler } from "msw";
import { mainBirthProfile } from "./data";
import {
  getBirthProfiles,
  getMe,
  getSettings,
  googleSignInScript,
  postBirthProfile,
  putMe,
  searchPlaces,
} from "./handlers";

// A scenario is a named situation the backend is in. Both test layers build their
// mocks from these, so a scenario means the same thing in a browser test and an
// integration test.
export type ScenarioName = "newAccount" | "withProfile";

const common = (): RequestHandler[] => [
  getMe(),
  putMe(),
  postBirthProfile(),
  getSettings(),
  searchPlaces(),
  googleSignInScript(),
];

const scenarios: Record<ScenarioName, () => RequestHandler[]> = {
  // Signed-in user with no birth info: the new-account modal is shown.
  newAccount: () => [getBirthProfiles([]), ...common()],
  // Signed-in user with a complete main birth profile.
  withProfile: () => [getBirthProfiles([mainBirthProfile]), ...common()],
};

export const scenario = (name: ScenarioName) => scenarios[name]();

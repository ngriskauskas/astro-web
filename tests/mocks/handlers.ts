import { http, HttpResponse } from "msw";
import type { BirthProfile, BirthProfileInput } from "../../src/contexts/BirthProfilesContext";
import { API_URL } from "./auth";
import { places, settings, user } from "./data";

export const PLACE_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

export const getMe = () => http.get(`${API_URL}/me`, () => HttpResponse.json(user));

export const putMe = () =>
  http.put(`${API_URL}/me`, async ({ request }) =>
    HttpResponse.json({ ...user, ...((await request.json()) as object) }),
  );

export const getBirthProfiles = (profiles: BirthProfile[]) =>
  http.get(`${API_URL}/birth-profiles`, () => HttpResponse.json(profiles));

export const postBirthProfile = () =>
  http.post(`${API_URL}/birth-profiles`, async ({ request }) =>
    HttpResponse.json({ ...((await request.json()) as BirthProfileInput), id: 1 }, { status: 201 }),
  );

export const getSettings = () => http.get(`${API_URL}/settings`, () => HttpResponse.json(settings));

export const searchPlaces = () => http.get(PLACE_SEARCH_URL, () => HttpResponse.json(places));

// GoogleOAuthProvider loads Google's sign-in script on every page. An empty script
// keeps the sign-in provider from being contacted; the sign-in button itself is not
// usable in tests.
export const googleSignInScript = () =>
  http.get(
    "https://accounts.google.com/gsi/client",
    () => new HttpResponse("", { headers: { "Content-Type": "text/javascript" } }),
  );

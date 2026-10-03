import { http, HttpResponse } from "msw";
import type { BirthProfile, BirthProfileInput } from "../../src/contexts/BirthProfilesContext";
import { API_URL } from "./auth";
import type { AstrologySettings } from "../../src/types/astrologySettings";
import type { User } from "../../src/contexts/AuthContext";
import type { MultiChart, SingleChart } from "../../src/types/chart";
import type { MoonTimingsType } from "../../src/types/moon";
import type { CurrentTimingsType, DailyTimingsType } from "../../src/types/timings";
import { momentChart, natalChart, otherNatalChart, synastryChart, transitChart } from "./charts";
import { defaultSettings, places, settings, user } from "./data";
import { dailyTimings, moonTimings, weeklyTimings } from "./timings";

export const PLACE_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

export const getMe = (data: User = user) =>
  http.get(`${API_URL}/me`, () => HttpResponse.json(data));

export const putMe = () =>
  http.put(`${API_URL}/me`, async ({ request }) =>
    HttpResponse.json({ ...user, ...((await request.json()) as object) }),
  );

export const getBirthProfiles = (profiles: BirthProfile[]) =>
  http.get(`${API_URL}/birth-profiles`, () => HttpResponse.json(profiles));

export const postBirthProfile = () =>
  http.post(`${API_URL}/birth-profiles`, async ({ request }) =>
    HttpResponse.json({ ...((await request.json()) as BirthProfileInput), id: 100 }, { status: 201 }),
  );

export const putBirthProfile = () =>
  http.put(`${API_URL}/birth-profiles/:id`, async ({ request, params }) =>
    HttpResponse.json({ ...((await request.json()) as BirthProfileInput), id: Number(params.id) }),
  );

export const deleteBirthProfile = () =>
  http.delete(`${API_URL}/birth-profiles/:id`, () => new HttpResponse(null, { status: 204 }));

export const getSettings = (data: Partial<AstrologySettings> = settings) =>
  http.get(`${API_URL}/settings`, () => HttpResponse.json(data));

export const putSettings = () =>
  http.put(`${API_URL}/settings`, async ({ request }) =>
    HttpResponse.json((await request.json()) as AstrologySettings),
  );

export const resetSettings = () =>
  http.post(`${API_URL}/settings/reset`, () => HttpResponse.json(defaultSettings));

export const searchPlaces = () => http.get(PLACE_SEARCH_URL, () => HttpResponse.json(places));

// GoogleOAuthProvider loads Google's sign-in script on every page. An empty script
// keeps the sign-in provider from being contacted; the sign-in button itself is not
// usable in tests.
export const googleSignInScript = () =>
  http.get(
    "https://accounts.google.com/gsi/client",
    () => new HttpResponse("", { headers: { "Content-Type": "text/javascript" } }),
  );

// Chart and timing handlers take the data to return, so a test can override one response.

// With no data given, profile 1 (the user's own) gets natalChart and any other profile
// gets otherNatalChart, so switching profile visibly changes the chart.
export const natalChartFor = (data?: SingleChart) =>
  http.post(`${API_URL}/charts/natal`, async ({ request }) => {
    const { birthProfileId } = (await request.json()) as { birthProfileId: number };
    return HttpResponse.json(data ?? (birthProfileId === 1 ? natalChart : otherNatalChart));
  });

export const genericChart = (data: SingleChart = momentChart) =>
  http.post(`${API_URL}/charts/generic`, () => HttpResponse.json(data));

export const transitChartFor = (data: MultiChart = transitChart) =>
  http.post(`${API_URL}/charts/transit`, () => HttpResponse.json(data));

export const synastryChartFor = (data: MultiChart = synastryChart) =>
  http.post(`${API_URL}/charts/synastry`, () => HttpResponse.json(data));

export const dailyTimingsFor = (data: DailyTimingsType = dailyTimings) => [
  http.post(`${API_URL}/timing/daily`, () => HttpResponse.json(data)),
  http.post(`${API_URL}/timing/daily-transit`, () => HttpResponse.json(data)),
];

// The transit endpoint returns aspects only.
export const weeklyTimingsFor = (data: CurrentTimingsType = weeklyTimings) => [
  http.post(`${API_URL}/timing/current`, () => HttpResponse.json(data)),
  http.post(`${API_URL}/timing/transit`, () => HttpResponse.json({ aspects: data.aspects })),
];

export const moonTimingsFor = (data: MoonTimingsType = moonTimings) =>
  http.post(`${API_URL}/timing/current-moon`, () => HttpResponse.json(data));

interface PlacementSubject {
  chart: string;
  point: { name: string };
  sign?: string | null;
  house?: number | null;
}

const describePoint = ({ point, sign, house, chart }: PlacementSubject) =>
  [point.name, sign, house ? `house ${house}` : null, chart].filter(Boolean).join(" ");

interface AspectDetails {
  relationship: string;
  aspectType: string;
  first: PlacementSubject;
  second: PlacementSubject;
}

const describeAspect = ({ first, aspectType, second, relationship }: AspectDetails) =>
  `${describePoint(first)} ${aspectType} ${describePoint(second)} ${relationship}`;

// The text the mocked description service returns for a request. It names what was
// asked for, so a test can check both that the right request was made and that its
// answer is shown in the right place.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const describeContext = (context: any): string => {
  if (context.type === "placement") {
    return `Description for placement ${describePoint(context.subject)}`;
  }
  if (context.type === "aspect") return `Description for aspect ${describeAspect(context.details)}`;

  const { event, timeScale } = context;
  const detail =
    event.type === "aspect"
      ? describeAspect(event.details)
      : event.type === "ingress"
        ? `${event.planet} ${event.fromSign} to ${event.toSign}`
        : event.type === "station"
          ? `${event.planet} ${event.retrograde ? "retrograde" : "direct"}`
          : event.type === "moonPhase"
            ? event.phase
            : event.planet;
  return `Description for ${timeScale} ${event.type} ${detail}`;
};

export const descriptions = () =>
  http.post(`${API_URL}/descriptions`, async ({ request }) => {
    const { context } = (await request.json()) as { context: { type: string } };
    return HttpResponse.json({
      description: describeContext(context),
      cached: false,
      contextType: context.type,
    });
  });

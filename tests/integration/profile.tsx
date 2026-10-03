import { act, screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { http, HttpResponse, type RequestHandler } from "msw";
import { useAuth } from "../../src/contexts/AuthContext";
import { useBirthProfiles } from "../../src/contexts/BirthProfilesContext";
import { useChartSettings } from "../../src/contexts/ChartSettingsContext";
import { Profile } from "../../src/pages/Profile";
import { API_URL, defaultSettings, user as userFixture, type Place, type ScenarioName } from "../mocks";
import { renderWithApp } from "./render";
import { server } from "./setup";

export type SectionName =
  | "Account Info"
  | "My Birth Info"
  | "Custom Profiles"
  | "Chart Default Settings";

export const PLACE_NOT_PICKED = "Pick a place from the suggestions";

// The forms fill themselves in once the user, birth profiles and settings have loaded.
const Loaded = () => {
  const loading = [useAuth().loading, useBirthProfiles().loading, useChartSettings().loading];
  return loading.some(Boolean) ? null : <span>page loaded</span>;
};

// Renders the profile page and waits until its data has loaded.
export const renderProfile = async (
  scenario: ScenarioName = "withProfile",
  handlers: RequestHandler[] = [],
) => {
  const result = renderWithApp(
    <>
      <Profile />
      <Loaded />
    </>,
    { scenario, handlers },
  );
  await screen.findByText("page loaded");
  // The forms copy the loaded data into their own state in effects; let those settle.
  await act(async () => {});
  return result;
};

// The page repeats labels and buttons across its cards, so queries go through one card.
export const section = (name: SectionName) => within(screen.getByRole("region", { name }));

export interface Sent {
  body: unknown;
  id?: string;
}

type Method = "put" | "post" | "delete";

// Records what the app sends to one endpoint, answering as the default mocks do.
export const capture = (method: Method, path: string) => {
  const sent: Sent[] = [];
  server.use(
    http[method](`${API_URL}${path}`, async ({ request, params }) => {
      const text = await request.text();
      const body = text ? JSON.parse(text) : null;
      const id = params.id as string | undefined;
      sent.push({ body, id });

      if (method === "delete") return new HttpResponse(null, { status: 204 });
      if (path === "/settings/reset") return HttpResponse.json(defaultSettings);
      if (path === "/me") return HttpResponse.json({ ...userFixture, ...body });
      if (path.startsWith("/birth-profiles")) {
        return HttpResponse.json({ ...body, id: id ? Number(id) : 100 });
      }
      return HttpResponse.json(body);
    }),
  );
  return sent;
};

// Makes one endpoint reject, the way the backend reports a validation failure.
export const reject = (method: Method, path: string, error: string) =>
  server.use(
    http[method](`${API_URL}${path}`, () => HttpResponse.json({ error }, { status: 422 })),
  );

export const typePlace = async (user: UserEvent, field: HTMLElement, text: string) => {
  await user.clear(field);
  await user.type(field, text);
};

export const pickPlace = async (
  user: UserEvent,
  within_: ReturnType<typeof within>,
  field: HTMLElement,
  place: Place,
) => {
  await typePlace(user, field, "Lond");
  await user.click(await within_.findByText(place.display_name));
};

export const setValue = async (user: UserEvent, field: HTMLElement, value: string) => {
  await user.clear(field);
  if (value) await user.type(field, value);
};

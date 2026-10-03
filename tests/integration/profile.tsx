import { act, screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import type { RequestHandler } from "msw";
import { useAuth } from "../../src/contexts/AuthContext";
import { useBirthProfiles } from "../../src/contexts/BirthProfilesContext";
import { useChartSettings } from "../../src/contexts/ChartSettingsContext";
import { Profile } from "../../src/pages/Profile";
import type { Place, ScenarioName } from "../mocks";
import { renderWithApp } from "./render";

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

export { capture, reject, type Sent } from "./requests";

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

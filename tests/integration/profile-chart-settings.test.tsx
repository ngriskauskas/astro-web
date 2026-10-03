import { fireEvent, screen, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { expect, test } from "vitest";
import { Profile } from "../../src/pages/Profile";
import { API_URL, defaultSettings, getSettings, savedSettings } from "../mocks";
import { capture, reject, renderProfile, section } from "./profile";
import { renderWithApp } from "./render";

const NAME = "Chart Default Settings";

test("shows a loading message until the saved settings arrive", async () => {
  renderWithApp(<Profile />, {
    scenario: "withProfile",
    handlers: [
      http.get(`${API_URL}/settings`, async () => {
        await delay(100);
        return HttpResponse.json(savedSettings);
      }),
    ],
  });

  expect(await screen.findByText("Loading settings...")).toBeInTheDocument();
  const zodiac = await section(NAME).findByLabelText("Zodiac System");
  await waitFor(() => expect(zodiac).toHaveValue("SIDEREAL"));
  expect(screen.queryByText("Loading settings...")).not.toBeInTheDocument();
});

test("shows every saved setting", async () => {
  await renderProfile("withProfile", [getSettings(savedSettings)]);
  const card = section(NAME);

  expect(card.getByLabelText("Zodiac System")).toHaveValue(savedSettings.zodiacType);
  expect(card.getByLabelText("House System")).toHaveValue(savedSettings.houseSystem);
  expect(card.getByLabelText("Ayanamsa")).toHaveValue(savedSettings.ayanamsa);
  expect(card.getByRole("checkbox", { name: "conjunction" })).toBeChecked();
  expect(card.getByRole("checkbox", { name: "sextile" })).not.toBeChecked();
  expect(card.getByLabelText("opposition max orb")).toHaveValue(5.5);
  expect(card.getByLabelText("Show Chiron")).toBeChecked();
  expect(card.getByLabelText("Show Black Moon Lilith")).toBeChecked();
  expect(card.getByLabelText("Show Degree Ticks")).not.toBeChecked();
  expect(card.getByLabelText("Show Angle Labels (ASC/MC)")).toBeChecked();
});

test("offers an ayanamsa only for the sidereal zodiac and saves none for tropical", async () => {
  const { user } = await renderProfile();
  const card = section(NAME);
  const sent = capture("put", "/settings");

  expect(card.queryByLabelText("Ayanamsa")).not.toBeInTheDocument();

  await user.selectOptions(card.getByLabelText("Zodiac System"), "Sidereal");
  expect(card.getByLabelText("Ayanamsa")).toHaveValue("LAHIRI");

  await user.selectOptions(card.getByLabelText("Zodiac System"), "Tropical");
  expect(card.queryByLabelText("Ayanamsa")).not.toBeInTheDocument();

  await user.click(card.getByRole("button", { name: "Save Chart Settings" }));

  expect(await screen.findByText("Astrology settings updated")).toBeInTheDocument();
  expect(sent[0].body).not.toHaveProperty("ayanamsa");
  expect(sent[0].body).toMatchObject({ zodiacType: "TROPICAL" });
});

test("locks an aspect's orb while the aspect is off", async () => {
  const { user } = await renderProfile();
  const card = section(NAME);

  expect(card.getByLabelText("trine max orb")).toBeEnabled();

  await user.click(card.getByRole("checkbox", { name: "trine" }));
  expect(card.getByLabelText("trine max orb")).toBeDisabled();

  await user.click(card.getByRole("checkbox", { name: "trine" }));
  expect(card.getByLabelText("trine max orb")).toBeEnabled();
});

test("saves the settings as shown on screen", async () => {
  const { user } = await renderProfile();
  const card = section(NAME);
  const sent = capture("put", "/settings");

  await user.selectOptions(card.getByLabelText("Zodiac System"), "Sidereal");
  await user.selectOptions(card.getByLabelText("Ayanamsa"), "Raman");
  await user.selectOptions(card.getByLabelText("House System"), "Whole Sign");
  await user.click(card.getByRole("checkbox", { name: "sextile" }));
  fireEvent.change(card.getByLabelText("opposition max orb"), { target: { value: "5.5" } });
  await user.click(card.getByLabelText("Show Black Moon Lilith"));
  await user.click(card.getByLabelText("Show Degree Ticks"));
  await user.click(card.getByRole("button", { name: "Save Chart Settings" }));

  expect(await screen.findByText("Astrology settings updated")).toBeInTheDocument();
  expect(sent).toHaveLength(1);
  expect(sent[0].body).toEqual(savedSettings);
});

test("resets the settings to the defaults", async () => {
  const { user } = await renderProfile("withProfile", [getSettings(savedSettings)]);
  const card = section(NAME);
  const sent = capture("post", "/settings/reset");

  await user.click(card.getByRole("button", { name: "Reset" }));

  expect(await screen.findByText("Settings reset to defaults")).toBeInTheDocument();
  expect(sent).toHaveLength(1);
  expect(card.getByLabelText("Zodiac System")).toHaveValue(defaultSettings.zodiacType);
  expect(card.getByLabelText("House System")).toHaveValue(defaultSettings.houseSystem);
  expect(card.getByRole("checkbox", { name: "sextile" })).toBeChecked();
  expect(card.getByLabelText("opposition max orb")).toHaveValue(8);
  expect(card.getByLabelText("Show Black Moon Lilith")).not.toBeChecked();
  expect(card.getByLabelText("Show Degree Ticks")).toBeChecked();
});

test("shows the backend's error when saving fails", async () => {
  const { user } = await renderProfile();
  const card = section(NAME);
  reject("put", "/settings", "House system is not supported");

  await user.click(card.getByRole("button", { name: "Save Chart Settings" }));

  expect(await screen.findByText("House system is not supported")).toBeInTheDocument();
});

test("shows the backend's error when resetting fails", async () => {
  const { user } = await renderProfile();
  const card = section(NAME);
  reject("post", "/settings/reset", "Reset is unavailable");

  await user.click(card.getByRole("button", { name: "Reset" }));

  expect(await screen.findByText("Reset is unavailable")).toBeInTheDocument();
});

test.each([
  ["20", 15],
  ["-3", 0],
  ["", 0],
])("keeps a typed orb of %j within range", async (typed, saved) => {
  const { user } = await renderProfile();
  const card = section(NAME);
  const sent = capture("put", "/settings");

  fireEvent.change(card.getByLabelText("square max orb"), { target: { value: typed } });
  expect(card.getByLabelText("square max orb")).toHaveValue(saved);

  await user.click(card.getByRole("button", { name: "Save Chart Settings" }));

  expect(await screen.findByText("Astrology settings updated")).toBeInTheDocument();
  expect(sent[0].body).toMatchObject({ aspectOptions: { SQUARE: { show: true, minOrb: saved } } });
});

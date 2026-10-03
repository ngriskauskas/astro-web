import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { mainBirthProfile, places } from "../mocks";
import {
  capture,
  pickPlace,
  PLACE_NOT_PICKED,
  reject,
  renderProfile,
  section,
  setValue,
  typePlace,
} from "./profile";

const PATH = "/birth-profiles/:id";

test("shows the main profile's birth details and no name field", async () => {
  await renderProfile();
  const card = section("My Birth Info");

  expect(card.getByLabelText("Birth Date")).toHaveValue(mainBirthProfile.birthDate);
  expect(card.getByLabelText("Birth Time")).toHaveValue(mainBirthProfile.birthTime);
  expect(card.getByLabelText("Unknown time?")).not.toBeChecked();
  expect(card.getByLabelText("Birth Place")).toHaveValue(mainBirthProfile.location);
  expect(card.queryByLabelText("Name")).not.toBeInTheDocument();
});

test("saves an edited date, time and place to the main profile", async () => {
  const { user } = await renderProfile();
  const card = section("My Birth Info");
  const sent = capture("put", PATH);

  await setValue(user, card.getByLabelText("Birth Date"), "1991-06-16");
  await setValue(user, card.getByLabelText("Birth Time"), "09:45");
  await pickPlace(user, card, card.getByLabelText("Birth Place"), places[1]);
  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(await screen.findByText("Profile updated")).toBeInTheDocument();
  expect(sent).toEqual([
    {
      id: String(mainBirthProfile.id),
      body: {
        name: "My Profile",
        isMain: true,
        birthDate: "1991-06-16",
        birthTime: "09:45",
        birthTimeUnknown: false,
        location: places[1].display_name,
        latitude: Number(places[1].lat),
        longitude: Number(places[1].lon),
      },
    },
  ]);
});

test("marking the time unknown clears and locks it, and saves it as unknown", async () => {
  const { user } = await renderProfile();
  const card = section("My Birth Info");
  const sent = capture("put", PATH);

  await user.click(card.getByLabelText("Unknown time?"));

  expect(card.getByLabelText("Birth Time")).toHaveValue("");
  expect(card.getByLabelText("Birth Time")).toBeDisabled();

  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(await screen.findByText("Profile updated")).toBeInTheDocument();
  expect(sent[0].body).toMatchObject({ birthTimeUnknown: true, birthTime: "" });
});

test("shows an error and keeps the entered values when saving fails", async () => {
  const { user } = await renderProfile();
  const card = section("My Birth Info");
  reject("put", PATH, "Birth date is invalid");

  await setValue(user, card.getByLabelText("Birth Date"), "1991-06-16");
  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(
    await screen.findByText(/Failed to update Profile.*Birth date is invalid/),
  ).toBeInTheDocument();
  expect(card.getByLabelText("Birth Date")).toHaveValue("1991-06-16");
});

test("does not save a birth place that was typed but not picked", async () => {
  const { user } = await renderProfile();
  const card = section("My Birth Info");
  const sent = capture("put", PATH);

  await typePlace(user, card.getByLabelText("Birth Place"), "Paris");
  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(await card.findByRole("alert")).toHaveTextContent(PLACE_NOT_PICKED);
  expect(sent).toHaveLength(0);
});

test("saves when the birth place text is typed back to the picked place", async () => {
  const { user } = await renderProfile();
  const card = section("My Birth Info");
  const sent = capture("put", PATH);

  await typePlace(user, card.getByLabelText("Birth Place"), mainBirthProfile.location);
  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(await screen.findByText("Profile updated")).toBeInTheDocument();
  expect(sent[0].body).toMatchObject({
    location: mainBirthProfile.location,
    latitude: mainBirthProfile.latitude,
    longitude: mainBirthProfile.longitude,
  });
});

test("does not save without a birth date", async () => {
  const { user } = await renderProfile();
  const card = section("My Birth Info");
  const sent = capture("put", PATH);

  await user.clear(card.getByLabelText("Birth Date"));
  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(card.getByLabelText("Birth Date")).toBeInvalid();
  expect(sent).toHaveLength(0);
});

test("does not save without a birth time unless it is marked unknown", async () => {
  const { user } = await renderProfile();
  const card = section("My Birth Info");
  const sent = capture("put", PATH);

  await user.clear(card.getByLabelText("Birth Time"));
  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(card.getByLabelText("Birth Time")).toBeInvalid();
  expect(sent).toHaveLength(0);
});

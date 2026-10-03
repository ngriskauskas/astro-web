import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { places, user as account } from "../mocks";
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

test("shows the username and location for editing and the email read-only", async () => {
  await renderProfile();
  const card = section("Account Info");

  expect(card.getByLabelText("Username")).toHaveValue(account.username);
  expect(card.getByLabelText("Username")).toBeEnabled();
  expect(card.getByLabelText("Location")).toHaveValue(account.location.address);
  expect(card.getByLabelText("Location")).toBeEnabled();
  expect(card.getByLabelText("Email")).toHaveValue(account.email);
  expect(card.getByLabelText("Email")).toBeDisabled();
});

test("saves a new username and a picked location", async () => {
  const { user } = await renderProfile();
  const card = section("Account Info");
  const sent = capture("put", "/me");

  await setValue(user, card.getByLabelText("Username"), "stargazer");
  await pickPlace(user, card, card.getByLabelText("Location"), places[1]);
  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(await screen.findByText("Profile Updated")).toBeInTheDocument();
  expect(sent).toHaveLength(1);
  // The timezone is not asserted: the backend derives it from the coordinates and
  // ignores whatever the app sends.
  expect(sent[0].body).toMatchObject({
    username: "stargazer",
    location: {
      address: places[1].display_name,
      latitude: Number(places[1].lat),
      longitude: Number(places[1].lon),
    },
  });
});

test("shows the backend's error and keeps the entered values when saving fails", async () => {
  const { user } = await renderProfile();
  const card = section("Account Info");
  reject("put", "/me", "Username is taken");

  await setValue(user, card.getByLabelText("Username"), "stargazer");
  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(await screen.findByText("Username is taken")).toBeInTheDocument();
  expect(card.getByLabelText("Username")).toHaveValue("stargazer");
});

test("does not save a location that was typed but not picked", async () => {
  const { user } = await renderProfile();
  const card = section("Account Info");
  const sent = capture("put", "/me");

  await typePlace(user, card.getByLabelText("Location"), "Paris");
  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(await card.findByRole("alert")).toHaveTextContent(PLACE_NOT_PICKED);
  expect(sent).toHaveLength(0);
});

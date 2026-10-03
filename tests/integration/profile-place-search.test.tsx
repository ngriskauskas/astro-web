import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { expect, test } from "vitest";
import { PLACE_SEARCH_URL, places } from "../mocks";
import { renderProfile, section, typePlace } from "./profile";
import { server } from "./setup";

// Longer than the search field's 300ms debounce.
const afterDebounce = () => new Promise((resolve) => setTimeout(resolve, 450));

const countSearches = (respond: () => Response = () => HttpResponse.json(places)) => {
  const searches: string[] = [];
  server.use(
    http.get(PLACE_SEARCH_URL, ({ request }) => {
      searches.push(new URL(request.url).searchParams.get("q") ?? "");
      return respond();
    }),
  );
  return searches;
};

test("does not search for fewer than three characters", async () => {
  const { user } = await renderProfile();
  const card = section("Account Info");
  const searches = countSearches();

  await typePlace(user, card.getByLabelText("Location"), "Lo");
  await afterDebounce();

  expect(searches).toEqual([]);
  expect(card.queryByText(places[0].display_name)).not.toBeInTheDocument();
});

test("suggests places and fills the field with the one picked", async () => {
  const { user } = await renderProfile();
  const card = section("Account Info");
  const searches = countSearches();

  await typePlace(user, card.getByLabelText("Location"), "Lond");

  expect(await card.findByText(places[0].display_name)).toBeInTheDocument();
  expect(card.getByText(places[1].display_name)).toBeInTheDocument();
  expect(searches).toEqual(["Lond"]);

  await user.click(card.getByText(places[1].display_name));

  expect(card.getByLabelText("Location")).toHaveValue(places[1].display_name);
  expect(card.queryByText(places[0].display_name)).not.toBeInTheDocument();
});

test("closes the suggestions when the user leaves the field", async () => {
  const { user } = await renderProfile();
  const card = section("Account Info");

  await typePlace(user, card.getByLabelText("Location"), "Lond");
  expect(await card.findByText(places[0].display_name)).toBeInTheDocument();

  await user.click(card.getByLabelText("Username"));
  expect(card.queryByText(places[0].display_name)).not.toBeInTheDocument();

  // They are still there on coming back to the field.
  await user.click(card.getByLabelText("Location"));
  expect(card.getByText(places[0].display_name)).toBeInTheDocument();
});

test("does not open suggestions that arrive after the user has left the field", async () => {
  const { user } = await renderProfile();
  const card = section("Account Info");
  const searches = countSearches();

  await typePlace(user, card.getByLabelText("Location"), "Lond");
  await user.click(card.getByLabelText("Username"));
  await waitFor(() => expect(searches).toEqual(["Lond"]));
  await afterDebounce();

  expect(card.queryByText(places[0].display_name)).not.toBeInTheDocument();
});

test("shows no suggestions when the search finds nothing", async () => {
  const { user } = await renderProfile();
  const card = section("Account Info");
  const searches = countSearches(() => HttpResponse.json([]));

  await typePlace(user, card.getByLabelText("Location"), "Zzzz");
  await waitFor(() => expect(searches).toEqual(["Zzzz"]));

  expect(card.queryByText(places[0].display_name)).not.toBeInTheDocument();
  expect(card.getByLabelText("Location")).toBeEnabled();
});

test("stays usable when the search service fails", async () => {
  const { user } = await renderProfile();
  const card = section("Account Info");
  const searches = countSearches(() => HttpResponse.error());

  await typePlace(user, card.getByLabelText("Location"), "Lond");
  await waitFor(() => expect(searches).toEqual(["Lond"]));
  await afterDebounce();

  expect(card.queryByText(places[0].display_name)).not.toBeInTheDocument();
  expect(card.getByLabelText("Location")).toBeEnabled();
  expect(card.getByLabelText("Location")).toHaveValue("Lond");
});

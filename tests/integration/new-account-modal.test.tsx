import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { expect, test } from "vitest";
import { NewAccountModal } from "../../src/components/NewAccountModal";
import { useBirthProfiles } from "../../src/contexts/BirthProfilesContext";
import { API_URL, places } from "../mocks";
import { renderWithApp } from "./render";
import { server } from "./setup";

// The modal renders nothing while birth profiles are loading, so tests need a signal
// that loading has finished before asserting the modal is absent.
const ProfilesLoaded = () => (useBirthProfiles().loading ? null : <span>profiles loaded</span>);

test("is not shown when the user has a main profile", async () => {
  renderWithApp(
    <>
      <NewAccountModal />
      <ProfilesLoaded />
    </>,
    { scenario: "withProfile" },
  );

  await screen.findByText("profiles loaded");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("keeps the modal open and shows the error when saving fails", async () => {
  const { user, container } = renderWithApp(<NewAccountModal />);
  server.use(
    http.post(`${API_URL}/birth-profiles`, () =>
      HttpResponse.json({ error: "Birth date is invalid" }, { status: 422 }),
    ),
  );

  const dialog = await screen.findByRole("dialog", { name: "Welcome! Let's set up your profile" });
  await user.type(container.querySelector('input[type="date"]')!, "1990-05-15");
  await user.type(container.querySelector('input[type="time"]')!, "08:30");
  await user.type(screen.getAllByPlaceholderText("City, Country")[0], "Lond");
  await user.click(await screen.findByText(places[0].display_name));
  await user.click(screen.getByRole("button", { name: "Get Started" }));

  expect(await screen.findByText(/Failed to save profile.*Birth date is invalid/)).toBeInTheDocument();
  expect(dialog).toBeInTheDocument();
});

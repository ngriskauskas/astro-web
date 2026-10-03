import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { customBirthProfiles, mainBirthProfile, places } from "../mocks";
import { getBirthProfiles } from "../mocks/handlers";
import { capture, pickPlace, reject, renderProfile, section, setValue } from "./profile";

const [mum, sam] = customBirthProfiles;

const fillNewProfile = async (
  user: Awaited<ReturnType<typeof renderProfile>>["user"],
  card: ReturnType<typeof section>,
) => {
  await user.type(card.getByLabelText("Name"), "Alex");
  await user.type(card.getByLabelText("Birth Date"), "2001-09-09");
  await user.type(card.getByLabelText("Birth Time"), "06:15");
  await pickPlace(user, card, card.getByLabelText("Birth Place"), places[0]);
};

test("lists each custom profile collapsed, without the main profile", async () => {
  await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");

  for (const profile of customBirthProfiles) {
    expect(card.getByRole("button", { name: profile.name })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  }
  expect(card.queryByText(mainBirthProfile.name)).not.toBeInTheDocument();
  expect(card.queryByLabelText("Birth Date")).not.toBeInTheDocument();
});

test("opens one profile at a time with its details filled in", async () => {
  const { user } = await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");

  await user.click(card.getByRole("button", { name: mum.name }));

  expect(card.getByLabelText("Name")).toHaveValue(mum.name);
  expect(card.getByLabelText("Birth Date")).toHaveValue(mum.birthDate);
  expect(card.getByLabelText("Birth Time")).toHaveValue(mum.birthTime);
  expect(card.getByLabelText("Birth Place")).toHaveValue(mum.location);

  await user.click(card.getByRole("button", { name: sam.name }));

  // getBy fails if two forms were open.
  expect(card.getByLabelText("Name")).toHaveValue(sam.name);
  expect(card.getByLabelText("Unknown time?")).toBeChecked();
  expect(card.getByRole("button", { name: mum.name })).toHaveAttribute("aria-expanded", "false");
});

test("adds a new profile", async () => {
  const { user } = await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");
  const sent = capture("post", "/birth-profiles");

  await user.click(card.getByRole("button", { name: "Add New" }));
  await fillNewProfile(user, card);
  await user.click(card.getByRole("button", { name: "Submit" }));

  expect(await screen.findByText("Profile updated")).toBeInTheDocument();
  expect(sent).toHaveLength(1);
  expect(sent[0].body).toEqual({
    name: "Alex",
    isMain: false,
    birthDate: "2001-09-09",
    birthTime: "06:15",
    birthTimeUnknown: false,
    location: places[0].display_name,
    latitude: Number(places[0].lat),
    longitude: Number(places[0].lon),
  });
  expect(card.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
  expect(card.getByRole("button", { name: "Alex" })).toBeInTheDocument();
});

test("cancelling the new profile form sends nothing", async () => {
  const { user } = await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");
  const sent = capture("post", "/birth-profiles");

  await user.click(card.getByRole("button", { name: "Add New" }));
  await user.type(card.getByLabelText("Name"), "Alex");
  await user.click(card.getByRole("button", { name: "Cancel" }));

  expect(card.queryByLabelText("Name")).not.toBeInTheDocument();
  expect(sent).toHaveLength(0);
});

test("saves changes to an existing profile", async () => {
  const { user } = await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");
  const sent = capture("put", "/birth-profiles/:id");

  await user.click(card.getByRole("button", { name: mum.name }));
  await setValue(user, card.getByLabelText("Name"), "Mother");
  await setValue(user, card.getByLabelText("Birth Date"), "1962-11-04");
  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(await screen.findByText("Profile updated")).toBeInTheDocument();
  expect(sent).toEqual([
    {
      id: String(mum.id),
      body: {
        name: "Mother",
        isMain: false,
        birthDate: "1962-11-04",
        birthTime: mum.birthTime,
        birthTimeUnknown: false,
        location: mum.location,
        latitude: mum.latitude,
        longitude: mum.longitude,
      },
    },
  ]);
  expect(card.getByRole("button", { name: "Mother" })).toBeInTheDocument();
});

test("asks for confirmation before deleting, and cancelling keeps the profile", async () => {
  const { user } = await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");
  const sent = capture("delete", "/birth-profiles/:id");

  await user.click(card.getByRole("button", { name: mum.name }));
  await user.click(card.getByRole("button", { name: "Delete" }));

  expect(card.getByText("Delete this profile?")).toBeInTheDocument();
  expect(sent).toHaveLength(0);

  await user.click(card.getByRole("button", { name: "Cancel" }));

  expect(card.queryByText("Delete this profile?")).not.toBeInTheDocument();
  expect(card.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  expect(card.getByRole("button", { name: mum.name })).toBeInTheDocument();
  expect(sent).toHaveLength(0);
});

test("deletes the profile once confirmed", async () => {
  const { user } = await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");
  const sent = capture("delete", "/birth-profiles/:id");

  await user.click(card.getByRole("button", { name: mum.name }));
  await user.click(card.getByRole("button", { name: "Delete" }));
  await user.click(card.getByRole("button", { name: "Confirm" }));

  expect(await screen.findByText("Profile deleted")).toBeInTheDocument();
  expect(sent).toEqual([{ id: String(mum.id), body: null }]);
  expect(card.queryByRole("button", { name: mum.name })).not.toBeInTheDocument();
});

test("shows an error and adds nothing when creating fails", async () => {
  const { user } = await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");
  reject("post", "/birth-profiles", "Name is taken");

  await user.click(card.getByRole("button", { name: "Add New" }));
  await fillNewProfile(user, card);
  await user.click(card.getByRole("button", { name: "Submit" }));

  expect(await screen.findByText(/Failed to update Profile.*Name is taken/)).toBeInTheDocument();
  expect(card.queryByRole("button", { name: "Alex" })).not.toBeInTheDocument();
  expect(card.getByLabelText("Name")).toHaveValue("Alex");
});

test("shows an error and keeps the old name when updating fails", async () => {
  const { user } = await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");
  reject("put", "/birth-profiles/:id", "Name is taken");

  await user.click(card.getByRole("button", { name: mum.name }));
  await setValue(user, card.getByLabelText("Name"), "Mother");
  await user.click(card.getByRole("button", { name: "Save Changes" }));

  expect(await screen.findByText(/Failed to update Profile.*Name is taken/)).toBeInTheDocument();
  expect(card.getByRole("button", { name: mum.name })).toBeInTheDocument();
});

test("shows an error and keeps the profile when deleting fails", async () => {
  const { user } = await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");
  reject("delete", "/birth-profiles/:id", "Not allowed");

  await user.click(card.getByRole("button", { name: mum.name }));
  await user.click(card.getByRole("button", { name: "Delete" }));
  await user.click(card.getByRole("button", { name: "Confirm" }));

  expect(await screen.findByText("Error deleting Profile")).toBeInTheDocument();
  expect(card.getByRole("button", { name: mum.name })).toBeInTheDocument();
});

test("shows only the heading and the add control when there are no custom profiles", async () => {
  await renderProfile("withProfile");
  const card = section("Custom Profiles");

  expect(card.getByRole("heading", { name: "Custom Profiles" })).toBeInTheDocument();
  expect(card.getAllByRole("button").map((button) => button.textContent)).toEqual(["Add New"]);
});

test.each(["Name", "Birth Date", "Birth Time"])(
  "does not create a profile without a %s",
  async (missing) => {
    const { user } = await renderProfile("withCustomProfiles");
    const card = section("Custom Profiles");
    const sent = capture("post", "/birth-profiles");

    await user.click(card.getByRole("button", { name: "Add New" }));
    await fillNewProfile(user, card);
    await user.clear(card.getByLabelText(missing));
    await user.click(card.getByRole("button", { name: "Submit" }));

    expect(card.getByLabelText(missing)).toBeInvalid();
    expect(sent).toHaveLength(0);
  },
);

test("does not create a profile without a birth place", async () => {
  const { user } = await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");
  const sent = capture("post", "/birth-profiles");

  await user.click(card.getByRole("button", { name: "Add New" }));
  await user.type(card.getByLabelText("Name"), "Alex");
  await user.type(card.getByLabelText("Birth Date"), "2001-09-09");
  await user.type(card.getByLabelText("Birth Time"), "06:15");
  await user.click(card.getByRole("button", { name: "Submit" }));

  expect(await card.findByRole("alert")).toHaveTextContent("Pick a place from the suggestions");
  expect(sent).toHaveLength(0);
});

test("keeps only one of the new form and an existing profile open", async () => {
  const { user } = await renderProfile("withCustomProfiles");
  const card = section("Custom Profiles");

  await user.click(card.getByRole("button", { name: "Add New" }));
  expect(card.getByRole("button", { name: "Submit" })).toBeInTheDocument();

  await user.click(card.getByRole("button", { name: mum.name }));
  expect(card.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
  expect(card.getByLabelText("Name")).toHaveValue(mum.name);

  await user.click(card.getByRole("button", { name: "Add New" }));
  expect(card.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  expect(card.getByRole("button", { name: mum.name })).toHaveAttribute("aria-expanded", "false");
  expect(card.getByLabelText("Name")).toHaveValue("");
});

test("lists many custom profiles", async () => {
  const many = Array.from({ length: 20 }, (_, i) => ({ ...mum, id: i + 2, name: `Person ${i + 1}` }));
  await renderProfile("withProfile", [getBirthProfiles([mainBirthProfile, ...many])]);
  const card = section("Custom Profiles");

  for (const profile of many) {
    expect(card.getByRole("button", { name: profile.name })).toBeInTheDocument();
  }
});

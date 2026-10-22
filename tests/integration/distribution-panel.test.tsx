import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { drawer, findWidget, renderChartPage } from "./charts";
import { capture } from "./requests";

test("the Earth tile opens the element's drawer with its general description", async () => {
  const { user } = await renderChartPage("charts");

  const summary = await findWidget("Summary");
  await user.click(summary.getByRole("button", { name: /^Earth: / }));

  expect(drawer.title()).toBe("Earth");
  expect(
    drawer.get().getByText(/Earth signs work through what is concrete/),
  ).toBeInTheDocument();
  expect(await drawer.get().findByText("Description for element EARTH 6 of 12")).toBeInTheDocument();
  expect(drawer.get().getByText("6 of 12")).toBeInTheDocument();
});

test("the element drawer asks for a reading of the emphasis, with the contributing placements", async () => {
  const sent = capture("post", "/descriptions");
  const { user } = await renderChartPage("charts");

  const summary = await findWidget("Summary");
  await user.click(summary.getByRole("button", { name: /^Earth: / }));

  const request = sent.find(
    ({ body }) => (body as { context?: { type?: string } } | null)?.context?.type === "distribution",
  );
  expect(request).toBeDefined();
  expect(request!.body).toMatchObject({
    context: { type: "distribution", kind: "ELEMENT", value: "EARTH", count: 6, total: 12 },
  });
  expect((request!.body as { context: { contributors: unknown[] } }).context.contributors).toHaveLength(6);
});

test("the modality drawer opens from the modality tiles", async () => {
  const { user } = await renderChartPage("charts");

  const summary = await findWidget("Summary");
  await user.click(summary.getByRole("button", { name: /^Cardinal: / }));

  expect(drawer.title()).toBe("Cardinal");
  expect(screen.getByRole("heading", { name: "Cardinal" })).toBeInTheDocument();
});

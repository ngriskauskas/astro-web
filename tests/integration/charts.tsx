import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import type { RequestHandler } from "msw";
import type { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import { Navbar } from "../../src/components/Navbar";
import { ProtectedCharts } from "../../src/components/ProtectedCharts";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";
import { ProtectedUserLocation } from "../../src/components/ProtectedUserLocation";
import { Charts } from "../../src/pages/Charts";
import { Daily } from "../../src/pages/Daily";
import { Moment } from "../../src/pages/Moment";
import { Synastry } from "../../src/pages/Synastry";
import { Transits } from "../../src/pages/Transits";
import type { ScenarioName } from "../mocks";
import { renderWithApp } from "./render";

export type ChartPage = "charts" | "moment" | "daily" | "transits" | "synastry";

// Paths and guards as in src/main.tsx.
const PAGES: Record<ChartPage, { path: string; element: ReactElement; needsLocation: boolean }> = {
  charts: { path: "natal", element: <Charts />, needsLocation: false },
  moment: { path: "moment", element: <Moment />, needsLocation: true },
  daily: { path: "daily", element: <Daily />, needsLocation: true },
  transits: { path: "transit", element: <Transits />, needsLocation: true },
  synastry: { path: "synastry", element: <Synastry />, needsLocation: false },
};

interface Options {
  scenario?: ScenarioName;
  handlers?: RequestHandler[];
  // Query string, for example "?date=2026-03-01&time=14:30".
  search?: string;
  // false returns without waiting for the chart: for loading, failure and redirect tests.
  wait?: boolean;
}

// Renders one chart page behind the same guards as the app, with a stand-in for the
// profile screen so a redirect can be seen, and waits until the wheel is drawn.
export const renderChartPage = async (
  page: ChartPage,
  { scenario = "withCustomProfiles", handlers = [], search = "", wait = true }: Options = {},
) => {
  const { path } = PAGES[page];
  const result = renderWithApp(
    <ProtectedRoute>
      <Navbar />
      <Routes>
        <Route path="/profile" element={<div>profile screen</div>} />
        <Route element={<ProtectedCharts />}>
          {Object.entries(PAGES).map(([name, page]) => (
            <Route
              key={name}
              path={`${page.path}/*`}
              element={
                page.needsLocation ? (
                  <ProtectedUserLocation>{page.element}</ProtectedUserLocation>
                ) : (
                  page.element
                )
              }
            />
          ))}
        </Route>
      </Routes>
    </ProtectedRoute>,
    { scenario, handlers, route: `/${path}${search}` },
  );
  if (wait) await wheel();
  return result;
};

// The chart wheel, once it has been drawn.
export const wheel = async () =>
  within(await screen.findByRole("group", { name: "Chart wheel" }, { timeout: 3000 }));

// Queries scoped to one widget, by its heading.
export const widget = (name: string) => within(screen.getByRole("region", { name }));

export const findWidget = async (name: string) =>
  within(await screen.findByRole("region", { name }));

const drawerRegion = () => screen.queryByRole("complementary", { name: "Description" });

export const drawer = {
  isOpen: () => drawerRegion() !== null,
  // Queries scoped to the open drawer.
  get: () => within(screen.getByRole("complementary", { name: "Description" })),
  title: () =>
    within(screen.getByRole("complementary", { name: "Description" }))
      .getAllByRole("heading", { level: 2 })[0]
      .textContent?.trim(),
  back: (user: UserEvent) => user.click(drawer.get().getByRole("button", { name: "Back" })),
  close: (user: UserEvent) => user.click(drawer.get().getByRole("button", { name: "Close" })),
};

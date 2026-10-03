import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { Toaster } from "react-hot-toast";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../src/contexts/AuthContext";
import { BirthProfilesProvider } from "../../src/contexts/BirthProfilesContext";
import { fakeToken, scenario, type ScenarioName } from "../mocks";
import { server } from "./setup";

interface Options {
  // Which backend situation the test starts in.
  scenario?: ScenarioName;
  // Whether the app starts with a live session.
  signedIn?: boolean;
  route?: string;
}

// Renders `ui` inside the app's real auth and birth-profile providers, against the
// mocked backend.
export const renderWithApp = (
  ui: ReactElement,
  { scenario: name = "newAccount", signedIn = true, route = "/" }: Options = {},
) => {
  server.use(...scenario(name));
  if (signedIn) {
    localStorage.setItem("token", fakeToken());
    localStorage.setItem("refresh", "test-refresh-token");
  }

  return {
    user: userEvent.setup(),
    ...render(
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <BirthProfilesProvider>
            {ui}
            <Toaster />
          </BirthProfilesProvider>
        </MemoryRouter>
      </AuthProvider>,
    ),
  };
};

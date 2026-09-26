import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home.tsx";
import { Login } from "./pages/Login.tsx";
import { Register } from "./pages/Register.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { Profile } from "./pages/Profile.tsx";
import { BirthProfilesProvider } from "./contexts/BirthProfilesContext.tsx";
import { ChartProvider } from "./contexts/ChartContext.tsx";
import { Charts } from "./pages/Charts.tsx";
import { Time } from "./pages/Time.tsx";
import { Synastry } from "./pages/Synastry.tsx";
import { Transits } from "./pages/Transits.tsx";
import { LoginEmail } from "./pages/LoginEmail.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ProtectedCharts } from "./components/ProtectedCharts.tsx";
import { ProtectedUserLocation } from "./components/ProtectedUserLocation.tsx";
import { Moment } from "./pages/Moment.tsx";
import { ChartSettingsProvider } from "./contexts/ChartSettingsContext.tsx";
import { Daily } from "./pages/Daily.tsx";

const clientid = import.meta.env.VITE_GOOGLE_CLIENT_ID;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientid}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {/* <FriendsProvider> */}
                  <BirthProfilesProvider>
                    <ChartSettingsProvider>
                      <ChartProvider>
                        <App />
                      </ChartProvider>
                    </ChartSettingsProvider>
                  </BirthProfilesProvider>
                  {/* </FriendsProvider> */}
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="profile" element={<Profile />} />
              {/* <Route path="friends" element={<Friends />} /> */}

              <Route element={<ProtectedCharts />}>
                <Route
                  path="time/*"
                  element={
                    <ProtectedUserLocation>
                      <Time />
                    </ProtectedUserLocation>
                  }
                />
                <Route
                  path="daily/*"
                  element={
                    <ProtectedUserLocation>
                      <Daily />
                    </ProtectedUserLocation>
                  }
                />
                <Route
                  path="moment/*"
                  element={
                    <ProtectedUserLocation>
                      <Moment />
                    </ProtectedUserLocation>
                  }
                />

                <Route path="natal/*" element={<Charts />} />
                <Route path="synastry/*" element={<Synastry />} />
                <Route
                  path="transit/*"
                  element={
                    <ProtectedUserLocation>
                      <Transits />
                    </ProtectedUserLocation>
                  }
                />
              </Route>
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="login/email" element={<LoginEmail />} />
            <Route path="register" element={<Register />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);

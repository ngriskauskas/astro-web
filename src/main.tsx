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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <BirthProfilesProvider>
                  <ChartProvider>
                    <App />
                  </ChartProvider>
                </BirthProfilesProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="current-time" element={<Time />} />
            <Route path="charts" element={<Charts />} />
            <Route path="synastry" element={<Synastry />} />
            <Route path="transits" element={<Transits />} />

          </Route>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);

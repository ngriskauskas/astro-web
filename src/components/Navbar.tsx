import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ThemeSwitcher } from "./ThemeSwitcher";

const LINKS = [
  { to: "/natal", label: "Charts" },
  { to: "/moment", label: "Moment" },
  { to: "/daily", label: "Daily" },
  { to: "/transit", label: "Transits" },
  { to: "/synastry", label: "Synastry" },
];

const ACCOUNT_LINKS = [{ to: "/profile", label: "Profile" }];

// The current page gets a filled pill. Gray tokens, not a fixed colour, so it reads in every theme.
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 text-sm transition-colors ${
    isActive
      ? "bg-gray-200 font-medium text-gray-900"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-gray-900"
          >
            <span aria-hidden="true" className="text-2xl leading-none text-indigo-600">
              ☉
            </span>
            Astro
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeSwitcher />
          {ACCOUNT_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass}>
              {label}
            </NavLink>
          ))}
          <button
            className="cursor-pointer rounded-full px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <button
          className="rounded-full p-2 hover:bg-gray-100 md:hidden"
          aria-label="Menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <div
        className={`md:hidden fixed inset-0 z-40 overflow-hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        inert={!isOpen}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} />

        <div
          role="menu"
          aria-label="Menu"
          className={`absolute top-0 right-0 h-full w-72 max-w-[85vw] overflow-y-auto bg-white shadow-xl transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-5 pt-4">
            <span className="text-sm font-medium text-gray-500">Menu</span>
            <button
              className="cursor-pointer rounded-full p-2 hover:bg-gray-100"
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-1 px-3 pb-4 pt-2">
            {[...LINKS, ...ACCOUNT_LINKS].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                role="menuitem"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2.5 text-base transition-colors ${
                    isActive
                      ? "bg-gray-200 font-medium text-gray-900"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <button
              role="menuitem"
              className="cursor-pointer rounded-xl px-3 py-2.5 text-left text-base text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          <div className="border-t border-gray-200 px-5 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Theme
            </p>
            <ThemeSwitcher showLabels />
          </div>
        </div>
      </div>
    </nav>
  );
};

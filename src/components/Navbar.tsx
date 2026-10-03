import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const LINKS = [
  { to: "/natal", label: "Charts" },
  { to: "/moment", label: "Moment" },
  { to: "/daily", label: "Daily" },
  { to: "/transit", label: "Transits" },
  { to: "/synastry", label: "Synastry" },
];

const ACCOUNT_LINKS = [
  { to: "/friends", label: "Friends" },
  { to: "/profile", label: "Profile" },
];

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
    <nav className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white shadow">
      <div className="flex items-center space-x-4">
        <div className="text-xl font-bold text-gray-800 md:mr-15">
          <Link to="/">Astro</Link>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className="text-gray-700 hover:text-gray-900">
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="hidden md:flex space-x-6">
        {ACCOUNT_LINKS.map(({ to, label }) => (
          <Link key={to} to={to} className="text-gray-700 hover:text-gray-900">
            {label}
          </Link>
        ))}

        <button className="text-gray-700 hover:text-gray-900 cursor-pointer" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <button
        className="md:hidden p-2 rounded hover:bg-gray-100"
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
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        inert={!isOpen}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 bg-black/20" onClick={() => setIsOpen(false)} />

        <div
          role="menu"
          aria-label="Menu"
          className={`absolute top-0 right-0 h-full w-64 max-w-[80vw] overflow-y-auto bg-white shadow-lg transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex justify-end p-2">
            <button
              className="p-2 rounded hover:bg-gray-100 cursor-pointer"
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
          <div className="flex flex-col space-y-4 px-4 pb-4">
            {[...LINKS, ...ACCOUNT_LINKS].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
            <button
              role="menuitem"
              className="mr-auto text-gray-700 hover:text-gray-900 cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

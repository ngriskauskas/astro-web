import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <div className="flex items-center space-x-4">
        <div className="text-xl font-bold text-gray-800 mr-15">
          <Link to="/">Astro</Link>
        </div>
        <Link to="/charts" className="text-gray-700 hover:text-gray-900">
          Charts
        </Link>
        <Link to="/current-time" className="text-gray-700 hover:text-gray-900">
          Time
        </Link>
      </div>
      <div className="hidden md:flex space-x-6">
        <Link to="/profile" className="text-gray-700 hover:text-gray-900">
          Profile
        </Link>
        <button
          className="text-gray-700 hover:text-gray-900 cursor-pointer"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <button
        className="md:hidden p-2 rounded hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
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
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/20"
          onClick={() => setIsOpen(false)}
        />

        <div
          className={`absolute top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex flex-col space-y-4 p-4">
            <Link to="/profile" className="text-gray-700 hover:text-gray-900">
              Profile
            </Link>
            <button
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

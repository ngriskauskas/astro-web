import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
      <div className="text-xl font-bold text-gray-800">
        <a href="/">Astro</a>
      </div>
      <div className="hidden md:flex space-x-6">
        <a href="/" className="text-gray-700 hover:text-gray-900">
          Home
        </a>
        <a href="/about" className="text-gray-700 hover:text-gray-900">
          About
        </a>
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
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen
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
            <a href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </a>
            <a href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </a>
            <a href="/contact" className="text-gray-700 hover:text-gray-900">
              Contact
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

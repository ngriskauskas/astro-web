import { FiLoader } from "react-icons/fi";

export const Spinner = () => (
  <div role="status" aria-label="Loading" className="flex justify-center items-center py-3">
    <FiLoader className="w-5 h-5 text-gray-600 animate-spin" />
  </div>
);

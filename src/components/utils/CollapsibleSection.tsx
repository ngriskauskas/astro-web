import { type ReactNode, useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

export const CollapsibleSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="mb-4 rounded-lg">
      <button
        className="flex justify-between items-center w-full text-left py-2 px-3  hover:bg-gray-200 rounded-t-lg cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold text-lg">{title}</span>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {isOpen && <div className="p-1 py-2">{children}</div>}
    </section>
  );
};

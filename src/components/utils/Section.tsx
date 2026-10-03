import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { useState } from "react";
import { Spinner } from "./Spinner";

export const Section = ({
  title,
  children,
  startOpen = true,
  loading = false,
}: {
  title: string;
  children: React.ReactNode;
  startOpen?: boolean;
  loading?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(startOpen);
  return (
    <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
      <h3 className="text-sm font-medium text-gray-600">
        <button
          type="button"
          className="flex w-full items-center justify-between p-3 cursor-pointer"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {title}
          {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </button>
      </h3>
      {isOpen &&
        (loading ? (
          <Spinner />
        ) : (
          <div className="p-3 text-sm text-gray-800 leading-relaxed">{children}</div>
        ))}
    </div>
  );
};

export const SectionSmall = ({
  title,
  children,
  startOpen = true,
  loading = false,
  onOpen,
}: {
  title: string;
  children: React.ReactNode;
  startOpen?: boolean;
  loading?: boolean;
  onOpen?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(startOpen);
  return (
    <div className="rounded-md border border-gray-200 shadow-xs bg-gray-50">
      <h3 className="text-sm font-medium text-gray-600">
        <button
          type="button"
          className="flex w-full items-center justify-between p-2 cursor-pointer"
          aria-expanded={isOpen}
          onClick={() => {
            setIsOpen(!isOpen);
            if (onOpen) onOpen();
          }}
        >
          {title}
          {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>
      </h3>
      {isOpen &&
        (loading ? (
          <Spinner />
        ) : (
          <div className="p-2 text-sm text-gray-800 leading-relaxed">{children}</div>
        ))}
    </div>
  );
};

// A description that can be shown or hidden. The toggle is its own button, next to
// `children`, because `children` are usually chips that are buttons themselves.
export const DescSection = ({
  title,
  children,
  desc,
  startOpen = false,
}: {
  title?: string;
  children?: React.ReactNode;
  desc: string;
  startOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(startOpen);
  const chevron = isOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />;
  return (
    <div>
      {title && (
        <button
          type="button"
          className="flex w-full items-center justify-between mb-2 cursor-pointer"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-gray-500 text-xs uppercase tracking-wide">{title}</span>
          {chevron}
        </button>
      )}
      {children && (
        <div className="flex items-center justify-between">
          {children}
          {!title && (
            <button
              type="button"
              className="flex min-h-6 flex-1 items-center justify-end cursor-pointer"
              aria-label={isOpen ? "Hide description" : "Show description"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
            >
              {chevron}
            </button>
          )}
        </div>
      )}
      {isOpen && <div className="text-xs text-gray-600 mt-1 pl-2">{desc}</div>}
    </div>
  );
};

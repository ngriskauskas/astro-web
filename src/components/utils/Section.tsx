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
    <div className="mb-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-sm font-semibold text-gray-900">
        <button
          type="button"
          className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-gray-50 cursor-pointer"
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
          <div className="motion-fade-up p-3 text-sm text-gray-800 leading-relaxed">{children}</div>
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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <h3 className="text-sm font-semibold text-gray-900">
        <button
          type="button"
          className="flex w-full items-center justify-between p-2 text-left transition-colors hover:bg-gray-50 cursor-pointer"
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
          <div className="motion-fade-up p-2 text-sm text-gray-800 leading-relaxed">{children}</div>
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
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</span>
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
      {isOpen && (
        <div className="motion-fade-up mt-2 border-l-2 border-indigo-500/40 pl-3 text-[13px] leading-relaxed text-gray-700">
          {desc}
        </div>
      )}
    </div>
  );
};

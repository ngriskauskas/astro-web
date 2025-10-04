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
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </div>
      {isOpen &&
        (loading ? (
          <Spinner />
        ) : (
          <div className="p-3 text-sm text-gray-800 leading-relaxed">
            {children}
          </div>
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
      <div
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
          onOpen && onOpen();
        }}
      >
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </div>
      {isOpen &&
        (loading ? (
          <Spinner />
        ) : (
          <div className="p-2 text-sm text-gray-800 leading-relaxed">
            {children}
          </div>
        ))}
    </div>
  );
};

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
  return (
    <div>
      <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {title && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs uppercase tracking-wide">
              {title}
            </span>

            {isOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
          </div>
        )}
        {children && (
          <div className="flex items-center justify-between">
            {children}
            {!title &&
              (isOpen ? (
                <FiChevronUp size={12} />
              ) : (
                <FiChevronDown size={12} />
              ))}
          </div>
        )}
      </div>
      {isOpen && <div className="text-xs text-gray-600 mt-1 pl-2">{desc}</div>}
    </div>
  );
};

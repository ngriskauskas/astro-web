import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// The tint a widget carries. It belongs to the widget, not the page, so the same widget
// looks the same wherever it is placed.
export type WidgetTone = "plain" | "hero" | "glance" | "hours" | "moon" | "ascendant" | "weekly";

// Tailwind only generates class names it finds written out in full.
const TONES: Record<WidgetTone, string> = {
  plain: "bg-white",
  hero: "bg-white",
  glance: "bg-white",
  hours: "bg-white",
  moon: "bg-white",
  ascendant: "bg-white",
  weekly: "bg-white",
};

// What every library widget accepts from the page that places it: where it sits in the
// layout, and nothing else.
export interface WidgetProps {
  className?: string;
}

interface WidgetShellProps extends WidgetProps {
  // Names the widget's region and heading, e.g. "moon" gives the heading id "moon-heading".
  id: string;
  title: string;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  headingLevel?: 1 | 2 | 3;
  tone?: WidgetTone;
  // "narrow" caps the card at a width suited to tall, single-column content.
  size?: "full" | "narrow";
  // Controls that sit in the header, beside the title.
  actions?: ReactNode;
  // A link to the page that shows more of this widget's subject.
  link?: { to: string; label: string };
  children: ReactNode;
}

export const Widget = ({
  id,
  title,
  eyebrow,
  subtitle,
  headingLevel = 2,
  tone = "plain",
  size = "full",
  actions,
  link,
  className = "",
  children,
}: WidgetShellProps) => {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3";
  const headingId = `${id}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      data-tone={tone}
      className={`widget min-w-0 rounded-2xl border border-gray-200 p-4 shadow-sm sm:p-5 ${TONES[tone]} ${
        size === "narrow" ? "w-full max-w-[400px]" : ""
      } ${className}`}
    >
      <header className="mb-3 flex min-h-7 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          {eyebrow && <p className="text-sm font-semibold text-indigo-700">{eyebrow}</p>}
          <Heading id={headingId} className="text-lg font-semibold text-gray-900">
            {title}
          </Heading>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {(actions || link) && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {actions}
            {link && <WidgetLink to={link.to}>{link.label}</WidgetLink>}
          </div>
        )}
      </header>
      {children}
    </section>
  );
};

export const WidgetLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link
    to={to}
    className="inline-flex min-h-10 shrink-0 cursor-pointer items-center rounded-lg px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
  >
    {children}
    <span className="ml-1" aria-hidden="true">
      →
    </span>
  </Link>
);

// The segmented control widgets use to switch between their own views. Every widget with
// views uses this one, so they all look and behave alike.
export const WidgetViewSwitch = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (id: T) => void;
}) => (
  <div
    role="group"
    aria-label={label}
    className="inline-flex rounded-md border border-gray-300 bg-white/80 p-0.5"
  >
    {options.map((option) => (
      <button
        key={option.id}
        type="button"
        aria-pressed={value === option.id}
        onClick={() => onChange(option.id)}
        className={`cursor-pointer rounded px-3 py-1.5 text-xs font-medium transition-colors ${
          value === option.id ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

import { Link } from "react-router-dom";
import { Widget, type WidgetProps } from "./Widget";

const DESTINATIONS = [
  { to: "/daily", title: "Today", detail: "Moon, hours & timings" },
  { to: "/natal", title: "My chart", detail: "Your birth chart" },
  { to: "/moment", title: "A moment", detail: "Choose a date & time" },
  { to: "/transit", title: "Transits", detail: "The sky over your chart" },
  { to: "/synastry", title: "Synastry", detail: "Compare two charts" },
  { to: "/profile", title: "Profiles", detail: "Birth details & settings" },
];

// Where to go next. It has no chart data, so it can sit on any page.
export const QuickLinks = ({ className }: WidgetProps) => (
  <Widget
    id="quick-links"
    title="Start with what you're curious about."
    eyebrow="A personal sky, updated throughout the day"
    subtitle="Follow today's sky, explore your birth chart, or compare two charts. Every view uses your saved profile and real chart timings."
    headingLevel={1}
    tone="hero"
    className={className}
  >
    <nav aria-label="Choose a destination" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {DESTINATIONS.map((destination) => (
        <QuickLink key={destination.to} {...destination} />
      ))}
    </nav>
  </Widget>
);

const QuickLink = ({ to, title, detail }: { to: string; title: string; detail: string }) => (
  <Link
    to={to}
    className="group flex min-h-20 min-w-0 cursor-pointer flex-col justify-center rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:p-4"
  >
    <span className="flex items-center justify-between gap-2 text-sm font-semibold text-gray-900">
      {title}
      <span
        aria-hidden="true"
        className="text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600"
      >
        →
      </span>
    </span>
    <span className="mt-1 text-xs text-gray-500">{detail}</span>
  </Link>
);

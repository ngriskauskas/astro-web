import { Link } from "react-router-dom";
import { useWheel } from "../../hooks/useWheel";

export const DateChip = ({
  date,
  format = false,
}: {
  date: string;
  format?: boolean;
}) => {
  const {
    settings: { zodiacSystem, ayanamsa },
    type,
  } = useWheel();
  const urlDate = encodeURIComponent(date);
  const urlZodiac = encodeURIComponent(zodiacSystem);
  const urlAyanamsa = encodeURIComponent(ayanamsa || "");
  const displayDate = format
    ? new Date(`${date}T00:00`).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : date;

  const toLink =
    type === "time"
      ? `/moment?date=${urlDate}&zodiac_system=${urlZodiac}&ayanamsa=${urlAyanamsa}`
      : `/transit?date=${urlDate}&zodiac_system=${urlZodiac}&ayanamsa=${urlAyanamsa}`;
  return (
    <Link
      to={toLink}
      className="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded shadow-sm text-xs font-medium hover:shadow-md hover:bg-gray-50"
    >
      <span className="font-medium text-gray-600">{displayDate}</span>
    </Link>
  );
};

export const DateTimeChip = ({
  datetime,
  format = false,
}: {
  datetime: string;
  format?: boolean;
}) => {
  const {
    settings: { zodiacSystem, ayanamsa },
    type,
  } = useWheel();

  const [datePart, timePart] = datetime.split("T");
  const displayDateTime = format
    ? new Date(datetime).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : datetime;

  const urlDate = encodeURIComponent(datePart);
  const urlTime = encodeURIComponent(timePart);
  const urlZodiac = encodeURIComponent(zodiacSystem);
  const urlAyanamsa = encodeURIComponent(ayanamsa || "");

  const toLink =
    type === "time"
      ? `/moment?date=${urlDate}&time=${urlTime}&zodiac_system=${urlZodiac}&ayanamsa=${urlAyanamsa}`
      : `/transit?date=${urlDate}&time=${urlTime}&zodiac_system=${urlZodiac}&ayanamsa=${urlAyanamsa}`;

  return (
    <Link
      to={toLink}
      className="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded shadow-sm text-xs font-medium hover:shadow-md hover:bg-gray-50"
    >
      <span className="font-medium text-gray-600">{displayDateTime}</span>
    </Link>
  );
};

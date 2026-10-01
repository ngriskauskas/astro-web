import { Link } from "react-router-dom";
import { useWheel } from "../../hooks/useWheel";

export const DateChip = ({
  date,
  format = false,
  style = true,
}: {
  date: string;
  format?: boolean;
  style?: boolean;
}) => {
  const { type } = useWheel();
  const urlDate = encodeURIComponent(date);
  const displayDate = format
    ? new Date(`${date}T00:00`).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : date;

  const toLink = type === "time" ? `/moment?date=${urlDate}` : `/transit?date=${urlDate}`;

  return (
    <Link
      to={toLink}
      className={
        style
          ? "inline-flex items-center gap-1 px-2 py-1 bg-white border rounded shadow-sm text-xs font-medium hover:shadow-md hover:bg-gray-50"
          : ""
      }
    >
      <span className={style ? "font-medium text-gray-600" : ""}>{displayDate}</span>
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
  const { type } = useWheel();

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
  const toLink =
    type === "time"
      ? `/moment?date=${urlDate}&time=${urlTime}`
      : `/transit?date=${urlDate}&time=${urlTime}`;

  return (
    <Link
      to={toLink}
      className="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded shadow-sm text-xs font-medium hover:shadow-md hover:bg-gray-50"
    >
      <span className="font-medium text-gray-600">{displayDateTime}</span>
    </Link>
  );
};

export const TimeChip = ({
  datetime,
  format = true,
  style = true,
}: {
  datetime: string;
  format?: boolean;
  style?: boolean;
}) => {
  const { type } = useWheel();

  const [, timePart] = datetime.split("T");

  const displayTime = format
    ? new Date(datetime).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : timePart;

  const urlDate = encodeURIComponent(datetime.split("T")[0]);
  const urlTime = encodeURIComponent(timePart);
  const toLink =
    type === "time"
      ? `/moment?date=${urlDate}&time=${urlTime}`
      : `/transit?date=${urlDate}&time=${urlTime}`;

  return (
    <Link
      to={toLink}
      className={
        style
          ? "inline-flex items-center gap-1 px-2 py-1 bg-white border rounded shadow-sm text-xs font-medium hover:shadow-md hover:bg-gray-50"
          : ""
      }
    >
      <span className={style ? "font-medium text-gray-600" : ""}>{displayTime}</span>
    </Link>
  );
};

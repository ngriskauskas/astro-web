import { getLocalISODateTime } from "../../utils/funcs";
import { DateChip, TimeChip } from "../utils/DateChip";
import type { DailyTimeSlot, WeeklyTimeSlot } from "./types";

export const TimelineSlot = ({
  slot,
}: {
  slot: DailyTimeSlot | WeeklyTimeSlot;
}) => {
  const datetimeString = getLocalISODateTime(slot.date);
  const isDaily = "isHour" in slot;

  const dateString = slot.date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`relative snap-start ${slot.isNow ? "is-now" : ""}`}>
      {slot.isNow && (
        <div
          className="
            absolute top-0 bottom-0 left-0 right-0 -ml-1
            bg-blue-100/40 border-2 border-blue-400 rounded-md shadow-md
          "
        />
      )}

      <div
        className={`flex items-center relative text-left
          ${!isDaily ? "h-35" : slot.isNow ? "h-25" : "h-18"}`}
      >
        <div
          className={`mr-4 flex-shrink-0
            ${isDaily
              ? slot.isHour
                ? "w-6 h-[3px] bg-gray-700"
                : "w-3 h-[2px] bg-gray-400 opacity-70"
              : "w-3 h-[3px] bg-gray-400 opacity-80"
            }
          `}
        />

        <div
          className={`
            min-w-[60px] 
            ${isDaily
              ? slot.isNow
                ? "text-md font-semibold font-mono"
                : slot.isHour
                  ? "text-sm text-gray-700 font-mono"
                  : "text-xs text-gray-400 font-mono"
              : "text-sm font-medium text-gray-600"
            }
          `}
        >
          {isDaily ? (
            <TimeChip datetime={datetimeString} style={false} />
          ) : (
            <DateChip date={dateString} style={false} />
          )}
        </div>

        {slot.events && slot.events.length > 0 && (
          <div className="ml-4 flex gap-3 flex-wrap">
            {slot.events.map((event, i) => (
              <div key={i}>{event.renderPreview()}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

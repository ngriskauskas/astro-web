import { getLocalISODateTime } from "../../utils/funcs";
import { TimeChip } from "../utils/DateChip";
import type { DailyTimeSlot, TimelineEvent } from "./types";

export const TimelineSlot = ({
  slot,
  opacity = 100,
  onSelectEvent,
}: {
  slot: DailyTimeSlot;
  opacity?: number;
  onSelectEvent: (event: TimelineEvent) => void;
}) => {
  const datetimeString = getLocalISODateTime(slot.date);

  return (
    <div
      className={`relative snap-start ${slot.isNow ? "is-now" : ""}`}
      style={{ opacity }}
    >
      {slot.isNow && (
        <div
          className="
            absolute top-0 bottom-0 left-0 right-0 -ml-1
            bg-blue-100/40 border-2 border-blue-400 rounded-md shadow-md
            pointer-events-none "
        />
      )}

      <div
        className={`
          flex items-center relative text-left
          ${slot.isNow ? "h-25" : "h-18"}
        `}
      >
        <div
          className={`mr-4 flex-shrink-0
            ${slot.isHour
              ? "w-6 h-[3px] bg-gray-700"
              : "w-3 h-[2px] bg-gray-400 opacity-70"
            }
          `}
        />

        <div
          className={`
            min-w-[60px] 
            ${slot.isNow
              ? "text-md font-semibold font-mono"
              : slot.isHour
                ? "text-sm text-gray-700 font-mono"
                : "text-xs text-gray-400 font-mono"
            }
          `}
        >
          <TimeChip datetime={datetimeString} style={false} />
        </div>

        {slot.events && slot.events.length > 0 && (
          <div className="ml-4 flex gap-3 flex-wrap ">
            {slot.events.map((event, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectEvent(event)}
                className="focus:outline-none cursor-pointer"
              >
                {event.renderPreview()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

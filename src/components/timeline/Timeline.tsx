import { useEffect, useRef } from "react";
import { TimelineSlot } from "./TimelineSlot";
import type { DailyTimeSlot, TimelineEvent } from "./types";

const createDailyTimeSlots = (events: TimelineEvent[]): DailyTimeSlot[] => {
  const today = new Date();
  const now = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 24 * 4 }, (_, i) => {
    const slotDate = new Date(today.getTime() + i * 15 * 60 * 1000);
    const hours24 = slotDate.getHours();
    const minutes = slotDate.getMinutes();
    const ampm = hours24 < 12 ? "AM" : "PM";
    const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const minuteStr = minutes.toString().padStart(2, "0");
    const label = `${hour12}:${minuteStr} ${ampm}`;
    const isHour = minutes === 0;

    const isNow =
      slotDate.getHours() === now.getHours() &&
      slotDate.getMinutes() === Math.floor(now.getMinutes() / 15) * 15;

    const slotEvents = events.filter((e) => {
      const roundedMinutes = Math.floor(e.start.getMinutes() / 15) * 15;
      return e.start.getHours() === hours24 && roundedMinutes === minutes;
    });

    return {
      date: slotDate,
      hours24,
      minutes,
      isHour,
      label,
      isNow,
      events: slotEvents,
    };
  });
};

export const Timeline = ({ events }: { events: TimelineEvent[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const slots = createDailyTimeSlots(events);

  useEffect(() => {
    if (!containerRef.current) return;
    const nowSlot =
      containerRef.current.querySelector<HTMLDivElement>(".is-now");
    if (nowSlot) {
      const containerHeight = containerRef.current.offsetHeight;
      const slotTop = nowSlot.offsetTop;
      const slotHeight = nowSlot.offsetHeight;
      containerRef.current.scrollTop =
        slotTop - containerHeight / 2 + slotHeight / 2;
    }
  }, []);

  return (
    <div>
      <div className="relative h-[615px]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-16 bg-gradient-to-b from-white to-transparent" />
          <div className="absolute bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>
        <div
          ref={containerRef}
          className="h-full overflow-y-scroll hide-scrollbar snap-y snap-mandatory relative scroll-smooth p-1"
        >
          {slots.map((slot, idx) => {
            return <TimelineSlot key={idx} slot={slot} />;
          })}
        </div>
      </div>
    </div>
  );
};

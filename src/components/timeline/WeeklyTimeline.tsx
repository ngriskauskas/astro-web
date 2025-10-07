import { useEffect, useRef } from "react";
import { TimelineSlot } from "./TimelineSlot";
import type { DailyTimeSlot, TimelineEvent } from "./types";

const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

const createWeeklyTimeSlots = (events: TimelineEvent[]): DailyTimeSlot[] => {
  const today = new Date();
  const weekStart = getWeekStart(today);

  return Array.from({ length: 7 }, (_, i) => {
    const slotDate = new Date(weekStart);
    slotDate.setDate(weekStart.getDate() + i);

    const dayLabel = slotDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    const slotEvents = events.filter(
      (e) =>
        e.start.getFullYear() === slotDate.getFullYear() &&
        e.start.getMonth() === slotDate.getMonth() &&
        e.start.getDate() === slotDate.getDate(),
    );

    const isToday =
      slotDate.getFullYear() === today.getFullYear() &&
      slotDate.getMonth() === today.getMonth() &&
      slotDate.getDate() === today.getDate();

    return {
      date: slotDate,
      label: dayLabel,
      isNow: isToday,
      events: slotEvents,
      hours24: 0,
      minutes: 0,
      isHour: true,
    };
  });
};

export const WeeklyTimeline = ({ events }: { events: TimelineEvent[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slots = createWeeklyTimeSlots(events);

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

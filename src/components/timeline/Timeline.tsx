import { useRef, useEffect } from "react";

export const Timeline = ({
  horizon = "days",
}: {
  horizon?: "days" | "minutes";
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerHeight = 1200; // total timeline height in px
  const now = new Date(); // local time

  // Compute vertical offset for "now"
  const computeNowOffset = () => {
    if (horizon === "days") {
      const hours = now.getHours() + now.getMinutes() / 60;
      return (hours / 24) * containerHeight;
    } else if (horizon === "minutes") {
      const totalMinutes = 24 * 60;
      const minutes = now.getHours() * 60 + now.getMinutes();
      return (minutes / totalMinutes) * containerHeight;
    }
    return 0;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const nowOffset = computeNowOffset();
    containerRef.current.scrollTop =
      nowOffset - containerRef.current.clientHeight / 2;
  }, [horizon]);

  // Format hour for AM/PM
  const formatHour = (hour: number) => {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? "AM" : "PM";
    return `${h} ${ampm}`;
  };

  const formatHourMinute = (hour: number, minute: number) => {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? "AM" : "PM";
    return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  // Generate ticks & labels
  const generateTicks = () => {
    const ticks = [];
    if (horizon === "days") {
      for (let h = 0; h < 24; h++) {
        const offset = (h / 24) * containerHeight;
        const label = formatHour(h);
        ticks.push(
          <div
            key={h}
            className="absolute left-0 w-full flex items-center"
            style={{ top: `${offset}px` }}
          >
            <div className="w-2 h-[1px] bg-gray-400 ml-[-6px]"></div>
            <span className="text-xs text-gray-500 ml-1 w-10">{label}</span>
          </div>,
        );
      }
    } else if (horizon === "minutes") {
      const interval = 30; // 30-min ticks
      for (let m = 0; m < 24 * 60; m += interval) {
        const offset = (m / (24 * 60)) * containerHeight;
        const hours = Math.floor(m / 60);
        const minutes = m % 60;
        const label = formatHourMinute(hours, minutes);
        ticks.push(
          <div
            key={m}
            className="absolute left-0 w-full flex items-center"
            style={{ top: `${offset}px` }}
          >
            <div className="w-2 h-[1px] bg-gray-400 ml-[-6px]"></div>
            <span className="text-xs text-gray-500 ml-1 w-14">{label}</span>
          </div>,
        );
      }
    }
    return ticks;
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto h-[600px] border-l-2 border-gray-200 ml-12 bg-gray-50"
    >
      {/* Timeline ticks */}
      <div className="absolute top-0 left-0 w-full h-[1200px]">
        {generateTicks()}
      </div>
    </div>
  );
};

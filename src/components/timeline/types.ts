import type { ReactNode } from "react";

export interface DailyTimeSlot {
  date: Date;
  hours24: number;
  minutes: number;
  isHour: boolean;
  label: string;
  isNow: boolean;
  events: TimelineEvent[];
}

export interface WeeklyTimeSlot {
  date: Date;
  label: string;
  isNow: boolean;
  events: TimelineEvent[];
}

export interface TimelineEvent {
  start: Date;
  renderPreview: () => ReactNode;
}

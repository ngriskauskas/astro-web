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

export interface TimelineEvent {
  start: Date;
  end?: Date;
  renderPreview: () => ReactNode;
  renderDetail: () => ReactNode;
}

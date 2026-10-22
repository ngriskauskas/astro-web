import type { PlanetaryHour, PlanetaryHoursType } from "../types/planetaryHours";

export interface CurrentPlanetaryHour {
  hour: PlanetaryHour;
  end: Date;
  next?: PlanetaryHour;
}

export interface PlanetaryHourBlock {
  hour: PlanetaryHour;
  // The hour's own start and end.
  start: number;
  end: number;
  // The part of it inside the displayed day.
  top: number;
  bottom: number;
}

const startOf = (hour: PlanetaryHour) => new Date(hour.dateTime).getTime();

// Each hour ends where the next begins; the last one ends at the next sunrise.
const endOf = ({ hours, dayEnd }: PlanetaryHoursType, index: number) =>
  index + 1 < hours.length ? startOf(hours[index + 1]) : new Date(dayEnd).getTime();

export const currentPlanetaryHour = (
  data: PlanetaryHoursType,
  now: Date,
): CurrentPlanetaryHour | undefined => {
  const time = now.getTime();
  // The hours are in order, so the current one is the last that has started.
  const index = data.hours.filter((hour) => startOf(hour) <= time).length - 1;
  if (index === -1 || time >= endOf(data, index)) return undefined;

  return {
    hour: data.hours[index],
    end: new Date(endOf(data, index)),
    next: data.hours[index + 1],
  };
};

export const planetaryHourBlocks = (
  data: PlanetaryHoursType,
  dayStart: number,
  dayEnd: number,
): PlanetaryHourBlock[] =>
  data.hours
    .map((hour, index) => {
      const start = startOf(hour);
      const end = endOf(data, index);
      return {
        hour,
        start,
        end,
        top: Math.max(start, dayStart),
        bottom: Math.min(end, dayEnd),
      };
    })
    .filter((block) => block.bottom > block.top);

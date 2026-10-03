import { AspectData, type AspectDisplay, type AspectDisplayPoint } from "../types/aspect";
import { AngleData } from "../types/cusp";
import { PlanetsData } from "../types/planet";

export const pointName = (point: AspectDisplayPoint) =>
  point.type === "Planet"
    ? PlanetsData[point.value.name].displayName
    : AngleData[point.value.name].name;

// "Sun Trine Moon"
export const aspectName = (aspect: AspectDisplay) =>
  `${pointName(aspect.point1)} ${AspectData[aspect.type].name} ${pointName(aspect.point2)}`;

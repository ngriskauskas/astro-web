import { useContext } from "react";
import {
  SingleWheelContext,
  type SingleWheelContextType,
} from "../contexts/SingleWheelContext";
import {
  MultiWheelContext,
  type MultiWheelContextType,
} from "../contexts/MultiWheelContext";

export const useWheel = () => {
  const single = useContext(SingleWheelContext);
  const multi = useContext(MultiWheelContext);

  if (!single && !multi) {
    throw new Error(
      "useWheel must be used inside a SingleWheelProvider or MultiWheel provider",
    );
  }

  return (single ?? multi)!;
};

export const isMulti = (
  ctx: SingleWheelContextType | MultiWheelContextType,
): ctx is MultiWheelContextType => {
  return "mainPlanetAngles" in ctx;
};

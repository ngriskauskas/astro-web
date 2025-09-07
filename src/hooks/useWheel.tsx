import { useContext } from "react";
import { SingleWheelContext } from "../contexts/SingleWheelContext";
import { MultiWheelContext } from "../contexts/MultiWheelContext";

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

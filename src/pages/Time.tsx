import { TimeWheelContainer } from "../components/wheel/TimeWheelContainer";

export const Time = () => {
  return (
    <div className="flex items-center justify-center mt-5">
      <div className="w-[90%] max-w-5xl">
        <TimeWheelContainer />
      </div>
    </div>
  );
};

import { TimeWheelContainer } from "../components/wheel/TimeWheelContainer";

export const Time = () => {
  return (
    <div className="flex items-center justify-center mt-10 bg-gray-100">
      <div className="w-11/12">
        <TimeWheelContainer />
      </div>
    </div>
  );
};

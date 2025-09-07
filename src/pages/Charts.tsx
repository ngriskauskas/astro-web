import { ZodiacWheel } from "../components/wheel/ZodiacWheel";
import { SingleWheelProvider } from "../contexts/SingleWheelContext";

export const Charts = () => {
  return (
    <SingleWheelProvider type="natal">
      <div className="flex items-center justify-center mt-5">
        <div className="w-[90%] max-w-5xl">
          <ZodiacWheel />
        </div>
      </div>
    </SingleWheelProvider>
  );
};

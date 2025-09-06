import { createContext, useContext, type ReactNode } from "react";

interface WheelContextType {}

export const WheelContext = createContext<WheelContextType | undefined>(
  undefined,
);

export const WheelProvider = ({ children }: { children: ReactNode }) => {
  return <WheelContext.Provider value={{}}>{children}</WheelContext.Provider>;
};

export const useWheel = () => {
  const context = useContext(WheelContext);
  if (!context) {
    throw new Error("useWheel must be used inside WheelProvider");
  }
  return context;
};

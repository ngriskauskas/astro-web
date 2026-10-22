import { useContext, type ReactNode } from "react";
import { DescriptionSidePanel } from "../descriptions/DescriptionSidePanel";
import { DescProvider } from "../../contexts/DescContext";
import { MultiWheelContext, MultiWheelProvider } from "../../contexts/MultiWheelContext";
import { PlanetaryHoursProvider } from "../../contexts/PlanetaryHoursContext";
import { SingleWheelContext, SingleWheelProvider } from "../../contexts/SingleWheelContext";
import { PlanetaryHoursContext } from "../../hooks/usePlanetaryHours";

export type ChartKind = "natal" | "time" | "moment" | "transit" | "synastry";

const MULTI_KINDS: readonly ChartKind[] = ["transit", "synastry"];

const HoursScope = ({ children }: { children: ReactNode }) =>
  useContext(PlanetaryHoursContext) ? (
    <>{children}</>
  ) : (
    <PlanetaryHoursProvider>{children}</PlanetaryHoursProvider>
  );

const Provide = ({ kind, children }: { kind: ChartKind; children: ReactNode }) => {
  const body = (
    <DescProvider>
      {children}
      <DescriptionSidePanel />
    </DescProvider>
  );
  return MULTI_KINDS.includes(kind) ? (
    <MultiWheelProvider type={kind as "transit" | "synastry"}>{body}</MultiWheelProvider>
  ) : (
    <SingleWheelProvider type={kind as "natal" | "time" | "moment"}>{body}</SingleWheelProvider>
  );
};

// What a widget reads its chart, description drawer and planetary hours from. A widget uses
// the scope it is placed in when that scope holds a chart it can show, and otherwise sets up
// its own. That is what lets any widget be placed on any page: the page chooses the shared
// scope, and a widget that needs something else brings it (with its own drawer, so what the
// drawer describes always matches what the widget shows).
export const ChartScope = ({
  accepts,
  fallback = accepts[0],
  children,
}: {
  accepts: readonly ChartKind[];
  fallback?: ChartKind;
  children: ReactNode;
}) => {
  const single = useContext(SingleWheelContext);
  const multi = useContext(MultiWheelContext);
  const current = single ?? multi;

  return (
    <HoursScope>
      {current && accepts.includes(current.type) ? (
        <>{children}</>
      ) : (
        <Provide kind={fallback}>{children}</Provide>
      )}
    </HoursScope>
  );
};

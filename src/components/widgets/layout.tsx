import type { ReactNode } from "react";
import { ChartScope, type ChartKind } from "./scopes";

// A page is a container: it chooses which chart its widgets share, and where they sit.
// The scope also supplies the description drawer and planetary hours, so the page never
// wires up providers itself.
export const WidgetPage = ({
  chart,
  children,
}: {
  chart: ChartKind;
  children: ReactNode;
}) => (
  <ChartScope accepts={[chart]}>
    <main className="mx-auto flex max-w-[1800px] flex-col gap-6 px-3 pb-10 pt-4 sm:px-6 sm:pt-6">
      {children}
    </main>
  </ChartScope>
);

// Two columns on wide screens (about 7:5), with an optional row across both. Each column
// stands alone, so a widget is never stretched to the height of the one beside it. Below
// that the wrappers dissolve (display: contents), so the widgets stack in one column and
// each widget's own `order-*` class sets the reading order.
export const WidgetSplit = ({
  main,
  side,
  bottom,
}: {
  main: ReactNode;
  side: ReactNode;
  bottom?: ReactNode;
}) => (
  <div className="flex flex-col gap-6 xl:grid xl:grid-cols-12 xl:items-start">
    <div className="contents xl:col-span-7 xl:flex xl:min-w-0 xl:flex-col xl:gap-6">{main}</div>
    <div className="contents xl:col-span-5 xl:flex xl:min-w-0 xl:flex-col xl:gap-6">{side}</div>
    {bottom}
  </div>
);

// Widgets side by side in equal columns on wide screens, stacked below that.
export const WidgetRow = ({
  columns = 2,
  children,
}: {
  columns?: 2 | 3;
  children: ReactNode;
}) => (
  <div
    className={`grid gap-6 xl:items-start ${columns === 3 ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}
  >
    {children}
  </div>
);

import {
  AspectMatrixWidget,
  ChartSettingsWidget,
  PlacementsWidget,
  WidgetPage,
  WidgetSplit,
  ZodiacWheelWidget,
} from "../components/widgets";

export const Charts = () => (
  <WidgetPage chart="natal">
    <WidgetSplit
      main={
        <>
          <ZodiacWheelWidget title="Natal Chart" headingLevel={1} className="order-1" />
          <AspectMatrixWidget className="order-3" />
        </>
      }
      side={
        <>
          <ChartSettingsWidget className="order-2" />
          <PlacementsWidget className="order-4" />
        </>
      }
    />
  </WidgetPage>
);

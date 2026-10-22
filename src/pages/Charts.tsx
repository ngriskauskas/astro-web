import {
  AspectMatrixWidget,
  ChartRulerWidget,
  ChartSettingsWidget,
  DignitiesWidget,
  HemispheresWidget,
  HousesWidget,
  ChartSummaryWidget,
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
          <HousesWidget className="order-5" />
          <HemispheresWidget className="order-6" />
        </>
      }
      side={
        <>
          <ChartSettingsWidget className="order-2" />
          <ChartSummaryWidget className="order-2" />
          <ChartRulerWidget className="order-3" />
          <DignitiesWidget className="order-4" />
          <PlacementsWidget className="order-5" />
        </>
      }
    />
  </WidgetPage>
);

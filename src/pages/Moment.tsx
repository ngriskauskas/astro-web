import {
  AspectMatrixWidget,
  AspectPatternsWidget,
  ChartRulerWidget,
  ChartSettingsWidget,
  ChartSummaryWidget,
  DignitiesWidget,
  HemispheresWidget,
  PlacementsWidget,
  WidgetPage,
  WidgetSplit,
  ZodiacWheelWidget,
} from "../components/widgets";

export const Moment = () => (
  <WidgetPage chart="moment">
    <WidgetSplit
      main={
        <>
          <ZodiacWheelWidget title="Moment Chart" headingLevel={1} className="order-1" />
          <AspectMatrixWidget className="order-3" />
          <HemispheresWidget className="order-5" />
        </>
      }
      side={
        <>
          <ChartSettingsWidget className="order-2" />
          <ChartSummaryWidget className="order-2" />
          <ChartRulerWidget className="order-3" />
          <DignitiesWidget className="order-4" />
          <PlacementsWidget className="order-5" />
          <AspectPatternsWidget className="order-6" />
        </>
      }
    />
  </WidgetPage>
);

import {
  AscendantTodayWidget,
  ChartSettingsWidget,
  TwoChartMatrixWidget,
  TwoChartPlacementsWidget,
  TwoChartWheelWidget,
  WeeklyTimingsWidget,
  WidgetPage,
  WidgetSplit,
} from "../components/widgets";

export const Transits = () => (
  <WidgetPage chart="transit">
    <WidgetSplit
      main={
        <>
          <TwoChartWheelWidget title="Transit Chart" headingLevel={1} className="order-1" />
          <TwoChartMatrixWidget className="order-3" />
        </>
      }
      side={
        <>
          <ChartSettingsWidget className="order-2" />
          <AscendantTodayWidget className="order-2" />
          <WeeklyTimingsWidget className="order-2" />
          <TwoChartPlacementsWidget className="order-4" />
        </>
      }
    />
  </WidgetPage>
);

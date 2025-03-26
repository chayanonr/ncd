import * as React from "react";
import { memo, useLayoutEffect, useRef, useEffect, useState } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

type ChartType = "column" | "line" | "bar";

interface ChartData {
  category: string;
  value?: number;
  total?: number;
  [key: string]: string | number | undefined;
}

interface SeriesField {
  field: string;
  name: string;
  color?: string;
}

interface AmUniversalChartProps {
  chartType: ChartType;
  data: ChartData[];
  width?: string;
  height?: string;
  chartTitle?: string;
  legendEnabled?: boolean;
  tooltipEnabled?: boolean;
  colors?: string[];
  labelText?: string;
  onBarClick?: (category: string, value: number, seriesName?: string) => void;
  seriesFields?: SeriesField[];
  showValueLabels?: boolean;
  showLineBullets?: boolean;
}

// A local interface describing the bullet pointerdown event
// so that we can access ev.target.dataItem properly
interface MyLineBulletPointerEvent {
  target: {
    dataItem?: am5.DataItem<am5xy.ILineSeriesDataItem>;
  };
}

declare module "@amcharts/amcharts5/xy" {
  interface XYCursor {
    snapToSeries: am5xy.XYSeries[];
  }
}

const AmUniversalChart = memo(
  ({
    chartType,
    data,
    width = "100%",
    height = "100%",
    chartTitle,
    legendEnabled = false,
    tooltipEnabled = true,
    colors,
    labelText = "{valueY}",
    onBarClick,
    seriesFields,
    showValueLabels = true,
    showLineBullets = false,
  }: AmUniversalChartProps) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<am5.Root | null>(null);
    const chartRefInternal = useRef<am5xy.XYChart | null>(null);
    const seriesRef = useRef<am5xy.XYSeries[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    const initializeChart = () => {
      if (!chartRef.current) return;

      // Dispose old root if any
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
        chartRefInternal.current = null;
        seriesRef.current = [];
      }

      // Create new root
      const root = am5.Root.new(chartRef.current);
      root.setThemes([am5themes_Animated.new(root)]);
      if (root._logo) {
        root._logo.dispose();
      }
      rootRef.current = root;

      // Create XYChart
      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          layout: root.verticalLayout,
          paddingRight: 20,
        })
      );
      chartRefInternal.current = chart;

      // Create cursor
      const cursor = chart.set(
        "cursor",
        am5xy.XYCursor.new(root, {
          behavior: "none",
        })
      );
      cursor.lineY.set("visible", false);

      // Optional legend
      if (legendEnabled) {
        chart.children.push(am5.Legend.new(root, {}));
      }

      // ==========================
      //       COLUMN CHART
      // ==========================
      if (chartType === "column") {
        const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 50 });
        xRenderer.grid.template.set("visible", false);
        xRenderer.labels.template.setAll({
          fill: am5.color("#667797"),
          fontFamily: "Roboto",
          fontSize: 14,
          oversizedBehavior: "wrap",
          maxWidth: 92,
        });

        const xAxis = chart.xAxes.push(
          am5xy.CategoryAxis.new(root, {
            categoryField: "category",
            renderer: xRenderer,
          })
        );

        const yRenderer = am5xy.AxisRendererY.new(root, {});
        yRenderer.grid.template.setAll({
          strokeDasharray: [4, 4],
        });
        yRenderer.labels.template.setAll({
          fill: am5.color("#667797"),
          fontFamily: "Roboto",
          fontSize: 14,
        });

        const yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            renderer: yRenderer,
          })
        );

        if (seriesFields && seriesFields.length > 0) {
          // multiple column series
          seriesRef.current = seriesFields.map((sf) => {
            const columnSeries = chart.series.push(
              am5xy.ColumnSeries.new(root, {
                name: sf.name,
                xAxis,
                yAxis,
                valueYField: sf.field,
                categoryXField: "category",
                tooltip: tooltipEnabled
                  ? am5.Tooltip.new(root, { labelText: `${sf.name}: {valueY}` })
                  : undefined,
              })
            );

            const seriesColor = sf.color || "#27CFA7";
            columnSeries.set("fill", am5.color(seriesColor));
            columnSeries.set("stroke", am5.color(seriesColor));

            columnSeries.columns.template.setAll({
              interactive: true,
              cursorOverStyle: "pointer",
              width: am5.percent(40), // for side-by-side columns
            });

            columnSeries.columns.template.events.on("click", (ev) => {
              const target = ev.target;
              if (target && typeof target.dataItem === "object") {
                const dataItem = target.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>;
                const category = dataItem.get("categoryX") as string;
                const value = dataItem.get("valueY") as number;
                onBarClick?.(category, value, sf.name);
              }
            });

            if (showValueLabels) {
              columnSeries.bullets.push(() =>
                am5.Bullet.new(root, {
                  locationY: 1,
                  sprite: am5.Label.new(root, {
                    text: "{valueY}",
                    centerX: am5.p50,
                    centerY: am5.p100,
                    dy: 10,
                    populateText: true,
                    fill: am5.color(seriesColor),
                  }),
                })
              );
            }

            return columnSeries;
          });

          cursor.snapToSeries = seriesRef.current;
        } else {
          // single column series fallback
          const columnSeries = am5xy.ColumnSeries.new(root, {
            name: "ColumnSeries",
            xAxis,
            yAxis,
            valueYField: "value",
            categoryXField: "category",
            tooltip: tooltipEnabled ? am5.Tooltip.new(root, { labelText }) : undefined,
          });
          seriesRef.current = [chart.series.push(columnSeries)];
          cursor.snapToSeries = [columnSeries];

          columnSeries.columns.template.setAll({
            interactive: true,
            cursorOverStyle: "pointer",
          });

          columnSeries.columns.template.events.on("click", (ev) => {
            const target = ev.target;
            if (target && typeof target.dataItem === "object") {
              const dataItem = target.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>;
              const category = dataItem.get("categoryX") as string;
              const value = dataItem.get("valueY") as number;
              onBarClick?.(category, value);
            }
          });

          if (showValueLabels) {
            columnSeries.bullets.push(() =>
              am5.Bullet.new(root, {
                locationY: 1,
                sprite: am5.Label.new(root, {
                  text: "{valueY}",
                  centerX: am5.p50,
                  centerY: am5.p100,
                  dy: 10,
                  populateText: true,
                  fill: am5.color("#27CFA7"),
                }),
              })
            );
          }

          if (colors && colors.length > 0) {
            const colorSet = am5.ColorSet.new(root, {
              colors: colors.map((c) => am5.color(c)),
            });
            columnSeries.set("fill", colorSet.getIndex(0));
            columnSeries.set("stroke", colorSet.getIndex(0));
          }
        }
      } 
      // ==========================
      //       LINE CHART
      // ==========================
      else if (chartType === "line") {
        const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
        xRenderer.grid.template.set("visible", false);
        xRenderer.labels.template.setAll({
          fill: am5.color("#667797"),
          fontFamily: "Roboto",
          fontSize: 14,
        });

        const xAxis = chart.xAxes.push(
          am5xy.CategoryAxis.new(root, {
            categoryField: "category",
            renderer: xRenderer,
          })
        );

        const yRenderer = am5xy.AxisRendererY.new(root, {});
        yRenderer.grid.template.setAll({
          strokeDasharray: [4, 4],
        });
        yRenderer.labels.template.setAll({
          fill: am5.color("#667797"),
          fontFamily: "Roboto",
          fontSize: 14,
        });

        const yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            renderer: yRenderer,
          })
        );

        if (seriesFields && seriesFields.length > 0) {
          // multiple line series
          seriesRef.current = seriesFields.map((sf) => {
            const currentSeries = chart.series.push(
              am5xy.SmoothedXLineSeries.new(root, {
                name: sf.name,
                xAxis,
                yAxis,
                valueYField: sf.field,
                categoryXField: "category",
                tooltip: tooltipEnabled
                  ? am5.Tooltip.new(root, {
                      labelText: `ปี ${sf.name}: {valueY} คน`,
                    })
                  : undefined,
                stroke: am5.color(sf.color || "#27CFA7"),
                fill: am5.color(sf.color || "#27CFA7"),
                tension: 0,
              })
            );

            cursor.snapToSeries?.push(currentSeries);

            if (showLineBullets) {
              currentSeries.bullets.push(() => {
                const bullet = am5.Bullet.new(root, {
                  locationY: 1,
                  sprite: am5.Circle.new(root, {
                    radius: 5,
                    fill: am5.color(sf.color || "#27CFA7"),
                    stroke: am5.color("#fff"),
                    strokeWidth: 2,
                    interactive: true,
                    cursorOverStyle: "pointer",
                  }),
                });

                // Avoid 'any' by double-casting to a typed function signature
                const bulletOn = (bullet.events.on as unknown) as (
                  type: string,
                  cb: (ev: MyLineBulletPointerEvent) => void
                ) => void;

                bulletOn("pointerdown", (ev: MyLineBulletPointerEvent) => {
                  const dataItem = ev.target.dataItem;
                  if (dataItem) {
                    const category = dataItem.get("categoryX") as string;
                    const value = dataItem.get("valueY") as number;
                    const seriesName = currentSeries.get("name");
                    onBarClick?.(category, value, seriesName);
                  }
                });

                return bullet;
              });
            }
            return currentSeries;
          });
        } else {
          // single line series fallback
          const lineSeries = chart.series.push(
            am5xy.SmoothedXLineSeries.new(root, {
              name: "LineSeries",
              xAxis,
              yAxis,
              valueYField: "value",
              categoryXField: "category",
              tooltip: tooltipEnabled
                ? am5.Tooltip.new(root, { labelText })
                : undefined,
              tension: 0,
              stroke: colors?.[0] ? am5.color(colors[0]) : am5.color("#27CFA7"),
              fill: colors?.[0] ? am5.color(colors[0]) : am5.color("#27CFA7"),
            })
          );

          cursor.snapToSeries = [lineSeries];

          if (showLineBullets) {
            lineSeries.bullets.push(() => {
              const bullet = am5.Bullet.new(root, {
                locationY: 1,
                sprite: am5.Circle.new(root, {
                  radius: 5,
                  fill: am5.color("#fff"),
                  stroke: lineSeries.get("stroke"),
                  strokeWidth: 2,
                  interactive: true,
                  cursorOverStyle: "pointer",
                }),
              });

              const bulletOn = (bullet.events.on as unknown) as (
                type: string,
                cb: (ev: MyLineBulletPointerEvent) => void
              ) => void;

              bulletOn("pointerdown", (ev: MyLineBulletPointerEvent) => {
                const dataItem = ev.target.dataItem;
                if (dataItem) {
                  const category = dataItem.get("categoryX") as string;
                  const value = dataItem.get("valueY") as number;
                  const seriesName = lineSeries.get("name");
                  onBarClick?.(category, value, seriesName);
                }
              });

              return bullet;
            });
          }
        }
      } 
      // ==========================
      //        BAR CHART
      // ==========================
      else if (chartType === "bar") {
        const xRenderer = am5xy.AxisRendererX.new(root, {});
        xRenderer.grid.template.set("visible", false);
        xRenderer.labels.template.setAll({
          fill: am5.color("#667797"),
          fontFamily: "Roboto",
          fontSize: 14,
          oversizedBehavior: "wrap",
        });

        const xAxis = chart.xAxes.push(
          am5xy.ValueAxis.new(root, {
            renderer: xRenderer,
            min: 0,
            strictMinMax: false,
          })
        );

        const yRenderer = am5xy.AxisRendererY.new(root, { inversed: true });
        yRenderer.grid.template.setAll({
          strokeDasharray: [4, 4],
        });
        yRenderer.labels.template.setAll({
          fill: am5.color("#667797"),
          fontFamily: "Roboto",
          fontSize: 14,
        });

        const yAxis = chart.yAxes.push(
          am5xy.CategoryAxis.new(root, {
            categoryField: "category",
            renderer: yRenderer,
          })
        );

        const barSeries = am5xy.ColumnSeries.new(root, {
          name: "BarSeries",
          xAxis,
          yAxis,
          valueXField: "value",
          categoryYField: "category",
          tooltip: tooltipEnabled
            ? am5.Tooltip.new(root, { labelText: "{valueX}" })
            : undefined,
        });

        seriesRef.current = [chart.series.push(barSeries)];
        cursor.snapToSeries = [barSeries];

        barSeries.columns.template.setAll({
          interactive: true,
          cursorOverStyle: "pointer",
          width: am5.percent(60),
          minWidth: 10,
        });

        barSeries.columns.template.events.on("click", (ev) => {
          const dataItem = ev.target.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem> | undefined;
          if (dataItem) {
            const category = dataItem.get("categoryY") as string;
            const value = dataItem.get("valueX") as number;
            onBarClick?.(category, value);
          }
        });

        if (showValueLabels) {
          barSeries.bullets.push(() => {
            const label = am5.Label.new(root, {
              text: "{valueX}",
              centerX: am5.p0,
              centerY: am5.p50,
              dx: 15,
              populateText: true,
              fill: am5.color("#27CFA7"),
            });

            label.adapters.add("visible", (visible, target: am5.Label) => {
              const dataItem = target.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem> | undefined;
              return (dataItem?.get("valueX") ?? 0) > 0;
            });

            return am5.Bullet.new(root, {
              locationX: 1,
              sprite: label,
            });
          });
        }

        if (colors && colors.length > 0) {
          const colorSet = am5.ColorSet.new(root, {
            colors: colors.map((c) => am5.color(c)),
          });
          barSeries.set("fill", colorSet.getIndex(0));
          barSeries.set("stroke", colorSet.getIndex(0));
        }
      }

      // Optional chart title
      if (chartTitle) {
        chart.children.unshift(
          am5.Label.new(root, {
            text: chartTitle,
            x: am5.percent(50),
            centerX: am5.percent(50),
            y: 0,
            fontSize: 20,
            fontWeight: "bold",
          })
        );
      }

      chart.appear(1000, 100);

      // Set data
      if (data && data.length > 0) {
        seriesRef.current.forEach((s) => {
          s.data.setAll(data);
        });

        const xAxisInstance = chart.xAxes.getIndex(0);
        if (xAxisInstance && xAxisInstance instanceof am5xy.CategoryAxis) {
          xAxisInstance.data.setAll(data);
        }

        const yAxisInstance = chart.yAxes.getIndex(0);
        if (yAxisInstance && yAxisInstance instanceof am5xy.CategoryAxis) {
          yAxisInstance.data.setAll(data);
        }

        if (chartType === "bar") {
          const maybeXAxis = chart.xAxes.getIndex(0) as am5xy.ValueAxis<am5xy.AxisRenderer>;
          if (maybeXAxis) {
            const maxValue = Math.max(...data.map((d) => d.value ?? 0)) * 1.2 || 5;
            maybeXAxis.set("max", maxValue);
          }
        }
      }
    };

    useLayoutEffect(() => {
      if (!isMounted) return;
      initializeChart();

      return () => {
        if (rootRef.current) {
          rootRef.current.dispose();
          rootRef.current = null;
          chartRefInternal.current = null;
          seriesRef.current = [];
        }
      };
    }, [
      isMounted,
      chartType,
      chartTitle,
      legendEnabled,
      tooltipEnabled,
      colors,
      labelText,
      onBarClick,
      seriesFields,
      showValueLabels,
      showLineBullets,
    ]);

    useLayoutEffect(() => {
      if (!chartRefInternal.current || !seriesRef.current.length || !data || data.length === 0) {
        return;
      }

      const chart = chartRefInternal.current;
      const series = seriesRef.current;

      series.forEach((s) => {
        s.data.setAll(data);
      });

      const xAxisInstance = chart.xAxes.getIndex(0);
      if (xAxisInstance && xAxisInstance instanceof am5xy.CategoryAxis) {
        xAxisInstance.data.setAll(data);
      }

      const yAxisInstance = chart.yAxes.getIndex(0);
      if (yAxisInstance && yAxisInstance instanceof am5xy.CategoryAxis) {
        yAxisInstance.data.setAll(data);
      }

      if (chartType === "bar") {
        const maybeXAxis = chart.xAxes.getIndex(0) as am5xy.ValueAxis<am5xy.AxisRenderer>;
        if (maybeXAxis) {
          const maxValue = Math.max(...data.map((d) => d.value ?? 0)) * 1.2 || 5;
          maybeXAxis.set("max", maxValue);
        }
      }
    }, [data, chartType]);

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible" && rootRef.current) {
          rootRef.current.resize();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      const observer = new MutationObserver(() => {
        if (chartRef.current && !chartRef.current.contains(rootRef.current?.dom ?? null)) {
          initializeChart();
        }
      });

      if (chartRef.current) {
        observer.observe(chartRef.current as Node, { childList: true, subtree: true });
      }

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        observer.disconnect();
      };
    }, []);

    if (!isMounted) {
      return <div style={{ width, height }} />;
    }

    return <div ref={chartRef} style={{ width, height }} />;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.chartType === nextProps.chartType &&
      prevProps.data === nextProps.data &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.chartTitle === nextProps.chartTitle &&
      prevProps.legendEnabled === nextProps.legendEnabled &&
      prevProps.tooltipEnabled === nextProps.tooltipEnabled &&
      prevProps.colors === nextProps.colors &&
      prevProps.labelText === nextProps.labelText &&
      prevProps.onBarClick === nextProps.onBarClick &&
      prevProps.seriesFields === nextProps.seriesFields &&
      prevProps.showValueLabels === nextProps.showValueLabels &&
      prevProps.showLineBullets === nextProps.showLineBullets
    );
  }
);

AmUniversalChart.displayName = "AmUniversalChart";
export default AmUniversalChart;

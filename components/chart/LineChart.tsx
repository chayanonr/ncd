"use client";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

type DataType = {
  category: string;
  value: number;
};

type DiseaseData = {
  _id: { year: number; month?: number; day?: number };
  count_all: number;
  count_high_bp: number;
  count_high_bs: number;
  count_is_dp: number;
  percentage_high_bp: number;
  percentage_high_bs: number;
  percentage_is_dp: number;
};

type HealthData = {
  _id: { year: number; month?: number; day?: number };
  count_all: number;
  count_bmi: number;
  count_bp: number;
  count_bs: number;
  percentage_is_bmi: number;
  percentage_is_bp: number;
  percentage_is_bs: number;
};

type Props = {
  data: DiseaseData[] | HealthData[] | null;
  chartType: "disease" | "health";
  timePeriod: "Yearly" | "Monthly" | "Daily";
};

const SmoothLineChart = ({ data, chartType, timePeriod }: Props) => {
  const refChart = useRef<HTMLDivElement>(null);

  const thaiMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];

  useEffect(() => {
    if (!refChart.current) return;

    const root = am5.Root.new(refChart.current);
    if (root?._logo) root._logo.dispose();

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 0,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 20 }),
        categoryField: "category",
      })
    );
    xAxis.get("renderer").grid.template.set("visible", false);
    const labelTemplateX = xAxis.get("renderer").labels.template;
    labelTemplateX.set("fontSize", 12);
    labelTemplateX.set("fontFamily", '"Noto Sans Thai", sans-serif');
    labelTemplateX.set("fill", am5.color(0x667797));

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { minGridDistance: 20, pan: "zoom" }),
      })
    );
    yAxis.get("renderer").grid.template.set("strokeDasharray", [4, 4]);
    yAxis.set("min", 0);
    yAxis.set("max", 100);
    yAxis.set("strictMinMax", true);
    const labelTemplate = yAxis.get("renderer").labels.template;
    labelTemplate.adapters.add("text", (text) => text + "%");
    labelTemplate.set("fontSize", 12);
    labelTemplate.set("fontFamily", '"Noto Sans Thai", sans-serif');
    labelTemplate.set("fill", am5.color(0x667797));
    labelTemplate.set("paddingRight", 20);

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
    cursor.lineY.set("visible", false);

    const createSeries = (name: string, color: string, data: DataType[], hideLine: boolean = false) => {
      const series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueYField: "value",
          categoryXField: "category",
          sequencedInterpolation: true,
          stroke: am5.color(color),
          fill: am5.color(color),
          tension: 0,
          tooltip: am5.Tooltip.new(root, {
            labelHTML: '<div>{categoryX} : {valueY}%</div>',
          }),
        })
      );
      if (hideLine) {
        series.strokes.template.set("visible", false); // Hide the line for "no data" series
        series.fills.template.set("visible", false); // Hide any fill
      }
      series.data.setAll(data);
      series.appear(1000);
    };

    const diseaseSeries = [
      { name: "โรคความดันโลหิตสูง", color: "#1E4D91", key: "percentage_high_bp" },
      { name: "โรคเบาหวาน", color: "#FFC300", key: "percentage_high_bs" },
      { name: "โรคซึมเศร้า", color: "#6A0572", key: "percentage_is_dp" },
    ];

    const healthSeries = [
      { name: "BMI", color: "#388E3C", key: "percentage_is_bmi" },
      { name: "ความดันโลหิต", color: "#00C9D6", key: "percentage_is_bp" },
      { name: "ระดับน้ำตาลในเลือด", color: "#E65100", key: "percentage_is_bs" },
    ];

    const seriesConfig = chartType === "disease" ? diseaseSeries : healthSeries;

    // Handle null or empty data
    if (!data || data.length === 0) {
      const fallbackData = [{ category: "ไม่มีข้อมูล", value: 0 }];
      createSeries("ไม่มีข้อมูล", "#E63946", fallbackData, true); // Hide the line for "no data"
      xAxis.data.setAll(fallbackData);

      // Add a centered "ไม่มีข้อมูล" label on the chart
      chart.plotContainer.children.push(
        am5.Label.new(root, {
          text: "ไม่มีข้อมูล",
          fontSize: 20,
          fontFamily: '"Noto Sans Thai", sans-serif',
          fill: am5.color(0xE63946),
          centerX: am5.percent(50),
          centerY: am5.percent(50),
          textAlign: "center",
        })
      );

      // Hide the yAxis labels to make the "no data" message more prominent
      yAxis.get("renderer").labels.template.set("visible", false);
    } else {
      const chartData: { [key: string]: DataType[] } = {};
      seriesConfig.forEach((series) => {
        chartData[series.key] = data.map((item) => {
          const year = item._id.year;
          const month = item._id.month;
          const day = item._id.day;
          let category: string;

          if (timePeriod === "Yearly") {
            category = `${year}`;
          } else if (timePeriod === "Monthly") {
            category = month !== undefined ? thaiMonths[month - 1] : `${year}`;
          } else if (timePeriod === "Daily") {
            category =
              day !== undefined && month !== undefined
                ? `${day} ${thaiMonths[month - 1]} ${year}`
                : month !== undefined
                ? `${thaiMonths[month - 1]} ${year}`
                : `${year}`;
          } else {
            category = `${year}`;
          }

          return {
            category,
            value: item[series.key as keyof typeof item] as number,
          };
        });
      });

      seriesConfig.forEach((series) => {
        createSeries(series.name, series.color, chartData[series.key]);
      });

      const categories = data.map((item) => {
        const year = item._id.year;
        const month = item._id.month;
        const day = item._id.day;

        if (timePeriod === "Yearly") {
          return `${year}`;
        } else if (timePeriod === "Monthly") {
          return month !== undefined ? thaiMonths[month - 1] : `${year}`;
        } else if (timePeriod === "Daily") {
          return day !== undefined && month !== undefined
            ? `${day} ${thaiMonths[month - 1]} ${year}`
            : month !== undefined
            ? `${thaiMonths[month - 1]} ${year}`
            : `${year}`;
        }
        return `${year}`;
      });
      xAxis.data.setAll(categories.map((category) => ({ category })));
    }

    return () => {
      root.dispose();
    };
  }, [data, chartType, timePeriod]);

  return <Box ref={refChart} style={{ width: "100%", height: "100%" }} />;
};

export default SmoothLineChart;
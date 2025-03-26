// next libraries
import { useEffect, useRef } from "react";

// libraries
import Grid from "@mui/material/Grid2";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { FeatureCollection, Feature } from "geojson";
import { Box, Button } from "@mui/material";

// data object array
import provinceGeoJSON from "@/data/json/provinces.json";
import districtsGeoJSON from "@/data/json/districts.json";
import subdistrictsGeoJSON from "@/data/json/subdistricts.json";

// styles
import styles from "@/styles/common/map-thai.module.css";

// Types
type GeoMapItem = {
  _id: number | string; // Can be province, district, or subdistrict code
  count_all: number;
  count_selected: number;
  percentage: number;
};

type MapData = {
  province: { name: string; value: number }[];
  district: { province: string; name: string; value: number }[];
  subdistrict: { province: string; district: string; name: string; value: number }[];
};

type PropsComponents = {
  section?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  team?: number;
  data: {
    province: GeoMapItem[];
    district: GeoMapItem[];
    subdistrict: GeoMapItem[];
  };
};

// Mapping utilities with null checking
const provinceGeoJSONData = provinceGeoJSON as FeatureCollection;
const districtGeoJSONData = districtsGeoJSON as FeatureCollection;
const subdistrictGeoJSONData = subdistrictsGeoJSON as FeatureCollection;

const provinceCodeToName = Object.fromEntries(
  provinceGeoJSONData.features
    .filter((f): f is Feature => f.properties !== null && f.properties !== undefined)
    .map((f) => [
      f.properties!.pro_code ?? "",
      f.properties!.pro_th ?? `Unknown Province`,
    ])
);

const districtCodeToName = Object.fromEntries(
  districtGeoJSONData.features
    .filter((f): f is Feature => f.properties !== null && f.properties !== undefined)
    .map((f) => [
      f.properties!.amp_code ?? "",
      {
        name: f.properties!.amp_th ?? `Unknown District`,
        province: f.properties!.pro_th ?? `Unknown Province`,
      },
    ])
);

const subdistrictCodeToName = Object.fromEntries(
  subdistrictGeoJSONData.features
    .filter((f): f is Feature => f.properties !== null && f.properties !== undefined)
    .map((f) => [
      f.properties!.tam_code ?? "",
      {
        name: f.properties!.tam_th ?? `Unknown Subdistrict`,
        district: f.properties!.amp_th ?? `Unknown District`,
        province: f.properties!.pro_th ?? `Unknown Province`,
      },
    ])
);

const MapThai = ({
  section = "all",
  province = "all",
  district = "all",
  subdistrict = "all",
  team = 1,
  data,
}: PropsComponents) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const zoomIn = useRef<HTMLDivElement | null>(null);
  const zoomOut = useRef<HTMLDivElement | null>(null);

  // Transform geo_map data into MapData structure
  const transformedData: MapData = {
    province: data.province.map((item) => ({
      name: provinceCodeToName[item._id] || `Unknown (${item._id})`,
      value: item.percentage,
    })),
    district: data.district.map((item) => {
      const info = districtCodeToName[item._id] || { name: `Unknown (${item._id})`, province: "" };
      return {
        province: info.province,
        name: info.name,
        value: item.percentage,
      };
    }),
    subdistrict: data.subdistrict.map((item) => {
      const info = subdistrictCodeToName[item._id] || {
        name: `Unknown (${item._id})`,
        district: "",
        province: "",
      };
      return {
        province: info.province,
        district: info.district,
        name: info.name,
        value: item.percentage,
      };
    }),
  };

  useEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    if (root?._logo) root._logo.dispose();

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        wheelable: true,
        projection: am5map.geoMercator(),
      })
    );

    chart.set("minZoomLevel", 0);
    chart.set("maxZoomLevel", 8);
    chart.chartContainer.set("wheelable", true);

    if (zoomIn?.current) {
      zoomIn.current.addEventListener("click", () => chart.zoomIn());
    }
    if (zoomOut?.current) {
      zoomOut.current.addEventListener("click", () => chart.zoomOut());
    }

    const geoDataProvince = provinceGeoJSON as FeatureCollection;
    const geoDataDistrict = districtsGeoJSON as FeatureCollection;
    const geoDataSubdistrict = subdistrictsGeoJSON as FeatureCollection;

    const filteredGeoJSON: FeatureCollection = {
      type: "FeatureCollection",
      features:
        subdistrict !== "all"
          ? geoDataSubdistrict.features.filter((feature) => {
              const props = feature.properties;
              return (
                props &&
                province.split(",").includes(props.pro_th ?? "") &&
                district.split(",").includes(props.amp_th ?? "") &&
                subdistrict.split(",").includes(props.tam_th ?? "")
              );
            })
          : district !== "all"
          ? geoDataSubdistrict.features.filter((feature) => {
              const props = feature.properties;
              return (
                props &&
                province.split(",").includes(props.pro_th ?? "") &&
                district.split(",").includes(props.amp_th ?? "")
              );
            })
          : province !== "all"
          ? geoDataDistrict.features.filter((feature) => {
              const props = feature.properties;
              return props && province.split(",").includes(props.pro_th ?? "");
            })
          : section === "all"
          ? geoDataProvince.features
          : geoDataProvince.features.filter((feature) => {
              const props = feature.properties;
              return props && section.split(",").includes(props.pro_th ?? "");
            }),
    };

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, { geoJSON: filteredGeoJSON })
    );

    const tooltip = root.tooltipContainer.children.push(
      am5.Tooltip.new(root, {
        getFillFromSprite: false,
        autoTextColor: false,
        pointerOrientation: "vertical",
      })
    );

    tooltip.setAll({
      background: am5.Rectangle.new(root, { fillOpacity: 1 }),
      paddingBottom: 10,
      paddingLeft: 10,
      paddingTop: 10,
      paddingRight: 10,
    });
    polygonSeries.mapPolygons.template.set("tooltip", tooltip);

    polygonSeries.mapPolygons.template.states.create("hover", {
      stroke: am5.color(0x3895f9),
      strokeWidth: 3,
    });

    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color("#FFFFFF"),
      stroke: am5.color("#D4D1D3"),
    });

    const getValueData = ({
      dataContext,
    }: {
      dataContext: { pro_th?: string; tam_th?: string; amp_th?: string };
    }) => {
      const provinceData = transformedData.province.find(
        (p) => p.name === dataContext.pro_th
      );
      const districtData = transformedData.district.find(
        (d) => d.province === dataContext.pro_th && d.name === dataContext.amp_th
      );
      const subdistrictData = transformedData.subdistrict.find(
        (s) =>
          s.province === dataContext.pro_th &&
          s.district === dataContext.amp_th &&
          s.name === dataContext.tam_th
      );

      return (
        (province === "all"
          ? provinceData?.value
          : district === "all"
          ? districtData?.value
          : subdistrict === "all"
          ? subdistrictData?.value
          : subdistrictData?.value) || 0
      );
    };

    const getColor = ({ value }: { value: number }) => {
      return value === 0
        ? "#FFFFFF"
        : value <= 25
        ? "#3C8638"
        : value <= 50
        ? "#FE662B"
        : "#C40505";
    };

    polygonSeries.mapPolygons.template.adapters.add("fill", (fill, target) => {
      const dataContext = target.dataItem?.dataContext as {
        pro_th?: string;
        tam_th?: string;
        amp_th?: string;
      };
      const value = getValueData({ dataContext });
      return am5.color(getColor({ value }));
    });

    polygonSeries.mapPolygons.template.adapters.add("tooltipHTML", (text, target) => {
      const dataContext = target.dataItem?.dataContext as {
        pro_th?: string;
        tam_th?: string;
        amp_th?: string;
      };
      const value = getValueData({ dataContext });
      const name =
        province === "all"
          ? dataContext.pro_th
          : district === "all"
          ? dataContext.amp_th
          : dataContext.tam_th || "Unknown";
      return `
        <div style="padding: 10px;">
          <div style="background: white; padding: 5px 10px; border-radius: 8px; box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
            <div style="font-size: 14px; font-weight: bold; color: #000000; display: flex; align-items: center; gap: 5px;">${name}</div>
            <div style="font-size: 12px; color: #000000; display: flex; align-items: center; gap: 5px;">
              <span style="background: ${value === 0 ? "#000000" : getColor({ value })}; display: block; width: 7px; height: 7px; border-radius: 50%;"></span>
              จำนวน: ${value}%
            </div>
          </div>
        </div>
      `;
    });

    return () => {
      root.dispose();
    };
  }, [section, province, district, subdistrict, data, team]);

  return (
    <Box width="100%" height="100%" display="flex" flexDirection="column" position="relative">
      <Grid ref={chartRef} width="100%" height="100%" />
      <Box
        className={[styles.mtBoxBgUnderLine, "notoFont"].join(" ")}
        display="flex"
        flexDirection="row"
        width="100%"
        padding="14px"
        alignItems="center"
        gap="12px"
        marginTop="31px"
      >
        <Grid>0%</Grid>
        <Grid width="100%" height="8px" className={styles.mtBgUnderLine}></Grid>
        <Grid>100%</Grid>
      </Box>
      <Box
        className={[styles.mtBoxZoom, "notoFont"].join(" ")}
        position="absolute"
        bottom="71px"
        right="26px"
      >
        <Grid className={styles.buttonMapBorderBottom} ref={zoomIn}>
          <Button variant="text" id="mapZoomIn" className={styles.buttonMap}>
            <em className="icon-zoom-in" style={{ color: "#A3A3A3" }}></em>
          </Button>
        </Grid>
        <Grid ref={zoomOut}>
          <Button variant="text" id="mapZoomOut" className={styles.buttonMap}>
            <em className="icon-zoom-out" style={{ color: "#A3A3A3" }}></em>
          </Button>
        </Grid>
      </Box>
    </Box>
  );
};

export default MapThai;
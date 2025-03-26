import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
// Libraries
import { InputLabel, MenuItem, FormControl, Select, SelectChangeEvent } from "@mui/material";
import Grid from "@mui/material/Grid2";
// Components
const MapThai = dynamic(() => import("@/components/common/MapThai"), { ssr: false });
import districtsGeoJSON from "@/data/json/districts.json";
import subdistrictsGeoJSON from "@/data/json/subdistricts.json";
import { healthRegions } from "@/data/common/data-filter-map";
// Types for GeoJSON
type ThailandProperties = {
  pro_th: string;
  amp_th: string;
  tam_th?: string;
  amp_code?: string;
  amp_en?: string;
  pro_code?: string;
  pro_en?: string;
  reg_nesdb?: string;
  reg_royin?: string;
  perimeter?: number;
  area_sqkm?: number;
};
type ThailandFeature = {
  type: string;
  properties: ThailandProperties;
  geometry: {
    type: string;
    coordinates: unknown;
  };
};
type ThailandData = {
  type: string;
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: ThailandFeature[];
};
// Type for MapThai data prop
interface GeoMapItem {
  _id: string;
  name: string;
  count_all: number;
  count_selected: number;
  percentage: number;
  provence?: string;
  district?: string;
}
// Mock data
const mockData: { province: GeoMapItem[]; district: GeoMapItem[]; subdistrict: GeoMapItem[] } = {
  province: [
    { _id: "prov_1", name: "กรุงเทพมหานคร", count_all: 20, count_selected: 20, percentage: 100 },
  ],
  district: [
    {
      _id: "dist_1",
      name: "สายไหม",
      provence: "กรุงเทพมหานคร",
      count_all: 10,
      count_selected: 10,
      percentage: 100,
    },
    {
      _id: "dist_2",
      name: "คันนายาว",
      provence: "กรุงเทพมหานคร",
      count_all: 10,
      count_selected: 10,
      percentage: 100,
    },
  ],
  subdistrict: [
    {
      _id: "subdist_1",
      name: "สายไหม",
      provence: "กรุงเทพมหานคร",
      district: "สายไหม",
      count_all: 10,
      count_selected: 10,
      percentage: 100,
    },
    {
      _id: "subdist_2",
      name: "คันนายาว",
      provence: "กรุงเทพมหานคร",
      district: "คันนายาว",
      count_all: 10,
      count_selected: 10,
      percentage: 100,
    },
  ],
};
const Map = () => {
  const [select1, setSelect1] = useState("all"); // เขตสุขภาพ
  const [select2, setSelect2] = useState("all"); // จังหวัด
  const [select3, setSelect3] = useState("all"); // อําเภอ
  const [select4, setSelect4] = useState("all"); // ตําบล
  const geoJsonThaiDistrict = useMemo(() => districtsGeoJSON as ThailandData, []);
  const geoJsonThaiSubdistrict = useMemo(() => subdistrictsGeoJSON as ThailandData, []);
  const findProvince = useMemo(() => {
    const provinces = select1 === "all" ? [] : select1.split(",");
    return [...provinces];
  }, [select1]);
  const findDistrict = useMemo(() => {
    const districts = geoJsonThaiDistrict.features
      .filter((item) => item.properties.pro_th === select2)
      .map((item) => item.properties.amp_th);
    return [...districts];
  }, [select2]);
  const findSubdistrict = useMemo(() => {
    const subdistricts = geoJsonThaiSubdistrict.features
      .filter((item) => item.properties.amp_th === select3)
      .map((item) => item.properties.tam_th || "N/A");
    return [...subdistricts];
  }, [select3]);
  const dataGeoFilter = useMemo(
    () => ({
      healthRegions,
      provinces: findProvince,
      districts: findDistrict,
      subdistricts: findSubdistrict,
    }),
    [findProvince, findDistrict, findSubdistrict]
  );
  const handleChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    if (name === "select1") {
      setSelect1(value);
      resetStateInput(1);
    } else if (name === "select2") {
      setSelect2(value);
      resetStateInput(2);
    } else if (name === "select3") {
      setSelect3(value);
      resetStateInput(3);
    } else if (name === "select4") {
      setSelect4(value);
    }
  };
  const resetStateInput = (mode: number) => {
    if (mode === 1) {
      setSelect2("all");
      setSelect3("all");
      setSelect4("all");
    } else if (mode === 2) {
      setSelect3("all");
      setSelect4("all");
    } else if (mode === 3) {
      setSelect4("all");
    }
  };
  return (
    <div
      style={{
        background: "#eaf7f7",
        height: "calc(100% - 72px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Grid container spacing={2}>
        <Grid minWidth={200}>
          <FormControl fullWidth>
            <InputLabel id="label-select1">เขตสุขภาพ</InputLabel>
            <Select
              labelId="label-select1"
              id="select1"
              value={select1}
              name="select1"
              onChange={handleChange}
            >
              <MenuItem value={"all"}>ประเทศไทย</MenuItem>
              {healthRegions.map((item) => (
                <MenuItem key={item.id} value={item.provinces.join(",")}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {select1 !== "all" && (
          <Grid minWidth={200}>
            <FormControl fullWidth>
              <InputLabel id="label-select2">จังหวัด</InputLabel>
              <Select
                labelId="label-select2"
                id="select2"
                value={select2}
                name="select2"
                onChange={handleChange}
              >
                <MenuItem value={"all"}>ทุกจังหวัด</MenuItem>
                {dataGeoFilter.provinces.map((province, index) => (
                  <MenuItem key={index} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {select1 !== "all" && select2 !== "all" && (
          <Grid minWidth={200}>
            <FormControl fullWidth>
              <InputLabel id="label-select3">อำเภอ</InputLabel>
              <Select
                labelId="label-select3"
                id="select3"
                value={select3}
                name="select3"
                onChange={handleChange}
              >
                <MenuItem value={"all"}>ทุกอำเภอ</MenuItem>
                {dataGeoFilter.districts.map((district, index) => (
                  <MenuItem key={index} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {select1 !== "all" && select2 !== "all" && select3 !== "all" && (
          <Grid minWidth={200}>
            <FormControl fullWidth>
              <InputLabel id="label-select4">ตำบล</InputLabel>
              <Select
                labelId="label-select4"
                id="select4"
                value={select4}
                name="select4"
                onChange={handleChange}
              >
                <MenuItem value={"all"}>ทุกตำบล</MenuItem>
                {dataGeoFilter.subdistricts.map((subdistrict, index) => (
                  <MenuItem key={index} value={subdistrict}>
                    {subdistrict}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
      <MapThai
        section={select1}
        province={select2}
        district={select3}
        subdistrict={select4}
        data={mockData}
        team={1}
      />
    </div>
  );
};
export default Map;
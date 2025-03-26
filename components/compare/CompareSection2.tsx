"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Grid from "@mui/material/Grid2";
import { Box, ListItem, Typography } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateView } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InputSelect from "@/components/common/InSelect";
import styles from "@/styles/compare/compare.module.css";
import provinceGeoJSON from "@/data/json/provinces.json";
import districtsGeoJSON from "@/data/json/districts.json";
import subdistrictsGeoJSON from "@/data/json/subdistricts.json";
import { healthRegions } from "@/data/common/data-filter-map";
import axios from "axios";

const LineChart = dynamic(() => import("@/components/chart/LineChart"), { ssr: false });

const mockDataGender = [
  { id: 1, name: "เพศทั้งหมด", value: "All" },
  { id: 2, name: "ชาย", value: "Male" },
  { id: 3, name: "หญิง", value: "Female" },
];

const mockDataAge = [
  { id: 1, name: "อายุทั้งหมด", value: null },
  { id: 2, name: "6-12 ปี", value: "1" },
  { id: 3, name: "13-18 ปี", value: "2" },
  { id: 4, name: "19-30 ปี", value: "3" },
  { id: 5, name: "31-45 ปี", value: "4" },
  { id: 6, name: "46-60 ปี", value: "5" },
  { id: 7, name: "60 ปีขึ้นไป", value: "6" },
];

const mockDataRangeDate = [
  { id: 1, name: "รายปี", value: "Yearly" },
  { id: 2, name: "รายเดือน", value: "Monthly" },
  { id: 3, name: "รายวัน", value: "Daily" },
];

const mockDataChart1 = [
  { id: 1, name: "BMI", color: "#388E3C" },
  { id: 2, name: "ความดันโลหิต", color: "#00C9D6" },
  { id: 3, name: "ระดับน้ำตาลในเลือด", color: "#E65100" },
];

type DataSelect = {
  id: number;
  name: string;
  value: string | null;
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

type DateValue = Dayjs | null;

type ThailandFeature = {
  properties: {
    pro_th: string;
    pro_code?: string;
    amp_th?: string;
    amp_code?: string;
    tam_th?: string;
    tam_code?: string;
  };
};
type ThailandData = {
  features: ThailandFeature[];
};

const realHealthRegions: DataSelect[] = [
  { id: 0, name: "ทั้งหมด", value: null },
  ...healthRegions.map((region) => ({
    id: region.id,
    name: region.name,
    value: region.id.toString(),
  })),
];



const allProvinces: DataSelect[] = (provinceGeoJSON as ThailandData).features.map((feature, index) => ({
  id: index + 1,
  name: feature.properties.pro_th,
  value: feature.properties.pro_code || null,
}));

const initialDistricts: DataSelect[] = [{ id: 1, name: "ทุกอำเภอ", value: null }];
const initialSubdistricts: DataSelect[] = [{ id: 1, name: "ทุกตำบล", value: null }];

const CompareSection2 = () => {
  const { data: session, status } = useSession();
  const [gender, setGender] = useState<DataSelect | null>(mockDataGender[0]);
  const [age, setAge] = useState<DataSelect | null>(mockDataAge[0]);
  const [rangeDate, setRangeDate] = useState<DataSelect | null>(mockDataRangeDate[0]);
  const [country, setCountry] = useState<DataSelect | null>(null);
  const [province, setProvince] = useState<DataSelect | null>(null);
  const [district, setDistrict] = useState<DataSelect | null>(null);
  const [subdistrict, setSubdistrict] = useState<DataSelect | null>(null);
  const startDateRef = useRef<HTMLDivElement>(null);
  const endDateRef = useRef<HTMLDivElement>(null);
  const [openStart, setOpenStart] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<DateValue>(dayjs("2025-01-01"));
  const [openEnd, setOpenEnd] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<DateValue>(dayjs("2025-12-31"));
  const [comparisonData, setComparisonData] = useState<HealthData[] | null>(null);

  const filteredProvinces = useMemo(() => {
    if (!country || country.value === null) {
      return [{ id: 0, name: "ทุกจังหวัด", value: null }, ...allProvinces];
    }
    const selectedRegion = healthRegions.find((region) => region.id.toString() === country.value);
    if (!selectedRegion) return [{ id: 0, name: "ทุกจังหวัด", value: null }];
    return [
      { id: 0, name: "ทุกจังหวัด", value: null },
      ...allProvinces.filter((prov) => selectedRegion.provinces.includes(prov.name)),
    ];
  }, [country]);

  const filteredDistricts = useMemo(() => {
    if (!province || !province.value) return initialDistricts;
    return (districtsGeoJSON as ThailandData).features
      .filter((feature) => feature.properties.pro_code === province.value)
      .map((feature, index) => ({
        id: index + 1,
        name: feature.properties.amp_th || "Unknown",
        value: feature.properties.amp_code || null,
      }));
  }, [province]);

  const filteredSubdistricts = useMemo(() => {
    if (!district || !district.value) return initialSubdistricts;
    return (subdistrictsGeoJSON as ThailandData).features
      .filter((feature) => feature.properties.amp_code === district.value)
      .map((feature, index) => ({
        id: index + 1,
        name: feature.properties.tam_th || "Unknown",
        value: feature.properties.tam_code || null,
      }));
  }, [district]);

  const getDatePickerViews = (): readonly DateView[] => {
    switch (rangeDate?.value) {
      case "Yearly":
        return ["year"];
      case "Monthly":
        return ["year", "month"];
      case "Daily":
      default:
        return ["year", "month", "day"];
    }
  };

  const getOpenToView = (): DateView => {
    switch (rangeDate?.value) {
      case "Yearly":
        return "year";
      case "Monthly":
        return "month";
      case "Daily":
      default:
        return "day";
    }
  };

  const getDateFormat = (date: DateValue) => {
    if (!date) return null;
    switch (rangeDate?.value) {
      case "Yearly":
        return date.format("YYYY");
      case "Monthly":
        return date.format("MM/YYYY");
      case "Daily":
      default:
        return date.format("DD/MM/YYYY");
    }
  };

  const getAdjustedStartDate = (date: DateValue, timePeriod: string | undefined) => {
    if (!date) return null;
    const beDate = date.add(543, "year");
    switch (timePeriod) {
      case "Yearly":
        return beDate.startOf("year").format("YYYY-MM-DD");
      case "Monthly":
        return beDate.startOf("month").format("YYYY-MM-DD");
      case "Daily":
      default:
        return beDate.format("YYYY-MM-DD");
    }
  };

  const getAdjustedEndDate = (date: DateValue, timePeriod: string | undefined) => {
    if (!date) return null;
    const beDate = date.add(543, "year");
    switch (timePeriod) {
      case "Yearly":
        return beDate.endOf("year").format("YYYY-MM-DD");
      case "Monthly":
        return beDate.endOf("month").format("YYYY-MM-DD");
      case "Daily":
      default:
        return beDate.format("YYYY-MM-DD");
    }
  };

  const requestBody = {
    gender: gender?.value || "All",
    age_rage: age?.value ? parseInt(age.value) : null,
    time_period: rangeDate?.value || "Yearly",
    start: getAdjustedStartDate(startDate, rangeDate?.value || "Yearly"),
    end: getAdjustedEndDate(endDate, rangeDate?.value || "Yearly"),
    area: country?.value ? parseInt(country.value) : null,
    province: province?.value ? parseInt(province.value) : null,
    district: district?.value ? parseInt(district.value) : null,
    sub_district: subdistrict?.value ? parseInt(subdistrict.value) : null,
  };

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (status === "loading" || !session?.accessToken) return;

      try {
        const response = await axios.post(
          "/api/proxyComparisonHealth",
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const rawData = response.data;
        // Normalize the response to always be an array
        const dataArray = Array.isArray(rawData) ? rawData : [rawData];
        setComparisonData(dataArray);
        console.log("Normalized Comparison Health Response:", dataArray);
      } catch (error) {
        console.error("Failed to fetch comparison health data:", error);
      }
    };

    fetchComparisonData();
  }, [gender, age, rangeDate, startDate, endDate, country, province, district, subdistrict, session, status]);

  useEffect(() => {
    console.log("Request Body 2:", requestBody);
  }, [requestBody]);

  const handleStartDateChange = (newValue: DateValue) => {
    if (!newValue) return;
    const adjustedStart =
      rangeDate?.value === "Yearly"
        ? newValue.startOf("year")
        : rangeDate?.value === "Monthly"
          ? newValue.startOf("month")
          : newValue;
    setStartDate(adjustedStart);
    if (endDate && adjustedStart.isAfter(endDate)) {
      setEndDate(null);
    }
    setOpenStart(false);
  };

  const handleEndDateChange = (newValue: DateValue) => {
    if (!newValue) return;
    const adjustedEnd =
      rangeDate?.value === "Yearly"
        ? newValue.endOf("year")
        : rangeDate?.value === "Monthly"
          ? newValue.endOf("month")
          : newValue;
    if (startDate && adjustedEnd.isBefore(startDate)) {
      console.warn("End date cannot be before start date");
      setOpenEnd(false);
      return;
    }
    setEndDate(adjustedEnd);
    setOpenEnd(false);
  };

  return (
    <Box display="flex" flexDirection="column" gap="23px">
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        <Grid className={[styles.textSec1, "notoFont"].join(" ")}>
          ตารางเปรียบเทียบสุขภาพ
        </Grid>
        <Box display="flex" gap="8px" alignItems="center">
          <InputSelect
            width={126}
            value={gender?.id}
            dataItem={mockDataGender.map((item, index) => (
              <ListItem
                onClick={() => setGender(item)}
                key={index}
                data-id={item.id}
                data-value={item.name}
              />
            ))}
          />
          <InputSelect
            width={150}
            value={age?.id}
            dataItem={mockDataAge.map((item, index) => (
              <ListItem
                onClick={() => setAge(item)}
                key={index}
                data-id={item.id}
                data-value={item.name}
              />
            ))}
          />
          <Box className={styles.lineBox}></Box>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box
              sx={{
                display: "flex",
                border: "1px solid #D4D1D3",
                borderRadius: "4px",
                overflow: "hidden",
                height: "40px",
                backgroundColor: "#fff",
              }}
            >
              <Box
                ref={startDateRef}
                sx={{
                  flex: 1,
                  padding: "8px",
                  cursor: "pointer",
                  backgroundColor: openStart ? "#f5f5f5" : "inherit",
                  minWidth: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setOpenStart(true)}
              >
                <Typography variant="body2" color={startDate ? "textPrimary" : "textSecondary"}>
                  {startDate ? getDateFormat(startDate) : "เริ่มต้น"}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 1,
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: "16px", color: "#D4D1D3" }} />
              </Box>
              <Box
                ref={endDateRef}
                sx={{
                  flex: 1,
                  padding: "8px",
                  cursor: "pointer",
                  backgroundColor: openEnd ? "#f5f5f5" : "inherit",
                  minWidth: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  pr: 1,
                }}
                onClick={() => setOpenEnd(true)}
              >
                <Typography variant="body2" color={endDate ? "textPrimary" : "textSecondary"}>
                  {endDate ? getDateFormat(endDate) : "สิ้นสุด"}
                </Typography>
                <CalendarTodayIcon sx={{ fontSize: "16px", color: "#D4D1D3" }} />
              </Box>
            </Box>
            <DatePicker
              open={openStart}
              onOpen={() => setOpenStart(true)}
              onClose={() => setOpenStart(false)}
              value={startDate}
              onChange={handleStartDateChange}
              views={getDatePickerViews()}
              openTo={getOpenToView()}
              format={
                rangeDate?.value === "Yearly"
                  ? "YYYY"
                  : rangeDate?.value === "Monthly"
                    ? "MM/YYYY"
                    : "DD/MM/YYYY"
              }
              slotProps={{
                textField: { sx: { display: "none" } },
                popper: { anchorEl: startDateRef.current, placement: "bottom-start" },
              }}
              maxDate={endDate || undefined}
            />
            <DatePicker
              open={openEnd}
              onOpen={() => setOpenEnd(true)}
              onClose={() => setOpenEnd(false)}
              value={endDate}
              onChange={handleEndDateChange}
              views={getDatePickerViews()}
              openTo={getOpenToView()}
              format={
                rangeDate?.value === "Yearly"
                  ? "YYYY"
                  : rangeDate?.value === "Monthly"
                    ? "MM/YYYY"
                    : "DD/MM/YYYY"
              }
              slotProps={{
                textField: { sx: { display: "none" } },
                popper: { anchorEl: endDateRef.current, placement: "bottom-start" },
              }}
              minDate={startDate || undefined}
            />
          </LocalizationProvider>
          <InputSelect
            width={110}
            value={rangeDate?.id}
            dataItem={mockDataRangeDate.map((item, index) => (
              <ListItem
                onClick={() => setRangeDate(item)}
                key={index}
                data-id={item.id}
                data-value={item.name}
              />
            ))}
          />
        </Box>
      </Grid>

      <Box display="flex" height="100%" gap="24px" minHeight="362px">
        <Box display="flex" width="100%" className={styles.boxChart}>
          <LineChart data={comparisonData} chartType="health" timePeriod={(rangeDate?.value || "Yearly") as "Yearly" | "Monthly" | "Daily"}
          />          
          <Box display="flex" alignItems="center" minWidth="190px" padding="15px" justifyContent="center">
            <Box>
              <ListItem
                className={[styles.itemMapTextChartBox, styles.itemMapTextChartBoxTextTitle].join(" ")}
              >
                เปอร์เซ็นต์ผู้คัดกรองความเสี่ยง
              </ListItem>
              {mockDataChart1.map((item, index) => (
                <ListItem className={styles.itemMapTextChartBox} key={index}>
                  <CircleIcon style={{ color: item.color, fontSize: 14 }} />
                  <Box className={styles.itemMapTextChart}>{item.name}</Box>
                </ListItem>
              ))}
            </Box>
          </Box>
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          minWidth="239px"
          height="100%"
          className={styles.boxChart}
        >
          <Box className={styles.textBoxFilterChart}>กรองข้อมูลตามพื้นที่</Box>
          <Box width="100%">
            <InputSelect
              width="100%"
              value={country?.id || ""}
              dataItem={realHealthRegions.map((item, index) => (
                <ListItem
                  onClick={() => {
                    setCountry(item.value === null ? null : item);
                    setProvince(null);
                    setDistrict(null);
                    setSubdistrict(null);
                  }}
                  key={index}
                  data-id={item.id}
                  data-value={item.name}
                />
              ))}
              placeholder="ประเทศไทย"
            />
          </Box>
          <Box width="100%">
            <InputSelect
              width="100%"
              value={province?.id || ""}
              dataItem={filteredProvinces.map((item, index) => (
                <ListItem
                  onClick={() => {
                    setProvince(item.value === null ? null : item);
                    setDistrict(null);
                    setSubdistrict(null);
                  }}
                  key={index}
                  data-id={item.id}
                  data-value={item.name}
                />
              ))}
              disabled={!country || country.value === null}
              placeholder="จังหวัด"
            />
          </Box>
          <Box width="100%">
            <InputSelect
              width="100%"
              value={district?.id || ""}
              dataItem={filteredDistricts.map((item, index) => (
                <ListItem
                  onClick={() => {
                    setDistrict(item.value === null ? null : item);
                    setSubdistrict(null);
                  }}
                  key={index}
                  data-id={item.id}
                  data-value={item.name}
                />
              ))}
              disabled={!province || !province.value}
              placeholder="อำเภอ"
            />
          </Box>
          <Box width="100%">
            <InputSelect
              width="100%"
              value={subdistrict?.id || ""}
              dataItem={filteredSubdistricts.map((item, index) => (
                <ListItem
                  onClick={() => setSubdistrict(item.value === null ? null : item)}
                  key={index}
                  data-id={item.id}
                  data-value={item.name}
                />
              ))}
              disabled={!district || !district.value}
              placeholder="ตำบล"
            />
          </Box>
          <Box
            className={styles.textBoxFilterChartReset}
            onClick={() => {
              setCountry(realHealthRegions[0]);
              setProvince(null);
              setDistrict(null);
              setSubdistrict(null);
            }}
          >
            รีเซ็ต
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CompareSection2;
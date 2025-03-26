import * as React from "react";
import dynamic from "next/dynamic";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useSession, signIn, getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { dashboardOverview } from "@/services/api";
import { AxiosError } from "axios";
import dayjs, { Dayjs } from "dayjs";
import { debounce } from "lodash";
import {
  Card,
  Typography,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Divider,
  InputLabel,
  Button,
  Box,
  ListItem,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { TableSortLabel as MuiTableSortLabel } from "@mui/material";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid2";
import Image from "next/image";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CircularProgressWithLabel from "@/components/mui/CircularProgressWithLabel";
import styles from "@/styles/overview/overview.module.css";
import provinceGeoJSON from "@/data/json/provinces.json";
import districtsGeoJSON from "@/data/json/districts.json";
import subdistrictsGeoJSON from "@/data/json/subdistricts.json";
import { healthRegions } from "@/data/common/data-filter-map";
import InputSelect from "@/components/common/InSelect";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const AmUniversalChart = dynamic(() => import("@/components/chart/AmChart"), {
  ssr: false,
  loading: () => <Typography>Loading chart...</Typography>,
});
const MapThai = dynamic(() => import("@/components/common/MapThai"), {
  ssr: false,
  loading: () => <Typography>Loading map...</Typography>,
});

/** ============================
 *     TYPES + MOCK DATA
 * ============================ */

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
type DataSelect = {
  id: number;
  name: string;
};
type DateValue = Dayjs | null;
type TopFiveItem = {
  _id: number;
  count: number;
};
interface ChartData {
  category: string;
  value?: number;
  total?: number;
  [key: string]: string | number | undefined;
}
interface ThreeYearRawItem {
  count: number;
  _id: {
    month: number;
    year: number;
  };
}
interface ThreeYearChartData extends ChartData {
  category: string;
  total?: number;
  [key: `value${string}`]: number | undefined;
}
type GeoMapItem = {
  _id: number | string;
  count_all: number;
  count_selected: number;
  percentage: number;
};
type GeoMapData = {
  province: GeoMapItem[];
  district: GeoMapItem[];
  subdistrict: GeoMapItem[];
};

type SeriesField = {
  field: string;
  name: string;
  color: string;
};

type MonthKey =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12";

const thaiMonthMapping: Record<MonthKey, string> = {
  "01": "ม.ค.",
  "02": "ก.พ.",
  "03": "มี.ค.",
  "04": "เม.ย.",
  "05": "พ.ค.",
  "06": "มิ.ย.",
  "07": "ก.ค.",
  "08": "ส.ค.",
  "09": "ก.ย.",
  "10": "ต.ค.",
  "11": "พ.ย.",
  "12": "ธ.ค.",
};
const healthRegionMapping: Record<number, string> = Object.fromEntries(
  healthRegions.map((region) => [region.id, region.name])
);

/** ============================
 *   PAGE PROPS INTERFACE
 * ============================ */
interface OverviewPageProps {
  overviewData: unknown;
}

/** ============================
 *        PAGE COMPONENT
 * ============================ */
export default function OverviewPage({ overviewData }: OverviewPageProps) {
  const { data: session, status } = useSession();

  
  
  
  const [bmiValue, setBmiValue] = useState<string>("");
  const [gender, setGender] = useState<DataSelect | null>({
    id: 1,
    name: "เพศทั้งหมด",
  });
  const [qualifier, setQualifier] = useState<string>("BMI");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const [topHealthRegionData, setTopHealthRegionData] = useState<ChartData[]>([]);
  const [totalScreened, setTotalScreened] = useState<number>(0);
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [geoMapData, setGeoMapData] = useState<GeoMapData | null>(null);

  
  const [rangeData, setRangeData] = useState<ChartData[]>([]);
  const [filteredRangeData, setFilteredRangeData] = useState<ChartData[]>([]);
  const [rangeChartFields, setRangeChartFields] = useState<SeriesField[]>([]);

  
  const [threeYearData, setThreeYearData] = useState<ChartData[]>([]);
  const [yearlyData, setYearlyData] = useState<ChartData[]>([]);

  
  const [openModal, setOpenModal] = useState<boolean>(false);

  
  const [startDate, setStartDate] = useState<DateValue>(null);
  const [endDate, setEndDate] = useState<DateValue>(null);
  const tenYearsAgo = dayjs().subtract(10, "year");
  const [openStart, setOpenStart] = useState<boolean>(false);
  const [openEnd, setOpenEnd] = useState<boolean>(false);
  const startDateRef = useRef<HTMLDivElement>(null);
  const endDateRef = useRef<HTMLDivElement>(null);

  
  const [select1, setSelect1] = useState("all");
  const [select2, setSelect2] = useState("all");
  const [select3, setSelect3] = useState("all");
  const [select4, setSelect4] = useState("all");

  
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("category");

  
  
  
  const handleSort = (property: string) => () => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const CustomTableSortLabel = styled(MuiTableSortLabel)(({ theme }) => ({
    "& .MuiTableSortLabel-icon": {
      opacity: 0.3,
      transition: theme.transitions.create("opacity"),
    },
    "&.Mui-active .MuiTableSortLabel-icon": {
      opacity: 1,
      color: theme.palette.text.primary,
    },
  }));
  const CustomSortIcon = ({
    direction,
    active,
  }: {
    direction: "asc" | "desc";
    active: boolean;
  }) => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <ChevronLeftIcon
        sx={{
          fontSize: "16px",
          transform: "rotate(90deg)",
          opacity: active && direction === "asc" ? 1 : 0.3,
          color: active && direction === "asc" ? "text.primary" : "text.secondary",
          marginBottom: "-8px",
        }}
      />
      <ChevronRightIcon
        sx={{
          fontSize: "16px",
          transform: "rotate(90deg)",
          opacity: active && direction === "desc" ? 1 : 0.3,
          color: active && direction === "desc" ? "text.primary" : "text.secondary",
        }}
      />
    </Box>
  );

  const sortedData = [...yearlyData].sort((a, b) => {
    if (orderBy === "category") {
      return order === "asc"
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    } else if (orderBy === "total") {
      return order === "asc"
        ? (a.total || 0) - (b.total || 0)
        : (b.total || 0) - (a.total || 0);
    }
    return 0;
  });

  
  
  
  const bmiMapping: Record<string, number> = {
    ผอม: 1,
    ปกติ: 2,
    น้ำหนักเกิน: 3,
    อ้วน: 4,
    อ้วนอันตราย: 5,
  };
  const bpMapping: Record<string, number> = {
    "ความดันต่ำกว่าเกณฑ์": 1,
    ปกติ: 2,
    "ความดันโลหิตสูง": 3,
    "อาจเป็นโรคความดันโลหิตสูง": 4,
    "น่าจะเป็นโรคความดันโลหิตสูง": 5,
    "ความดันโลหิตสูงอันตราย": 6,
  };
  const bsMapping: Record<string, number> = {
    ปกติ: 1,
    "ภาวะก่อนเป็นเบาหวาน": 2,
    เบาหวาน: 3,
  };
  const reverseBmiMapping: Record<number, string> = Object.fromEntries(
    Object.entries(bmiMapping).map(([key, value]) => [value, key])
  );
  const reverseBpMapping: Record<number, string> = Object.fromEntries(
    Object.entries(bpMapping).map(([key, value]) => [value, key])
  );
 

  const qualifierTypeOptions = useMemo(() => {
    if (qualifier === "BMI") {
      return ["ผอม", "ปกติ", "น้ำหนักเกิน", "อ้วน", "อ้วนอันตราย"];
    } else if (qualifier === "BP") {
      return [
        "ความดันต่ำกว่าเกณฑ์",
        "ปกติ",
        "ความดันโลหิตสูง",
        "อาจเป็นโรคความดันโลหิตสูง",
        "น่าจะเป็นโรคความดันโลหิตสูง",
        "ความดันโลหิตสูงอันตราย",
      ];
    } else if (qualifier === "BS") {
      return ["ปกติ", "ภาวะก่อนเป็นเบาหวาน", "เบาหวาน"];
    }
    return [];
  }, [qualifier]);

  const genderMapping: Record<string, string> = {
    "เพศทั้งหมด": "All",
    ชาย: "Male",
    หญิง: "Female",
  };

  
  
  
  const handleShowAll = useCallback(() => {
    setFilteredRangeData(rangeData);
  }, [rangeData]);

  
  
  
  const handleBmiChange = useCallback((e: SelectChangeEvent) => {
    setBmiValue(e.target.value);
  }, []);
  const handleQualifierChange = useCallback((e: SelectChangeEvent) => {
    setQualifier(e.target.value);
  }, []);
  const handleHealthFilterChange = useCallback((e: SelectChangeEvent) => {
    setHealthFilter(e.target.value);
  }, []);

  
  const handleStartDateChange = useCallback(
    (newValue: DateValue) => {
      if (newValue) {
        if (endDate && newValue.isAfter(endDate)) {
          setEndDate(null);
        }
        setStartDate(newValue);
      } else {
        setStartDate(null);
      }
      setOpenStart(false);
    },
    [endDate]
  );
  const handleEndDateChange = useCallback(
    (newValue: DateValue) => {
      if (newValue) {
        if (startDate && newValue.isBefore(startDate)) {
          setStartDate(newValue);
          setEndDate(null);
        } else {
          setEndDate(newValue);
        }
      } else {
        setEndDate(null);
      }
      setOpenEnd(false);
    },
    [startDate]
  );

  
  const findProvince = useMemo(() => {
    return select1 === "all" ? [] : select1.split(",");
  }, [select1]);
  const geoJsonThaiDistrict = districtsGeoJSON as ThailandData;
  const findDistrict = useMemo(() => {
    const districts = geoJsonThaiDistrict.features
      .filter((f) => f.properties.pro_th === select2)
      .map((f) => f.properties.amp_th);
    return districts;
  }, [select2, geoJsonThaiDistrict.features]);
  const geoJsonThaiSubdistrict = subdistrictsGeoJSON as ThailandData;
  const findSubdistrict = useMemo(() => {
    const subdistricts = geoJsonThaiSubdistrict.features
      .filter((f) => f.properties.amp_th === select3)
      .map((f) => f.properties.tam_th);
    return subdistricts;
  }, [select3, geoJsonThaiSubdistrict.features]);
  const dataGeoFilter = useMemo(
    () => ({
      healthRegions,
      provinces: findProvince,
      districts: findDistrict,
      subdistricts: findSubdistrict,
    }),
    [findProvince, findDistrict, findSubdistrict]
  );

  const resetStateInput = useCallback(
    (mode: number) => {
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
    },
    [setSelect2, setSelect3, setSelect4]
  );
  const handleChange = useCallback(
    (e: SelectChangeEvent) => {
      const { name, value } = e.target;
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
    },
    [resetStateInput, setSelect1, setSelect2, setSelect3, setSelect4]
  );

  
  const CircleProcess = React.memo(
    ({ value: progressValue, color }: { value: number; color: string }) => (
      <Box position="relative">
        <CircularProgressWithLabel
          value={100}
          chartColor="#F5F5F5"
          labelColor="rgba(0, 0, 0, 0)"
          size={80}
          thickness={5}
        />
        <Box position="absolute" top={0} left={0}>
          <CircularProgressWithLabel
            value={progressValue}
            chartColor={color}
            labelColor={color}
            size={80}
            thickness={5}
          />
        </Box>
      </Box>
    )
  );
  CircleProcess.displayName = "CircleProcess";

  
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  
  
  
  const fetchData = useCallback(
    debounce(async () => {
      if (!startDate || !endDate) return;

      const beStartDate = startDate.year(startDate.year() + 0);
      const beEndDate = endDate.year(endDate.year() + 0);

      const formattedStart = beStartDate.format("YYYY-MM-DD");
      const formattedEnd = beEndDate.format("YYYY-MM-DD");

      let numericQualifierType = 0;
      if (qualifier === "BMI") {
        numericQualifierType = bmiMapping[bmiValue] || 0;
      } else if (qualifier === "BP") {
        numericQualifierType = bpMapping[bmiValue] || 0;
      } else if (qualifier === "BS") {
        numericQualifierType = bsMapping[bmiValue] || 0;
      }

      let numericTopFiveType = 1;
      if (healthFilter !== "all") {
        if (qualifier === "BMI") {
          numericTopFiveType = bmiMapping[healthFilter] || 0;
        } else if (qualifier === "BP") {
          numericTopFiveType = bpMapping[healthFilter] || 0;
        } else if (qualifier === "BS") {
          numericTopFiveType = bsMapping[healthFilter] || 0;
        }
      }

      
      const selectedRegion = healthRegions.find(
        (region) => region.provinces.join(",") === select1
      );
      const areaId = select1 === "all" ? null : selectedRegion?.id || null;

      
      let finalProvince: number | null = null;
      if (select2 !== "all") {
        const found = (provinceGeoJSON as ThailandData).features.find(
          (f) => f.properties.pro_th === select2
        );
        finalProvince = found?.properties.pro_code
          ? parseInt(found.properties.pro_code, 10)
          : null;
      }

      
      let finalDistrict: number | null = null;
      if (select3 !== "all") {
        const found = (districtsGeoJSON as ThailandData).features.find(
          (f) => f.properties.pro_th === select2 && f.properties.amp_th === select3
        );
        finalDistrict = found?.properties.amp_code
          ? parseInt(found.properties.amp_code, 10)
          : null;
      }

      
      let finalSubdistrict: number | null = null;
      if (select4 !== "all") {
        const found = (subdistrictsGeoJSON as ThailandData).features.find(
          (f) =>
            f.properties.pro_th === select2 &&
            f.properties.amp_th === select3 &&
            f.properties.tam_th === select4
        );
        finalSubdistrict = found?.properties.tam_code
          ? parseInt(found.properties.tam_code, 10)
          : null;
      }

      const requestBody = {
        qualifier,
        qualifier_type: numericQualifierType,
        top_five_type: numericTopFiveType,
        start: formattedStart,
        end: formattedEnd,
        gender: gender ? genderMapping[gender.name] : "All",
        area: select2 === "all" ? areaId : null,
        province: finalProvince,
        district: finalDistrict,
        subdistrict: finalSubdistrict,
      };

      console.log("Request Body:", requestBody);
      setIsLoading(true);

      try {
        const token = session?.accessToken ?? "";
        const response = await dashboardOverview(requestBody, token);
       
         console.log("Dashboard Overview Response:", response);

        
        
        
        let provinceData: GeoMapItem[] = [];
        let districtData: GeoMapItem[] = [];
        let subdistrictData: GeoMapItem[] = [];

        if (response.geo_map && response.geo_map.length > 0) {
          if (select4 !== "all") {
            subdistrictData = response.geo_map;
          } else if (select3 !== "all") {
            districtData = response.geo_map;
          } else {
            provinceData = response.geo_map;
          }
        }
        setGeoMapData({
          province: provinceData,
          district: districtData,
          subdistrict: subdistrictData,
        });

        
        
        
        const genderData = response.gender || [];
        if (genderData.length > 0) {
          const male = genderData.find((g: { _id: number }) => g._id === 3)?.count || 0;
          const female = genderData.find((g: { _id: number }) => g._id === 2)?.count || 0;
          const total = male + female;
          setTotalScreened(total);
          setMaleCount(male);
          setFemaleCount(female);
        } else {
          setTotalScreened(0);
          setMaleCount(0);
          setFemaleCount(0);
        }

        
        
        
        const topFiveData: ChartData[] = (response.top_five || []).map((item: TopFiveItem) => ({
          category: healthRegionMapping[item._id] || `เขต ${item._id}`,
          value: item.count,
        }));
        const sortedTopFive = topFiveData
          .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
          .slice(0, 5);
        setTopHealthRegionData(sortedTopFive);

        
        
        
        const rangeDataRaw = response.range || [];
        let rangeChartData: ChartData[] = [];

        if (rangeDataRaw.length > 0) {
          if (qualifier === "BMI") {
            rangeChartData = rangeDataRaw.map((item: { _id: number; count: number }) => ({
              category: reverseBmiMapping[item._id] || `Unknown (${item._id})`,
              value: item.count,
            }));
            
            setRangeChartFields([
              { field: "value", name: "จำนวนคน", color: "#27CFA7" },
            ]);
          } else if (qualifier === "BP") {
            rangeChartData = rangeDataRaw.map((item: { _id: number; count: number }) => ({
              category: reverseBpMapping[item._id] || `Unknown (${item._id})`,
              value: item.count,
            }));
            
            setRangeChartFields([
              { field: "value", name: "จำนวนคน", color: "#27CFA7" },
            ]);
          } else if (qualifier === "BS") {
            
            

            
            
            const bsCounts: Record<string, number> = {};
            [1, 2, 3].forEach((typeId) => {
              bsCounts[`${typeId}_true`] = 0;
              bsCounts[`${typeId}_false`] = 0;
            });

            
            rangeDataRaw.forEach((item: {
              _id: { blood_type_id: number; blood_sugar_id?: boolean };
              count_blood_sugar: number;
            }) => {
              const typeId = item._id?.blood_type_id;
              const isFasting = item._id?.blood_sugar_id; 
              const count = item.count_blood_sugar ?? 0;
              if (typeof typeId === "number") {
                bsCounts[`${typeId}_${isFasting}`] += count;
              }
            });

            
            const bsLabelMap: Record<number, string> = {
              1: "ปกติ",
              2: "ภาวะก่อนเป็นเบาหวาน",
              3: "เบาหวาน",
            };

            
            rangeChartData = Object.keys(bsLabelMap).map((keyStr) => {
              const key = Number(keyStr);
              return {
                category: bsLabelMap[key] || `Unknown (${key})`,
                fasting: bsCounts[`${key}_true`],
                nonFasting: bsCounts[`${key}_false`],
              };
            });

            
            setRangeChartFields([
              { field: "fasting", name: "จำนวนคนงดอาหาร", color: "#27CFA7" },
              { field: "nonFasting", name: "จำนวนคนไม่งดอาหาร", color: "#35D0DA" },
            ]);
          }
        } else {
          
          
          setRangeChartFields([]);
        }

        setRangeData(rangeChartData);
        setFilteredRangeData(rangeChartData);

        
        
        
        const threeYearRaw = response.three_year || [];
        const monthMap: Record<string, ThreeYearChartData> = {};
        const yearMap: Record<string, ThreeYearChartData> = {};

        if (threeYearRaw.length > 0) {
          threeYearRaw.forEach((item: ThreeYearRawItem) => {
            const year: string = item._id.year.toString();
            const monthStr: string = item._id.month.toString().padStart(2, "0");
            const month: MonthKey = Object.keys(thaiMonthMapping).includes(monthStr)
              ? (monthStr as MonthKey)
              : "01";

            if (!monthMap[month]) {
              const monthLabel = thaiMonthMapping[month] || month;
              monthMap[month] = { category: monthLabel };
            }
            monthMap[month][`value${year}`] = item.count;

            if (!yearMap[year]) {
              yearMap[year] = { category: `พ.ศ. ${year}`, total: 0 };
            }
            yearMap[year].total = (yearMap[year].total || 0) + item.count;
          });

          const allMonths: MonthKey[] = Array.from({ length: 12 }, (_, i) =>
            (i + 1).toString().padStart(2, "0")
          ) as MonthKey[];
          const threeYearChartData: ThreeYearChartData[] = allMonths.map((month) => {
            const dataPoint = monthMap[month] || { category: thaiMonthMapping[month] || month };
            return dataPoint;
          });
          setThreeYearData(threeYearChartData);

          const allYears = Array.from(
            new Set(threeYearRaw.map((item: ThreeYearRawItem) => item._id.year.toString()))
          ).sort();
          const yearlyChartData: ThreeYearChartData[] = allYears.map((year) => {
            const dataPoint = yearMap[year as string] || { category: `พ.ศ. ${year}`, total: 0 };
            return dataPoint;
          });
          setYearlyData(yearlyChartData);
        } else {
          
          const currentYearBE = dayjs().year() + 0;
          const expectedYears = [
            (currentYearBE - 2).toString(),
            (currentYearBE - 1).toString(),
            currentYearBE.toString(),
          ];
          const allMonths: MonthKey[] = Array.from({ length: 12 }, (_, i) =>
            (i + 1).toString().padStart(2, "0")
          ) as MonthKey[];
          const emptyThreeYearData: ThreeYearChartData[] = allMonths.map((month) => {
            const dataPoint: ThreeYearChartData = { category: thaiMonthMapping[month] || month };
            expectedYears.forEach((year) => {
              dataPoint[`value${year}`] = 0;
            });
            return dataPoint;
          });
          setThreeYearData(emptyThreeYearData);

          const emptyYearlyData: ThreeYearChartData[] = expectedYears.map((year) => ({
            category: `พ.ศ. ${year}`,
            total: 0,
          }));
          setYearlyData(emptyYearlyData);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error("Error fetching dashboard overview:", error.message);
          if (error.response) {
            console.log("Error Response Data:", error.response.data);
          }
        } else {
          console.error("Unexpected error:", error);
        }
        
        setGeoMapData({ province: [], district: [], subdistrict: [] });
        setTotalScreened(0);
        setMaleCount(0);
        setFemaleCount(0);
        setRangeData([]);
        setFilteredRangeData([]);

        
        const currentYearBE = dayjs().year() + 0;
        const expectedYears = [
          (currentYearBE - 2).toString(),
          (currentYearBE - 1).toString(),
          currentYearBE.toString(),
        ];
        const allMonths: MonthKey[] = Array.from({ length: 12 }, (_, i) =>
          (i + 1).toString().padStart(2, "0")
        ) as MonthKey[];
        const fallbackThreeYearData: ThreeYearChartData[] = allMonths.map((month) => {
          const dataPoint: ThreeYearChartData = { category: thaiMonthMapping[month] || month };
          expectedYears.forEach((year) => {
            dataPoint[`value${year}`] = 0;
          });
          return dataPoint;
        });
        setThreeYearData(fallbackThreeYearData);

        const emptyYearlyData: ThreeYearChartData[] = expectedYears.map((year) => ({
          category: `พ.ศ. ${year}`,
          total: 0,
        }));
        setYearlyData(emptyYearlyData);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [
      startDate,
      endDate,
      qualifier,
      bmiValue,
      healthFilter,
      select1,
      select2,
      select3,
      select4,
      session?.accessToken,
      gender,
    ]
  );

  
  const seriesFields = useMemo(() => {
    if (threeYearData.length === 0) return [];
    const years = new Set<string>();
    threeYearData.forEach((dataPoint) => {
      Object.keys(dataPoint).forEach((key) => {
        if (key.startsWith("value") && key !== "value") {
          years.add(key.replace("value", ""));
        }
      });
    });
    const colors = ["#9747FF", "#3E80F9", "#FFC300"];
    return Array.from(years)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map((year, index) => ({
        field: `value${year}` as const,
        name: year,
        color: colors[index % colors.length],
      }));
  }, [threeYearData]);

  
  
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
    }
  }, [status]);

  useEffect(() => {
    if (qualifierTypeOptions.length > 0) {
      setBmiValue(qualifierTypeOptions[0]);
    }
  }, [qualifierTypeOptions]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  
  
  
  const isAllValuesZero = (
    data: Array<ChartData | ThreeYearChartData>,
    fields: string[] 
  ): boolean => {
    if (!data || data.length === 0) return true;
    return data.every((row) =>
      fields.every((field) => {
        const val = (row as ChartData)[field] ?? 0;
        return val === 0;
      })
    );
  };

  
  const rangeValueFields = rangeChartFields.map((sf) => sf.field);

  console.log("SSR overviewData:", overviewData);

  /** =====================
   *   RENDERING SECTION
   * ===================== */
  return (
    <>
      <Grid container className={[styles.main, "notoFont"].join(" ")}>
        {/* ===== MAIN CONTENT ===== */}
        <Grid container spacing={2} className={styles.mainContent}>
          {/* LEFT SIDE - Map */}
          <Grid display="flex" flexDirection="column" size={{ xs: 12, md: 4 }} marginTop="24px">
            {/* Qualifier (BMI / BP / BS) */}
            <Grid width="100%" className={styles.filterBmiField}>
              <FormControl fullWidth>
                <Select
                  value={qualifier}
                  onChange={handleQualifierChange}
                  IconComponent={KeyboardArrowDownIcon}
                  className={styles.filterBmiField}
                >
                  <MenuItem value="BMI">ค่าดัชนีมวลกาย (BMI)</MenuItem>
                  <MenuItem value="BP">ความดันในเลือด (Blood Pressure)</MenuItem>
                  <MenuItem value="BS">ระดับน้ำตาลในเลือด</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Sub-Qualifier */}
            <Grid className={styles.extraSelectGrid}>
              <FormControl size="small" className={styles.extraSelect}>
                <Select
                  className={styles.extraSelect}
                  value={bmiValue}
                  onChange={handleBmiChange}
                  IconComponent={KeyboardArrowDownIcon}
                >
                  {qualifierTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* The actual map */}
            <Grid className={styles.mapCard}>
              <MapThai
                section={select1}
                province={select2}
                district={select3}
                subdistrict={select4}
                data={geoMapData || { province: [], district: [], subdistrict: [] }}
                team={1}
              />
            </Grid>
          </Grid>

          {/* RIGHT SIDE - KPI + Charts */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* ===== TOP FILTER BAR ===== */}
            <Grid
              container
              justifyContent="flex-end"
              size={{ xs: 12 }}
              className={styles.filterBar}
              marginTop="24px"
              marginBottom="24px"
            >
              <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
                <Grid size={{ xs: "auto" }}>
                  <Grid container alignItems="center" spacing={2}>
                    {/* Date Range */}
                    <Grid size={{ xs: "auto" }}>
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
                          {/* Start Date */}
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
                            <Typography
                              variant="body2"
                              color={startDate ? "textPrimary" : "textSecondary"}
                            >
                              {startDate ? startDate.format("DD/MM/YYYY") : "วันเริ่มต้น"}
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
                          {/* End Date */}
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
                            <Typography
                              variant="body2"
                              color={endDate ? "textPrimary" : "textSecondary"}
                            >
                              {endDate ? endDate.format("DD/MM/YYYY") : "วันสิ้นสุด"}
                            </Typography>
                            <CalendarTodayIcon sx={{ fontSize: "16px", color: "#D4D1D3" }} />
                          </Box>
                        </Box>
                        {/* Start DatePicker */}
                        <DatePicker
                          open={openStart}
                          onOpen={() => setOpenStart(true)}
                          onClose={() => setOpenStart(false)}
                          value={startDate}
                          onChange={handleStartDateChange}
                          format="DD/MM/YYYY [BE]"
                          slotProps={{
                            textField: { sx: { display: "none" } },
                            popper: {
                              anchorEl: startDateRef.current,
                              placement: "bottom-start",
                            },
                          }}
                          maxDate={endDate || undefined}
                          minDate={tenYearsAgo}
                        />
                        {/* End DatePicker */}
                        <DatePicker
                          open={openEnd}
                          onOpen={() => setOpenEnd(true)}
                          onClose={() => setOpenEnd(false)}
                          value={endDate}
                          onChange={handleEndDateChange}
                          format="DD/MM/YYYY [BE]"
                          slotProps={{
                            textField: { sx: { display: "none" } },
                            popper: { anchorEl: endDateRef.current, placement: "bottom-start" },
                          }}
                          minDate={startDate || undefined}
                        />
                      </LocalizationProvider>
                    </Grid>

                    {/* Gender Filter */}
                    <Grid size={{ xs: "auto" }}>
                      <InputSelect
                        width={126}
                        value={gender?.id}
                        dataItem={[
                          { id: 1, name: "เพศทั้งหมด" },
                          { id: 2, name: "ชาย" },
                          { id: 3, name: "หญิง" },
                        ].map((item: DataSelect, index) => (
                          <ListItem
                            onClick={() => {
                              setGender(item);
                              fetchData();
                            }}
                            key={index}
                            data-id={item.id}
                            data-value={item.name}
                          />
                        ))}
                      />
                    </Grid>

                    {/* Region & Province & District & Subdistrict */}
                    <Grid container spacing={2}>
                      <Grid minWidth={200}>
                        <FormControl fullWidth>
                          <InputLabel id="label-select1"></InputLabel>
                          <Select
                            value={select1}
                            name="select1"
                            IconComponent={KeyboardArrowDownIcon}
                            onChange={handleChange}
                            className={styles.filterZone}
                          >
                            <MenuItem value="all">ประเทศไทย</MenuItem>
                            {healthRegions.map((hr) => (
                              <MenuItem key={hr.id} value={hr.provinces.join(",")}>
                                {hr.name}
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
                              IconComponent={KeyboardArrowDownIcon}
                              onChange={handleChange}
                              className={styles.filterZone}
                            >
                              <MenuItem value="all">ทุกจังหวัด</MenuItem>
                              {dataGeoFilter.provinces.map((prov, i) => (
                                <MenuItem key={i} value={prov}>
                                  {prov}
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
                              IconComponent={KeyboardArrowDownIcon}
                              onChange={handleChange}
                              className={styles.filterZone}
                            >
                              <MenuItem value="all">ทุกอำเภอ</MenuItem>
                              {dataGeoFilter.districts.map((dist, j) => (
                                <MenuItem key={j} value={dist}>
                                  {dist}
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
                              IconComponent={KeyboardArrowDownIcon}
                              onChange={handleChange}
                              className={styles.filterZone}
                            >
                              <MenuItem value="all">ทุกตำบล</MenuItem>
                              {dataGeoFilter.subdistricts.map((tam, k) => (
                                <MenuItem key={k} value={tam}>
                                  {tam}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* ===== KPI + Charts ===== */}
            <Grid container spacing={2}>
              {/* ===== KPI ROW ===== */}
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={2} className={styles.kpiRow}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card className={[styles.kpiCard, "notoFont"].join(" ")}>
                      <Grid className={[styles.kpiCardContent, "notoFont"].join(" ")}>
                        <Image
                          src="/images/overview/Group.png"
                          width={80}
                          height={80}
                          alt="Group"
                          style={{ display: "block" }}
                        />
                        <Grid>
                          <Grid className={styles.kpiTitle}>จำนวนผู้คัดกรองความเสี่ยง</Grid>
                          <Grid className={styles.kpiValue}>{totalScreened} คน</Grid>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Grid container spacing={0}>
                      <Card className={styles.kpiCard2}>
                        <Grid className={styles.kpiCardContent}>
                          <CircleProcess
                            color="#3071E9"
                            value={totalScreened ? (maleCount / totalScreened) * 100 : 0}
                          />
                          <Grid>
                            <Box display="flex" gap="8px">
                              <Grid className={[styles.genderIcon, "icon-male"].join(" ")} />
                              <Grid className={styles.kpiTitle}>เพศชาย</Grid>
                            </Box>
                            <Grid className={styles.kpiValue}>
                              {maleCount.toLocaleString()} คน
                            </Grid>
                          </Grid>
                        </Grid>
                        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                        <Grid className={styles.kpiCardContent}>
                          <CircleProcess
                            color="#EA528B"
                            value={totalScreened ? (femaleCount / totalScreened) * 100 : 0}
                          />
                          <Grid>
                            <Box display="flex" gap="8px">
                              <Grid className={[styles.genderIcon, "icon-female"].join(" ")} />
                              <Grid className={styles.kpiTitle}>เพศหญิง</Grid>
                            </Box>
                            <Grid className={styles.kpiValue}>
                              {femaleCount.toLocaleString()} คน
                            </Grid>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* ===== Range Chart (BMI/BP/BS) ===== */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card className={styles.chartCard}>
                  <Grid className={styles.charttitle}>
                    <Typography className={styles.charttitle1}>
                      {qualifier === "BMI"
                        ? "BMI range"
                        : qualifier === "BP"
                        ? "BP range"
                        : "Blood sugar range"}
                    </Typography>

                    {qualifier === "BS" ? (
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography>
                          <span
                            className={styles.charttitle1s}
                            style={{ backgroundColor: "#27CFA7" }}
                          />
                          จำนวนคนงดอาหาร
                        </Typography>
                        <Typography>
                          <span className={styles.charttitlebs} />
                          จำนวนคนไม่งดอาหาร
                        </Typography>
                      </Box>
                    ) : (
                      <Typography>
                        <span className={styles.charttitle1s} />
                        จำนวนคน
                      </Typography>
                    )}
                  </Grid>

                  {isLoading ? (
                    <Typography align="center" sx={{ padding: "20px" }}>
                      Loading...
                    </Typography>
                  ) : !isAllValuesZero(filteredRangeData, rangeValueFields) ? (
                    <AmUniversalChart
                      chartType="column"
                      data={filteredRangeData}
                      width="100%"
                      height="100%"
                      legendEnabled={rangeChartFields.length > 1} 
                      tooltipEnabled={true}
                      labelText="{valueY}"
                      seriesFields={rangeChartFields} 
                    />
                  ) : (
                    <Typography align="center" sx={{ padding: "20px" }}>
                      ไม่มีข้อมูล
                    </Typography>
                  )}

                  {filteredRangeData.length < rangeData.length &&
                    !isAllValuesZero(filteredRangeData, rangeValueFields) && (
                      <Grid style={{ marginTop: "1rem" }}>
                        <Button variant="outlined" onClick={handleShowAll}>
                          Show All
                        </Button>
                      </Grid>
                    )}
                </Card>
              </Grid>

              {/* ===== 5 อันดับเขตสุขภาพ ===== */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card className={styles.chartCard}>
                  <Grid className={styles.charttitle2}>
                    <Typography className={styles.charttitle1}>5 อันดับเขตสุขภาพ</Typography>
                    <Typography className={styles.charttitles}>
                      <span className={styles.charttitle1s} />
                      จำนวนคน
                    </Typography>
                    <FormControl size="small">
                      <Select
                        className={styles.filterfilter}
                        value={healthFilter}
                        onChange={handleHealthFilterChange}
                        IconComponent={KeyboardArrowDownIcon}
                      >
                        <MenuItem value="all">
                          <em>ทั้งหมด</em>
                        </MenuItem>
                        {qualifierTypeOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {isLoading ? (
                    <Typography align="center" sx={{ padding: "20px" }}>
                      Loading...
                    </Typography>
                  ) : !isAllValuesZero(topHealthRegionData, ["value"]) ? (
                    <AmUniversalChart
                      chartType="bar"
                      data={topHealthRegionData}
                      width="100%"
                      height="322px"
                      legendEnabled={false}
                      tooltipEnabled={true}
                      labelText="{valueY}"
                      colors={["#27CFA7"]}
                    />
                  ) : (
                    <Typography align="center" sx={{ padding: "20px" }}>
                      ไม่มีข้อมูล
                    </Typography>
                  )}
                </Card>
              </Grid>

              {/* ===== 3-Year Trend ===== */}
              <Grid size={{ xs: 12 }}>
                <Card className={styles.chartCard2}>
                  <Grid className={styles.charttitle}>
                    <Typography className={styles.charttitle1}>
                      ตารางเปรียบเทียบ 3 ปี
                    </Typography>
                    {!isAllValuesZero(threeYearData, seriesFields.map((sf) => sf.field)) && (
                      <Grid className={styles.chartspan}>
                        {seriesFields.map((series) => (
                          <Typography key={series.field}>
                            <span
                              style={{
                                display: "inline-block",
                                width: "10px",
                                height: "10px",
                                backgroundColor: series.color,
                                marginRight: "5px",
                                borderRadius: "50%",
                              }}
                            />
                            {`ปี ${series.name}`}
                          </Typography>
                        ))}
                        <Button className={styles.moreInfo} onClick={handleOpenModal}>
                        <em className="icon-search"></em>
                          ดูเพิ่มเติม
                        </Button>
                      </Grid>
                    )}
                  </Grid>

                  {isLoading ? (
                    <Typography align="center" sx={{ padding: "20px" }}>
                      Loading...
                    </Typography>
                  ) : !isAllValuesZero(threeYearData, seriesFields.map((sf) => sf.field)) ? (
                    <AmUniversalChart
                      chartType="line"
                      data={threeYearData}
                      width="100%"
                      height="322px"
                      legendEnabled={false}
                      tooltipEnabled={true}
                      labelText="{valueY}"
                      seriesFields={seriesFields}
                      showLineBullets={false}
                    />
                  ) : (
                    <Typography align="center" sx={{ padding: "20px" }}>
                      ไม่มีข้อมูล
                    </Typography>
                  )}
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* ===== Modal for "ดูเพิ่มเติม" ===== */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 1200,
            height: 1200,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {/* Modal Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography id="modal-title" variant="h6" component="h2" color="#3C8638">
              ตารางเปรียบเทียบ 3 ปี
            </Typography>
            <Box display="flex" alignItems="center">
              <Box display="flex" justifyContent="flex-end" mb={1}>
                {seriesFields.map((series) => (
                  <Typography
                    key={series.field}
                    sx={{ display: "flex", alignItems: "center", mr: 2 }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        backgroundColor: series.color,
                        borderRadius: "50%",
                        marginRight: "5px",
                      }}
                    />
                    {`ปี ${series.name}`}
                  </Typography>
                ))}
              </Box>
              <Button onClick={handleCloseModal}>
                <CloseIcon />
              </Button>
            </Box>
          </Box>

          {/* Modal Content */}
          <Box>
            {/* Line Chart */}
            <Box mb={3}>
              <AmUniversalChart
                chartType="line"
                data={threeYearData}
                width="100%"
                height="300px"
                legendEnabled={false}
                tooltipEnabled={true}
                labelText="{valueY}"
                seriesFields={seriesFields}
                showLineBullets={false}
              />
            </Box>

            {/* Table */}
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 500 }} aria-label="three-year-data-table">
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell align="center">
                      <CustomTableSortLabel
                        active={orderBy === "index"}
                        direction={orderBy === "index" ? order : "asc"}
                        onClick={handleSort("index")}
                        hideSortIcon={false}
                        IconComponent={() => (
                          <CustomSortIcon
                            direction={orderBy === "index" ? order : "asc"}
                            active={orderBy === "index"}
                          />
                        )}
                      >
                        ลำดับ
                      </CustomTableSortLabel>
                    </TableCell>
                    <TableCell align="center">
                      <CustomTableSortLabel
                        active={orderBy === "category"}
                        direction={orderBy === "category" ? order : "asc"}
                        onClick={handleSort("category")}
                        hideSortIcon={false}
                        IconComponent={() => (
                          <CustomSortIcon
                            direction={orderBy === "category" ? order : "asc"}
                            active={orderBy === "category"}
                          />
                        )}
                      >
                        ปีพ.ศ.
                      </CustomTableSortLabel>
                    </TableCell>
                    <TableCell align="center">
                      <CustomTableSortLabel
                        active={orderBy === "total"}
                        direction={orderBy === "total" ? order : "asc"}
                        onClick={handleSort("total")}
                        hideSortIcon={false}
                        IconComponent={() => (
                          <CustomSortIcon
                            direction={orderBy === "total" ? order : "asc"}
                            active={orderBy === "total"}
                          />
                        )}
                      >
                        จำนวนเฉลี่ย
                      </CustomTableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedData.map((dataPoint, index) => (
                    <TableRow key={dataPoint.category}>
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{dataPoint.category}</TableCell>
                      <TableCell align="center">{dataPoint.total || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

/** ============================
 *  getServerSideProps (SSR)
 * ============================ */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
      overviewData: null,
    },
  };
}

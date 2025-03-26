// import React, { useMemo, useState, useRef } from "react";
// import dynamic from "next/dynamic";
// import Image from "next/image";
// // Protect ReportPage with server-side session check.
// import { GetServerSideProps } from "next";
// import { getSession } from "next-auth/react";
// import {
//   Typography,
//   Select,
//   MenuItem,
//   FormControl,
//   SelectChangeEvent,
//   InputLabel,
//   Button,
//   ListItem,
//   Box
// } from "@mui/material";
// import Grid from "@mui/material/Grid2";
// import dayjs, { Dayjs } from "dayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// import styles from "@/styles/report/report.module.css";
// import districtsGeoJSON from "@/data/json/districts.json";
// import subdistrictsGeoJSON from "@/data/json/subdistricts.json";
// import { healthRegions } from "@/data/common/data-filter-map";
// import InputSelect from "@/components/common/InSelect";
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // Add this import
// import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// const AmUniversalChart = dynamic(() => import("@/components/chart/AmChart"), { ssr: false });
// const MapThai = dynamic(() => import("@/components/common/MapThai"), { ssr: false });
// const LineChart = dynamic(() => import("@/components/chart/LineChart"), {
//   ssr: false,
// });
// type DateValue = Dayjs | null;
// type ThailandFeature = {
//   properties: {
//     pro_th: string;
//     amp_th: string;
//     tam_th: string;
//   };
// };
// type ThailandData = {
//   features: ThailandFeature[];
// };
// type DataSelect = {
//   id: number;
//   name: string;
// };
// const mockData = {
//   province: [
//     { _id: "1", name: "กรุงเทพมหานคร", value: 20, count_all: 100, count_selected: 20, percentage: 20 },
//   ],
//   district: [
//     { _id: "2", provence: "กรุงเทพมหานคร", name: "สายไหม", value: 10, count_all: 50, count_selected: 10, percentage: 20 },
//     { _id: "3", provence: "กรุงเทพมหานคร", name: "คันนายาว", value: 10, count_all: 50, count_selected: 10, percentage: 20 },
//   ],
//   subdistrict: [
//     { _id: "4", provence: "กรุงเทพมหานคร", district: "สายไหม", name: "สายไหม", value: 10, count_all: 25, count_selected: 10, percentage: 40 },
//     { _id: "5", provence: "กรุงเทพมหานคร", district: "คันนายาว", name: "คันนายาว", value: 10, count_all: 25, count_selected: 10, percentage: 40 },
//   ],
// };

// const mockDataGender = [
//   {
//     id: 1,
//     name: "เพศทั้งหมด",
//   },
//   {
//     id: 2,
//     name: "ชาย",
//   },
//   {
//     id: 3,
//     name: "หญิง",
//   },
// ];

// const dailyWeightData = [
//   { category: "11 ก.พ.", weight: 800000 },
//   { category: "12 ก.พ.", weight: 720000 },
//   { category: "13 ก.พ.", weight: 680000 },
//   { category: "14 ก.พ.", weight: 640000 },
//   { category: "15 ก.พ.", weight: 600000 },
//   { category: "16 ก.พ.", weight: 580000 },
//   { category: "17 ก.พ.", weight: 560000 },
// ];
// const totalWeightReduced = 10000000;
// const fullBmiData = [
//   { category: "ผอม", value: 4400 },
//   { category: "ปกติ", value: 3700 },
//   { category: "น้ำหนักเกิน", value: 2500 },
//   { category: "อ้วน", value: 3000 },
//   { category: "อ้วนอันตราย", value: 2000 },
// ];
// export default function ReportPage() {
//   const [bmiValue, setBmiValue] = useState("");
//   const [genderValue, setGenderValue] = useState("");
//   const [zoneValue, setZoneValue] = useState("");
//   const [select1, setSelect1] = useState("all");
//   const [select2, setSelect2] = useState("all");
//   const [select3, setSelect3] = useState("all");
//   const [select4, setSelect4] = useState("all");
//   const [filteredData, setFilteredData] = useState(fullBmiData);
//   const [startDate, setStartDate] = useState<DateValue>(null);
//   const [endDate, setEndDate] = useState<DateValue>(null);
//   const [openStart, setOpenStart] = useState<boolean>(false);
//   const [openEnd, setOpenEnd] = useState<boolean>(false);
//   const startDateRef = useRef<HTMLDivElement>(null);
//   const endDateRef = useRef<HTMLDivElement>(null);
//   const handleBarClick = (category: string, value: number) => {
//     const newData = fullBmiData.filter((item) => item.category === category);
//     setFilteredData(newData);
//   };
//   const handleShowAll = () => {
//     setFilteredData(fullBmiData);
//   };
//   const handleDateChange = (newDate: Dayjs | null) => {
//   };
//   const handleStartDateChange = (newValue: DateValue) => {
//     setStartDate(newValue);
//     if (endDate && newValue && newValue.isAfter(endDate)) {
//       setEndDate(null); // Clear endDate if new startDate is after it
//     }
//     setOpenStart(false); // Close picker
//   };

//   const handleEndDateChange = (newValue: DateValue) => {
//     if (startDate && newValue && newValue.isBefore(startDate)) {
//       setStartDate(newValue); // Reset startDate if endDate is before it
//       setEndDate(null);
//     } else {
//       setEndDate(newValue);
//     }
//     setOpenEnd(false); // Close picker
//   };
//   const handleBmiChange = (event: SelectChangeEvent) => setBmiValue(event.target.value);
//   const handleGenderChange = (event: SelectChangeEvent) => setGenderValue(event.target.value);
//   const handleZoneChange = (event: SelectChangeEvent) => setZoneValue(event.target.value);
//   const [gender, setGender] = useState<DataSelect | null>(mockDataGender[0]);
//   const geoJsonThaiDistrict = useMemo(() => districtsGeoJSON as ThailandData, []);
//   const geoJsonThaiSubdistrict = useMemo(() => subdistrictsGeoJSON as ThailandData, []);
//   const findProvince = useMemo(() => {
//     const provinces = select1 === "all" ? [] : select1.split(",");
//     return [...provinces];
//   }, [select1]);
//   const findDistrict = useMemo(() => {
//     const districts = geoJsonThaiDistrict.features
//       .filter((item) => item.properties.pro_th === select2)
//       .map((item) => item.properties.amp_th);
//     return [...districts];
//   }, [select2]);
//   const findSubdistrict = useMemo(() => {
//     const subdistricts = geoJsonThaiSubdistrict.features
//       .filter((item) => item.properties.amp_th === select3)
//       .map((item) => item.properties.tam_th);
//     return [...subdistricts];
//   }, [select3]);
//   const dataGeoFilter = useMemo(
//     () => ({
//       healthRegions,
//       provinces: findProvince,
//       districts: findDistrict,
//       subdistricts: findSubdistrict,
//     }),
//     [findProvince, findDistrict, findSubdistrict]
//   );
//   const handleChange = (event: SelectChangeEvent) => {
//     const { name, value } = event.target;
//     if (name === "select1") {
//       setSelect1(value);
//       resetStateInput(1);
//     } else if (name === "select2") {
//       setSelect2(value);
//       resetStateInput(2);
//     } else if (name === "select3") {
//       setSelect3(value);
//       resetStateInput(3);
//     } else if (name === "select4") {
//       setSelect4(value);
//     }
//   };
//   const resetStateInput = (mode: number) => {
//     if (mode === 1) {
//       setSelect2("all");
//       setSelect3("all");
//       setSelect4("all");
//     } else if (mode === 2) {
//       setSelect3("all");
//       setSelect4("all");
//     } else if (mode === 3) {
//       setSelect4("all");
//     }
//   };
//   return (
//     <Grid className={styles.chartContainer}>
//       <Grid container className={styles.main}>
//         {/* MAIN CONTENT */}
//         <Grid container spacing={2} className={styles.mainContent}>
//           {/* LEFT SIDE - Map */}
//           <Grid size={{ xs: 12, md: 4 }} display={'flex'} flexDirection={'column'} >
//             <Grid className={styles.title}>รายงานการนับคาร์บ</Grid>
//             <Grid className={styles.mapCard}>
//               <MapThai
//                 section={select1}
//                 province={select2}
//                 district={select3}
//                 subdistrict={select4}
//                 data={mockData}
//                 team={2}
//               />
//             </Grid>
//           </Grid>
//           {/* RIGHT SIDE - Chart and Banners */}
//           <Grid size={{ xs: 12, md: 8 }} className={styles.rightContent} >
//             <Grid display={'flex'} flexDirection={'column'} width={'100%'}>
//               {/* FILTER BAR */}
//               <Grid size={{ xs: 12 }} className={styles.filterBar} display={"flex"} justifyContent={"flex-end"}>
//                 <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
//                   <Grid size={{ xs: "auto" }}>
//                     <Grid container alignItems="center" spacing={2}>
//                       {/* Date Range Picker */}
//                       <Grid size={{ xs: "auto" }}>
//                         <LocalizationProvider dateAdapter={AdapterDayjs}>
//                           <Box
//                             sx={{
//                               display: 'flex',
//                               border: '1px solid #D4D1D3',
//                               borderRadius: '4px',
//                               overflow: 'hidden',
//                               height: '40px', // Match small TextField height
//                               backgroundColor: '#fff',
//                             }}
//                           >
//                             {/* Start Date Side */}
//                             <Box
//                               ref={startDateRef}
//                               sx={{
//                                 flex: 1,
//                                 padding: '8px',
//                                 cursor: 'pointer',
//                                 backgroundColor: openStart ? '#f5f5f5' : 'inherit',
//                                 minWidth: '120px',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                               }}
//                               onClick={() => setOpenStart(true)}
//                             >
//                               <Typography variant="body2" color={startDate ? 'textPrimary' : 'textSecondary'}>
//                                 {startDate ? startDate.format('DD/MM/YYYY') : 'Start Date'}
//                               </Typography>
//                             </Box>
//                             {/* Separator (Arrow Icon) */}
//                             <Box
//                               sx={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 px: 1, // Same padding as before
//                               }}
//                             >
//                               <ArrowForwardIcon sx={{ fontSize: '16px', color: '#D4D1D3' }} />
//                             </Box>
//                             {/* End Date Side with Calendar Icon */}
//                             <Box
//                               ref={endDateRef}
//                               sx={{
//                                 flex: 1,
//                                 padding: '8px',
//                                 cursor: 'pointer',
//                                 backgroundColor: openEnd ? '#f5f5f5' : 'inherit',
//                                 minWidth: '120px',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'space-between',
//                                 pr: 1,
//                               }}
//                               onClick={() => setOpenEnd(true)}
//                             >
//                               <Typography variant="body2" color={endDate ? 'textPrimary' : 'textSecondary'}>
//                                 {endDate ? endDate.format('DD/MM/YYYY') : 'End Date'}
//                               </Typography>
//                               <CalendarTodayIcon sx={{ fontSize: '16px', color: '#D4D1D3' }} />
//                             </Box>
//                           </Box>

//                           {/* Hidden DatePickers with custom Popper positioning */}
//                           <DatePicker
//                             open={openStart}
//                             onOpen={() => setOpenStart(true)}
//                             onClose={() => setOpenStart(false)}
//                             value={startDate}
//                             onChange={handleStartDateChange}
//                             format="DD/MM/YYYY"
//                             slotProps={{
//                               textField: { sx: { display: 'none' } },
//                               popper: {
//                                 anchorEl: startDateRef.current,
//                                 placement: 'bottom-start',
//                               },
//                             }}
//                             maxDate={endDate || undefined}
//                           />
//                           <DatePicker
//                             open={openEnd}
//                             onOpen={() => setOpenEnd(true)}
//                             onClose={() => setOpenEnd(false)}
//                             value={endDate}
//                             onChange={handleEndDateChange}
//                             format="DD/MM/YYYY"
//                             slotProps={{
//                               textField: { sx: { display: 'none' } },
//                               popper: {
//                                 anchorEl: endDateRef.current,
//                                 placement: 'bottom-start',
//                               },
//                             }}
//                             minDate={startDate || undefined}
//                           />
//                         </LocalizationProvider>
//                       </Grid>
//                       {/* Gender Filter */}
//                       <Grid size={{ xs: "auto" }}>
//                         <InputSelect
//                           width={126}
//                           value={gender?.id}
//                           dataItem={mockDataGender.map((item: DataSelect, index) => (
//                             <ListItem
//                               onClick={() => setGender(item)}
//                               key={index}
//                               data-id={item.id}
//                               data-value={item.name}
//                             />
//                           ))}
//                         />
//                       </Grid>
//                       {/* Region / Province / District / Subdistrict */}
//                       <Grid container spacing={2}>
//                         <Grid minWidth={200}>
//                           <FormControl fullWidth>
//                             <InputLabel id="label-select1"></InputLabel>
//                             <Select
//                               labelId="label-select1"
//                               id="select1"
//                               value={select1}
//                               IconComponent={KeyboardArrowDownIcon}

//                               name="select1"
//                               onChange={handleChange}
//                               className={styles.filterZone}
//                             >
//                               <MenuItem value={"all"}>ประเทศไทย</MenuItem>
//                               {healthRegions.map((item) => (
//                                 <MenuItem key={item.id} value={item.provinces.join(",")}>
//                                   {item.name}
//                                 </MenuItem>
//                               ))}
//                             </Select>
//                           </FormControl>
//                         </Grid>
//                         {select1 !== "all" && (
//                           <Grid minWidth={200}>
//                             <FormControl fullWidth>
//                               <InputLabel id="label-select2">จังหวัด</InputLabel>
//                               <Select
//                                 labelId="label-select2"
//                                 id="select2"
//                                 value={select2}
//                                 name="select2"
//                                 IconComponent={KeyboardArrowDownIcon}

//                                 className={styles.filterZone}
//                                 onChange={handleChange}
//                               >
//                                 <MenuItem value={"all"}>ทุกจังหวัด</MenuItem>
//                                 {dataGeoFilter.provinces.map((province, index) => (
//                                   <MenuItem key={index} value={province}>
//                                     {province}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                             </FormControl>
//                           </Grid>
//                         )}
//                         {select1 !== "all" && select2 !== "all" && (
//                           <Grid minWidth={200}>
//                             <FormControl fullWidth>
//                               <InputLabel id="label-select3">อำเภอ</InputLabel>
//                               <Select
//                                 labelId="label-select3"
//                                 id="select3"
//                                 value={select3}
//                                 IconComponent={KeyboardArrowDownIcon}

//                                 name="select3"
//                                 className={styles.filterZone}
//                                 onChange={handleChange}
//                               >
//                                 <MenuItem value={"all"}>ทุกอำเภอ</MenuItem>
//                                 {dataGeoFilter.districts.map((district, index) => (
//                                   <MenuItem key={index} value={district}>
//                                     {district}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                             </FormControl>
//                           </Grid>
//                         )}
//                         {select1 !== "all" && select2 !== "all" && select3 !== "all" && (
//                           <Grid minWidth={200}>
//                             <FormControl fullWidth>
//                               <InputLabel id="label-select4">ตำบล</InputLabel>
//                               <Select
//                                 labelId="label-select4"
//                                 id="select4"
//                                 value={select4}
//                                 IconComponent={KeyboardArrowDownIcon}

//                                 name="select4"
//                                 className={styles.filterZone}
//                                 onChange={handleChange}
//                               >
//                                 <MenuItem value={"all"}>ทุกตำบล</MenuItem>
//                                 {dataGeoFilter.subdistricts.map((subdistrict, index) => (
//                                   <MenuItem key={index} value={subdistrict}>
//                                     {subdistrict}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                             </FormControl>
//                           </Grid>
//                         )}
//                       </Grid>
//                     </Grid>
//                   </Grid>
//                 </Grid>
//               </Grid>
//               <Grid className={styles.rightContentTop} minHeight={'396px'}>
//                 <Grid className={styles.chart1} display={'flex'} flexDirection={'column'}>
//                   <Grid className={styles.charttitle}>
//                     <Typography className={styles.charttitle1}>จำนวนผู้เรียนนับคาร์บรายวัน</Typography>
//                     <Typography>  <span className={styles.charttitle1s}
//                     />จำนวนคน</Typography>
//                   </Grid>
//                   <AmUniversalChart
//                     chartType="column"
//                     data={filteredData}
//                     width="100%"
//                     height="100%"
//                     legendEnabled={false}
//                     tooltipEnabled={true}
//                     showValueLabels={false}
//                     labelText="{valueY}"
//                     colors={["#2CAB68"]}
//                     onBarClick={handleBarClick}
//                   />
//                 </Grid>
//                 {/* Show All button if filtered */}
//                 {filteredData.length < fullBmiData.length && (
//                   <Grid style={{ marginTop: "1rem" }}>
//                     <Button variant="outlined" onClick={handleShowAll}>
//                       Show All
//                     </Button>
//                   </Grid>
//                 )}
//                 {/* Banners */}
//                 <Grid display={'flex'} flexDirection={'column'} className={styles.banner}>
//                   <Grid height={'50%'} className={styles.banner1}>
//                     <Grid className={styles.banner1Text}>
//                       <Typography variant="h6" className={styles.bannerTitle}>
//                         จำนวนผู้เรียนบัณฑิต สะสมทั้งหมด
//                       </Typography>
//                       <Typography variant="h3" className={styles.bannerValue}>
//                         20,000,000
//                       </Typography>
//                       <Typography variant="h3" className={styles.bannerValue2}>
//                         คน
//                       </Typography>
//                     </Grid>
//                     <Image
//                       className={styles.banner1l}
//                       src="/images/report/banner1l.png"
//                       width={98.35646604925333}
//                       height={98.82706998183052}
//                       alt="banner-left"
//                     />
//                     <Image
//                       className={styles.banner1r}
//                       src="/images/report/banner1r.png"
//                       width={156.77827751193485}
//                       height={156.77827751193485}
//                       alt="banner-right"
//                     />
//                   </Grid>
//                   <Grid height={'50%'} className={styles.banner2}>
//                     <Grid className={styles.banner2Text}>
//                       <Image
//                         className={styles.polygon}
//                         src="/images/report/polygon.png"
//                         width={156.77827751193485}
//                         height={156.77827751193485}
//                         alt="banner2-deco"
//                         style={{ display: "block" }}
//                       />
//                       <Image
//                         className={styles.polygon2}
//                         src="/images/report/polygon.png"
//                         width={156.77827751193485}
//                         height={156.77827751193485}
//                         alt="banner2-deco"
//                         style={{ display: "block" }}
//                       />
//                       <Image
//                         className={styles.polygon3}
//                         src="/images/report/polygon.png"
//                         width={156.77827751193485}
//                         height={156.77827751193485}
//                         alt="banner2-deco"
//                         style={{ display: "block" }}
//                       />
//                       <Typography variant="h6" className={styles.bannerTitle}>
//                         น้ำหนักสะสมทั้งหมด
//                       </Typography>
//                       <Typography variant="h3" className={styles.bannerValue}>
//                         80,000,000
//                       </Typography>
//                       <Typography variant="h3" className={styles.bannerValue2}>
//                         กิโลกรัม
//                       </Typography>
//                     </Grid>
//                     <Image
//                       className={styles.banner2r}
//                       src="/images/report/banner2r.png"
//                       width={156.77827751193485}
//                       height={156.77827751193485}
//                       alt="banner2-deco"
//                       style={{ display: "block" }}
//                     />
//                   </Grid>
//                 </Grid>
//               </Grid>
//               <Grid className={styles.rightContentBottom} minHeight={'396px'}>
//                 <Grid className={styles.chart2}
//                 ><Grid className={styles.charttitle}><Typography className={styles.charttitle2}>ผลการลดน้ำหนักรายวัน</Typography>
//                     <Typography>  <span className={styles.charttitle2s}
//                     />กิโลกรัม</Typography></Grid>
//                   <AmUniversalChart
//                     chartType="line"
//                     data={dailyWeightData}
//                     width="100%"
//                     height="80%"
//                     seriesFields={[
//                       { field: "weight", name: "น้ำหนัก (kg)", color: "#007BFF" },
//                     ]}
//                     legendEnabled={false}
//                     tooltipEnabled={true}
//                     showLineBullets={true}
//                     labelText="{valueY} units"
//                     colors={["#27CFA7"]}
//                     onBarClick={handleBarClick}
//                   />
//                   <Grid className={styles.chart2b}>
//                     <Typography className={styles.chart2b1} variant="h6" >
//                       ผลการลดน้ำหนักสะสมทั้งหมด :</Typography>
//                     <Typography variant="h6" className={styles.chart2b2} >{`${totalWeightReduced} kg`}
//                     </Typography>
//                   </Grid> </Grid>
//                 <Grid className={styles.chart3}>
//                   <Grid className={styles.charttitle}><Typography className={styles.charttitle3}>ผล BMI รายวัน</Typography>
//                     <Typography className={styles.charttitle3r}>  <span className={styles.charttitle3s}
//                     /> {` กิโลกรัม/เมตร\u00B2`}</Typography></Grid>
//                   <AmUniversalChart
//                     chartType="line"
//                     data={dailyWeightData}
//                     seriesFields={[
//                       { field: "weight", name: "น้ำหนัก (kg)", color: "#05C283" },
//                     ]}
//                     width="100%"
//                     height="80%"
//                     legendEnabled={false}
//                     tooltipEnabled={true}
//                     showLineBullets={true}
//                     labelText="{valueY} units"
//                     colors={["#05C283"]}
//                     onBarClick={handleBarClick}
//                   /><Grid className={styles.chart3b}> <Typography className={styles.chart3b1} variant="h6" >
//                     ผลการลดน้ำหนักสะสมทั้งหมด :</Typography> <Typography variant="h6" className={styles.chart3b2} >{`${totalWeightReduced} kg/m\u00B2`}
//                     </Typography>
//                   </Grid> </Grid>
//               </Grid>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Grid>
//     </Grid>
//   );
// }


// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const session = await getSession(context);
//   if (!session) {
//     return {
//       redirect: {
//         destination: "/auth/signin",
//         permanent: false,
//       },
//     };
//   }
//   return {
//     props: { session },
//   };
// };

export default function Report() {
    return <div>Under construction</div>;
  }
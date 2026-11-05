"use client";

import React, { lazy, Suspense, useEffect, useState, useRef } from "react";
import "../../App.css";
import { subDays } from "date-fns";

import moment from "moment";
import { DateRangePicker } from "react-date-range";
import "react-toastify/dist/ReactToastify.css";

import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import axiosInstance, { hasCachedResponse } from "../../api/axios";
import Popover from "@mui/material/Popover";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { Button, Box, TextField, Tooltip, Typography } from "@mui/material";

import { IconButton } from "@mui/material";

import XLSX from "xlsx";

import CircularProgress from "@mui/material/CircularProgress";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signOut } from "../../api/session";
import "./cohort.css";
const classes = {"textField": "textField", "textSpace": "textSpace"};
import TopNav from "../../Components/TopNav/TopNav";

import SimpleSelect from "../../Components/Select/Select";

const QuestionsTable = lazy(
  () => import("../../Components/QuestionsTableCohort/QuestionsTableCohort"),
);

const games = [
  { id: "2248", name: "2248" },
  { id: "x2", name: "x2 Blocks" },
  { id: "x7", name: "Hexa" },
  { id: "MTN", name: "MTN" },
  { id: "knots", name: "Knots" },
  { id: "xblock", name: "XBlock" },
  { id: "matchme", name: "MatchMe" },
  // { id: "pairme", name: "PairMe" },
  { id: "numberblast", name: "NumberBlast" },
  { id: "2248china", name: "2248 China" },
  { id: "x2china", name: "x2 China" },
];

export default function Dashboard(props) {
  const [count, setCount] = useState(0);
  const scroll = useRef(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const location = { pathname, search: `?${searchParams.toString()}` };
  const [DW, setDW] = useState(false);
  const [GW, setGW] = useState(false);
  const [location1, setLocation] = useState(location);
  const [view, setView] = useState("");
  const [campID, setCampID] = useState("");
  const [netID, setNetID] = useState("");
  const [gID, setGID] = useState("");
  const [gameID, setGameID] = useState("All");
  const [NetworkID, setNetworkID] = useState("All");
  const [GeoID, setGeoID] = useState("");
  // const navigateSearch = useNavigateSearch();
  const [list, setList] = useState([]);
  const [list1, setList1] = useState([]);
  const [list2, setList2] = useState([
    "UK",
    "US",
    "BY",
    "CY",
    "LC",
    "BG",
    "NG",
    "UA",
    "MH",
    "KP",
    "HR",
    "MV",
    "RW",
    "AD",
    "NA",
    "AF",
    "TG",
    "MD",
    "CU",
    "PG",
    "WS",
    "CF",
    "MS",
    "BS",
    "JO",
    "HK",
    "SI",
    "SA",
    "SL",
    "GH",
    "SJ",
    "ER",
    "CN",
    "ME",
    "SH",
    "FJ",
    "MT",
    "SO",
    "EG",
    "CK",
    "NP",
    "GA",
    "SN",
    "ZW",
    "GF",
    "JE",
    "LB",
    "SG",
    "UY",
    "LT",
    "BN",
    "MO",
    "CR",
    "FI",
    "NU",
    "BB",
    "AE",
    "BZ",
    "NI",
    "MX",
    "ZM",
    "KI",
    "CI",
    "QA",
    "KG",
    "IM",
    "FK",
    "GG",
    "PH",
    "TH",
    "TZ",
    "SR",
    "PR",
    "IL",
    "AZ",
    "GW",
    "VA",
    "DJ",
    "CO",
    "VG",
    "VC",
    "MR",
    "GL",
    "IR",
    "NC",
    "KN",
    "BA",
    "AL",
    "KE",
    "CL",
    "IS",
    "TC",
    "DO",
    "TO",
    "PW",
    "RO",
    "VN",
    "DK",
    "TV",
    "RS",
    "GU",
    "MZ",
    "DM",
    "SZ",
    "RE",
    "TD",
    "MQ",
    "IT",
    "GM",
    "GI",
    "CG",
    "TL",
    "MC",
    "PT",
    "GR",
    "TN",
    "GD",
    "IE",
    "NF",
    "PL",
    "AO",
    "GN",
    "AR",
    "AG",
    "AS",
    "PK",
    "SM",
    "YT",
    "KZ",
    "SV",
    "CA",
    "DZ",
    "AT",
    "FO",
    "JM",
    "ES",
    "TW",
    "IQ",
    "BE",
    "LR",
    "PF",
    "BW",
    "CH",
    "TF",
    "LU",
    "BH",
    "LI",
    "BF",
    "PS",
    "OM",
    "LV",
    "GQ",
    "AU",
    "CX",
    "TR",
    "JP",
    "IN",
    "SE",
    "LS",
    "GE",
    "BI",
    "PE",
    "KR",
    "MY",
    "BO",
    "HT",
    "GY",
    "NE",
    "KY",
    "WF",
    "CD",
    "SC",
    "PN",
    "BT",
    "RU",
    "CC",
    "HU",
    "CZ",
    "PY",
    "YE",
    "BR",
    "MN",
    "CM",
    "MW",
    "UZ",
    "SD",
    "MG",
    "GP",
    "TT",
    "EE",

    "BV",
    "ML",
    "SK",
    "LA",
    "NZ",
    "AW",
    "IO",
    "MK",
    "TK",
    "AQ",
    "ID",
    "UM",
    "SY",
    "VI",
    "BJ",
    "NO",
    "FR",
    "SB",
    "ZA",
    "DE",
    "TJ",
    "EH",
    "KH",
    "VU",
    "TM",
    "FM",
    "MM",
    "HN",
    "BM",
    "AN",
    "KW",
    "ET",
    "MA",
    "MP",
    "CV",
    "BD",
    "NL",
    "PM",
    "MU",
    "KM",
    "GT",
    "HM",
    "AM",
    "AI",
    "ST",
    "GS",
    "UG",
    "EC",
    "LY",
    "PA",
    "NR",
    "VE",
    "LK",
    "UK",
    "BY",
    "CY",
    "LC",
    "BG",
    "NG",
    "UA",
    "MH",
    "KP",
    "HR",
    "MV",
    "RW",
    "AD",
    "NA",
    "AF",
    "TG",
    "MD",
    "CU",
    "PG",
    "WS",
    "CF",
    "MS",
    "BS",
    "JO",
    "HK",
    "SI",
    "SA",
    "SL",
    "GH",
    "SJ",
    "ER",
    "CN",
    "ME",
    "SH",
    "FJ",
    "MT",
    "SO",
    "EG",
    "CK",
    "NP",
    "GA",
    "SN",
    "ZW",
    "GF",
    "JE",
    "LB",
    "SG",
    "UY",
    "LT",
    "BN",
    "MO",
    "CR",
    "FI",
    "NU",
    "BB",
    "AE",
    "BZ",
    "NI",
    "MX",
    "ZM",
    "KI",
    "CI",
    "QA",
    "KG",
    "IM",
    "FK",
    "GG",
    "PH",
    "TH",
    "TZ",
    "SR",
    "PR",
    "IL",
    "AZ",
    "GW",
    "VA",
    "DJ",
    "CO",
    "VG",
    "VC",
    "MR",
    "GL",
    "IR",
    "NC",
    "KN",
    "BA",
    "AL",
    "KE",
    "CL",
    "IS",
    "TC",
    "DO",
    "TO",
    "PW",
    "RO",
    "VN",
    "DK",
    "TV",
    "RS",
    "GU",
    "MZ",
    "DM",
    "SZ",
    "RE",
    "TD",
    "MQ",
    "IT",
    "GM",
    "GI",
    "CG",
    "TL",
    "MC",
    "PT",
    "GR",
    "TN",
    "GD",
    "IE",
    "NF",
    "PL",
    "AO",
    "GN",
    "AR",
    "AG",
    "AS",
    "PK",
    "SM",
    "YT",
    "KZ",
    "SV",
    "CA",
    "DZ",
    "AT",
    "FO",
    "JM",
    "ES",
    "TW",
    "IQ",
    "BE",
    "LR",
    "PF",
    "BW",
    "CH",
    "TF",
    "LU",
    "BH",
    "LI",
    "BF",
    "PS",
    "OM",
    "LV",
    "GQ",
    "AU",
    "CX",
    "TR",
    "JP",
    "IN",
    "SE",
    "LS",
    "GE",
    "BI",
    "PE",
    "KR",
    "MY",
    "BO",
    "HT",
    "GY",
    "NE",
    "KY",
    "WF",
    "CD",
    "SC",
    "PN",
    "BT",
    "RU",
    "CC",
    "HU",
    "CZ",
    "PY",
    "YE",
    "BR",
    "MN",
    "CM",
    "MW",
    "UZ",

    "SD",
    "MG",
    "GP",
    "TT",
    "EE",
    "BV",
    "ML",
    "SK",
    "LA",
    "NZ",
    "AW",
    "IO",
    "MK",
    "TK",
    "AQ",
    "ID",
    "UM",
    "SY",
    "VI",
    "BJ",
    "NO",
    "FR",
    "SB",
    "ZA",
    "DE",
    "TJ",
    "EH",
    "KH",
    "VU",
    "TM",
    "FM",
    "MM",
    "HN",
    "BM",
    "AN",
    "KW",
    "ET",
    "MA",
    "MP",
    "CV",
    "BD",
    "NL",
    "PM",
    "MU",
    "KM",
    "GT",
    "HM",
    "AM",
    "AI",
    "ST",
    "GS",
    "UG",
    "EC",
    "LY",
    "PA",
    "NR",
    "VE",
    "LK",
    "RU",
  ]);
  const [showBack, setShowBack] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [backupQ, setBackupQ] = useState([]);
  const [geo1, setGeo1] = useState("");
  const [costG, setCostG] = useState(null);
  const [costL, setCostL] = useState(null);
  const [query, setQuery] = useState("A");
  const [query1, setQuery1] = useState("AIMA");
  const [game1, setGame1] = useState("2248");
  const [showFullMonthTable, setShowFullMonthTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState(
    moment().subtract(30, "days").format("YYYY-MM-DD"),
  );
  const [end, setEnd] = useState(
    moment().subtract(1, "days").format("YYYY-MM-DD"),
  );
  const signout = () => signOut(router);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const scrollLeft = () => {
    var slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft - 5000;
  };
  const [state, setState] = useState([
    {
      startDate: subDays(new Date(), 1),
      endDate: subDays(new Date(), 30),
      key: "selection",
    },
  ]);
  const [dataSets, setData] = useState([]);
  const scrollRight = () => {
    var slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft + 5000;
  };
  function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }
  const sortingQuestions = (a1, d, a2) => {
    let tempArr = [];
    
    
    if (a2 != null && a2.length > 0) {
      if (d) {
        tempArr = a2?.sort(function (a, b) {
          
          return Number(b[a1.toLowerCase()]) - Number(a[a1.toLowerCase()]);
        });
      } else {
        tempArr = a2?.sort(function (a, b) {
          
          return Number(a[a1.toLowerCase()]) - Number(b[a1.toLowerCase()]);
        });
      }
    } else {
      if (d) {
        tempArr = backupQ?.sort(function (a, b) {
          // console.log("a,b", a[selected], b[selected]);
          
          return Number(b[a1.toLowerCase()]) - Number(a[a1.toLowerCase()]);
        });
      } else {
        tempArr = backupQ?.sort(function (a, b) {
          // console.log("a,b", a[selected], b[selected]);
          
          return Number(a[a1.toLowerCase()]) - Number(b[a1.toLowerCase()]);
        });
      }
    }

    setQuestions(tempArr);
    setQuestions((prevState) => prevState);
  };

  function setFilter(data) {
    let listTemp = [];

    

    if (NetworkID === "All" && gameID === "All") {
      listTemp = data;
      // setQuestions(data);
    } else if (NetworkID === "All" && gameID !== "All") {
      listTemp = data?.filter((e) => {
        return e.game === gameID;
      });
      // setQuestions(listTemp);
    } else if (NetworkID !== "All" && gameID === "All") {
      listTemp = data?.filter((e) => {
        return e.nw === NetworkID;
      });
      // setQuestions(listTemp);
    } else {
      listTemp = data?.filter((e) => {
        return e.game === gameID && e.nw === NetworkID;
      });
      // setQuestions(listTemp);
    }
    let temp = [];

    if (Number(costG) > 0 && Number(costG) > 0) {
      temp = listTemp.filter(
        (c) =>
          Number(c.cost).toFixed(0) < Number(costL) &&
          Number(c.cost).toFixed(0) > Number(costG),
      );
      // setQuestions(temp);
    } else if (Number(costG) > 0 && !(Number(costL) > 0)) {
      temp = listTemp.filter((c) => Number(c.cost).toFixed(0) > Number(costG));
      
      // setQuestions(temp);
    } else if (Number(costL) > 0 && !(Number(costG) > 0)) {
      temp = listTemp.filter((c) => Number(c.cost).toFixed(0) < Number(costL));
      
      // setQuestions(temp);
    } else {
      temp = listTemp;
      // setQuestions(listTemp);
    }
    
    temp.length > 0
      ? sortingQuestions("Roas_D7", false, temp)
      : setQuestions(["empty"]);
  }

  const getTopQuestions = async (start1, end1, campID1, view1, e) => {
    const temp = [];
    const temp1 = [];
    // setStart(start1);
    setEnd(end1);
    setView(view1);
    setCampID(campID1);
    setGeoID(e);
    

    const requestUrl =
      start1 !== "" &&
      end1 !== "" &&
      view1 !== "" &&
      campID1 !== "" &&
      e !== "" &&
      e !== "All" &&
      list2.includes(GeoID)
        ? `cohort?start_time=${start1}&end_time=${end1}&view=${view1}&camp_id=${campID1}&geo_ID=${e}`
        : campID1 !== "" && e !== "" && e !== "All" && list2.includes(GeoID)
          ? `cohort?start_time=${start1}&end_time=${end1}&camp_id=${campID1}&geo_ID=${e}`
          : view1 !== "" && e !== "" && e !== "All" && list2.includes(GeoID)
            ? `cohort?start_time=${start1}&end_time=${end1}&view=${view1}&geo_ID=${e}`
            : view1 !== "" && campID1 !== ""
              ? `cohort?start_time=${start1}&end_time=${end1}&view=${view1}&camp_id=${campID1}`
              : campID1 === "" &&
                  e === "" &&
                  view1 !== "" &&
                  e !== "All" &&
                  list2.includes(GeoID)
                ? `cohort?start_time=${start1}&end_time=${end1}&view=${view1}`
                : view1 === "" &&
                    e === "" &&
                    campID1 !== "" &&
                    e !== "All" &&
                    list2.includes(GeoID)
                  ? `cohort?start_time=${start1}&end_time=${end1}&camp_id=${campID1}`
                  : view1 === "" &&
                      campID1 === "" &&
                      e !== "" &&
                      e !== "All" &&
                      list2.includes(GeoID)
                    ? `cohort?start_time=${start1}&end_time=${end1}&geo_ID=${e}`
                    : `cohort?start_time=${start1}&end_time=${end1}`;

    if (!hasCachedResponse(requestUrl)) setLoading(true);

    axiosInstance
      .get(
        requestUrl
      )
      .then((res) => {
        setBackupQ(res.data);
        res?.data?.sort(function (a, b) {
          return new Date(b?.date?.value) - new Date(a?.date?.value);
        });

        
        setFilter(res.data);

        res?.data?.map((item) => {
          temp.push(item.nw);
        });
        res?.data?.map((item) => {
          temp1.push(item.game);
        });

        let unique = temp.filter(onlyUnique);
        let unique1 = temp1.filter(onlyUnique);

        
        setList(unique);
        setList1(unique1);
      })
      .catch((error) => {
        console.error("Unable to load Cohort data", error);
        setBackupQ([]);
        setFilter([]);
        setList([]);
        setList1([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    
  }, [backupQ]);
  const updateGame = (game1) => {
    // setGame1(game1);
    setQuery1("AIMA");
    setQuery("A");
    getTopQuestions("AI", game1);
  };

  const handleQuery = (a, b, c, d, e) => {
    getTopQuestions(a, b, c, d, e);
  };
  const [signal, setSignal] = useState("false");
  const handleIdChange = (id) => {
    
    setSignal(!signal);
    const game = games.find((g) => g.id === id);
    document.title = game ? `${game.name}` : "X2";
    updateGame(id);

    window.location.hash = id; // set the ID as the URL hash
  };
  const handleExpand = () => {
    setShowFullMonthTable(!showFullMonthTable);
  };
  let temp = [];
  const handleDownload = () => {
    const data = questions;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${game1}-${query}.xlsx`);
  };

  useEffect(() => {
    {
      if (location1.search.length > 0 && location1.search) {
        location1.search
          .slice(1)
          .split("&")
          .map((t) => {
            temp.push(t.split("=")[1]);
          });

        getTopQuestions(start, end, campID, view, geo1);

        
      } else {
        getTopQuestions(start, end, campID, view, geo1);
      }
    }
  }, []);
  const costSearchLESS = (e) => {
    setCostL(e.target.value);
  };
  const costSearchGREATER = (e) => {
    setCostG(e.target.value);
  };

  ;

  

  useEffect(() => {
    getTopQuestions(start, end, campID, view, GeoID);
  }, [NetworkID, gameID, GeoID, costG, costL]);

  return (
    <Box>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <CircularProgress />
        </div>
      )}
      <div
        style={{
          height: "100%",
          width: "100%",
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        <div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {/* <SideBar selectedGame={game1} onIdChange={updateGame} /> */}
            <div style={{ width: "100%" }}>
              <TopNav
                setData={setData}
                dataSets={dataSets}
                setCount={setCount}
                DW={DW}
                GW={GW}
                campID={campID}
                netID={netID}
                gID={gID}
                gameID={gameID}
                NetworkID={NetworkID}
                scrollLeft={scrollLeft}
                scrollRight={scrollRight}
                signal={signal}
                handleDownload={handleDownload}
                handleExpand={handleExpand}
                showFullMonthTable={showFullMonthTable}
                signout={signout}
                handleIdChange={handleIdChange}
                games={games}
                game={game1}
                query={query}
              />
            </div>
          </div>

          <div
            id="slider"
            style={{
              width: "100%",
              marginTop: "30px",
            }}
          >
            <div
              style={{
                // height: "70px !important",
                paddingLeft: "10px",
                backgroundColor: "white",
                zIndex: 11,
                position: "fixed",
                top: !(GW || DW) ? 65 : 65,
                // marginLeft: "10px",
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "left",
                alignItems: "center",
                paddingBottom: GW || DW ? "8px" : "4px",
                // marginTop: "20px",
              }}
            >
              <div
                style={{
                  // height: "50px !important",
                  paddingTop: "5px",
                  display: "flex",
                  flexDirection: "row",
                  // alignItems: "center",
                  // justifyContent: "center",
                  // marginRight: "100px",
                }}
              >
                {!(showBack && view === "" && !DW && !GW) && (
                  <Tooltip title="Back">
                    <KeyboardBackspaceIcon
                      sx={{
                        backgroundColor: "#F3f3f3",
                        marginRight: "10px",
                        marginTop: "10px",
                        border: "1px solid black",
                      }}
                      onClick={() => {
                        setGW(false);
                        setDW(false);
                        setStart(
                          moment().subtract(30, "days").format("YYYY-MM-DD"),
                        );
                        setEnd(
                          moment().subtract(1, "days").format("YYYY-MM-DD"),
                        );
                        setCampID("");
                        setView("");
                        setNetworkID("All");
                        setGameID("All");
                        handleQuery(
                          moment().subtract(30, "days").format("YYYY-MM-DD"),
                          moment().subtract(1, "days").format("YYYY-MM-DD"),
                          "",
                          "",
                          "",
                        );
                        setShowBack(true);
                      }}
                    />
                  </Tooltip>
                )}
                <IconButton onClick={handleClick}>
                  <CalendarMonthIcon />
                </IconButton>
              </div>
              {DW || GW ? (
                <></>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    paddingRight: "10px",
                    // marginLeft: "-100px",
                  }}
                >
                  <SimpleSelect
                    value={gameID}
                    list={list1}
                    label="Game"
                    setValue={setGameID}
                  />
                  <SimpleSelect
                    value={NetworkID}
                    list={list}
                    label="Network"
                    setValue={setNetworkID}
                  />
                </div>
              )}

              {!GW && (
                <div style={{ marginTop: "10px", marginRight: "5px" }}>
                  <TextField
                    className={classes.textField}
                    onChange={(e) => {
                      e.target.value.length === 2 &&
                        setGeoID(e.target.value.toUpperCase());
                    }}
                    id="outlined-number"
                    label="Geo"
                    type="text"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                  />
                </div>
              )}
              <div style={{ marginTop: "10px" }}>
                <TextField
                  className={classes.textField}
                  onChange={costSearchLESS}
                  id="outlined-number"
                  label="Cost Less Than"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                />
              </div>
              <Typography
                sx={{
                  "margin-top": "10px",
                  "font-size": "20px",
                  "margin-left": "10px",
                }}
                className={classes.textSpace}
              >
                -
              </Typography>
              <div style={{ marginLeft: "10px ", marginTop: "10px" }}>
                <TextField
                  className={classes.textField}
                  onChange={costSearchGREATER}
                  id="outlined-number"
                  label="Cost Greater Than"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                />
              </div>
            </div>

            <div style={{ paddingTop: "100px" }}>
              <Suspense fallback={<div>Loading...</div>}>
                <QuestionsTable
                  setShowBack={showBack}
                  DW={DW}
                  GW={GW}
                  setCampID={setCampID}
                  setNetID={setNetID}
                  setGID={setGID}
                  setDW={setDW}
                  setGW={setGW}
                  start={start}
                  end={end}
                  campID={campID}
                  view={view}
                  sortingQuestions={(a, b, c) => sortingQuestions(a, b, c)}
                  scrollLeft={scrollLeft}
                  scrollRight={scrollRight}
                  reff={scroll}
                  onQueryChange={handleQuery}
                  questions={questions}
                  showFull={showFullMonthTable}
                  setLoading={setLoading}
                  game1={game1}
                  setQuestions={setQuestions}
                  backupQ={backupQ}
                  setStart={setStart}
                  setEnd={setEnd}
                  // setCampID={setCampID}
                  setView={setView}
                  setNetworkID={setNetworkID}
                  setGameID={setGameID}
                  setShowBack1={setShowBack}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>{" "}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {" "}
        <div
          style={{
            paddingBottom: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <DateRangePicker
            onChange={(item) => {
              
              setState([item.selection]);
              setStart(moment(item.selection.startDate).format("YYYY-MM-DD"));
              setEnd(moment(item.selection.endDate).format("YYYY-MM-DD"));
            }}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={state}
            direction="horizontal"
          />
          <Button
            sx={{
              height: 50,
            }}
            onClick={() => {
              start === moment().subtract(30, "days").format("YYYY-MM-DD") &&
              end === moment().subtract(1, "days").format("YYYY-MM-DD")
                ? setShowBack(true)
                : setShowBack(false);
              handleQuery(start, end, campID, view, GeoID);
            }}
          >
            Filter
          </Button>
        </div>
      </Popover>
    </Box>
  );
}

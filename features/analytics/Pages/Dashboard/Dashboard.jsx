"use client";

import { downloadRows } from "../../export";

import React, {
  useEffect,
  useState,
  useRef,
  lazy,
  Suspense,
  useMemo,
} from "react";
import "../../App.css";
import moment from "moment";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css";
import {
  getCachedOrFetch,
  getCachedResponse,
  hasCachedResponse,
  seedGetResponseCache,
} from "../../api/axios";
import { preloadAnalytics } from "../../api/preload";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import Popover from "@mui/material/Popover";
import Selector from "../../Components/Selector/Selector.js";
import { subDays } from "date-fns";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signOut } from "../../api/session";
import TopNav from "../../Components/TopNav/TopNav";
import SimpleTabsModal from "../../Components/TabPanel/TabPanelModal";
import SimpleTabs from "../../Components/TabPanel/TabPanel";
import BasicModal from "../../Components/BasicModal/BasicModal";
import { Button, IconButton, Tooltip } from "@mui/material";
import SettingsOverscanIcon from "@mui/icons-material/SettingsOverscan";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LineChart from "../../Components/Charts/LineChart";
import { getReportDay } from "../../Components/Charts/chartDates";
import DualMultiLineChart from "../../Components/Charts/DualMultiLineChart";
import { DateRangePicker } from "react-date-range";
import "./dashboard.css";
const classes = { icnBtn: "icnBtn" };
import MixChart from "../../Components/Charts/MixChart";
import EventsChart from "../../Components/Charts/EventsChart.jsx";
import useEventReports from "./useEventReports";
import DashboardMetricPopup from "./DashboardMetricPopup";
import _ from "lodash";
const QuestionsTable = lazy(
  () => import("../../Components/QuestionsTable/QuestionsTable"),
);

const games = [
  { id: "2248", name: "2248" },
  { id: "sandblast", name: "SandBlast" },
  { id: "x2", name: "x2 Blocks" },
  { id: "x7", name: "Hexa" },
  { id: "MTN", name: "MTN" },
  { id: "knots", name: "Knots" },
  { id: "xblock", name: "XBlock" },
  { id: "matchme", name: "MatchMe" },

  { id: "2248china", name: "2248 China" },
  { id: "x2china", name: "x2 China" },
];

const toMetricNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const buildDashboardComparisonSeries = (rows, start, end, metrics) => {
  if (!Array.isArray(rows)) return [];
  const buckets = new Map();

  rows.forEach((row) => {
    const date = moment(row?.Install_time?.value || row?.Install_time);
    if (
      !date.isValid() ||
      date.isBefore(start, "day") ||
      date.isAfter(end, "day")
    ) {
      return;
    }

    const key = date.format("YYYY-MM-DD");
    const bucket = buckets.get(key) || {
      date: date.clone().startOf("day").toDate(),
      values: metrics.map(() => 0),
    };

    metrics.forEach((metric, index) => {
      bucket.values[index] += toMetricNumber(metric.getValue(row));
    });
    buckets.set(key, bucket);
  });

  return Array.from(buckets.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .flatMap(([, bucket]) =>
      metrics.map((metric, index) => ({
        date: bucket.date,
        value: Math.round(bucket.values[index]),
        category: metric.name,
      })),
    );
};

/** @param {{ initialData?: { daily: object[], monthly: object[], game: string, query: string } | null }} props */
export default function Dashboard({ initialData = null }) {
  const scroll = useRef(0);
  const [showGraph, setShowGraph] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const location = { pathname, search: `?${searchParams.toString()}` };
  const [count, setCount] = useState(0);

  const [questions, setQuestions] = useState(
    () =>
      initialData?.daily ||
      getCachedResponse(
        `stackoverflow/${searchParams.get("q") || "AI"}/${searchParams.get("game") || "x2"}`,
      ) ||
      [],
  );
  const [questions1, setQuestions1] = useState(
    () =>
      initialData?.monthly ||
      getCachedResponse(
        `month/${searchParams.get("q") || "AI"}MA/${searchParams.get("game") || "x2"}`,
      ) ||
      [],
  );
  const [query, setQuery] = useState(searchParams.get("q") || "AI");
  const [game1, setGame1] = useState(searchParams.get("game") || "x2");
  const [showFullMonthTable, setShowFullMonthTable] = useState(false);
  const [showFullDataTable, setShowFullDataTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemGeo, setItemGeo] = useState("All Geo");
  const [open, setOpen] = useState({
    bool1: false,
    bool2: false,
    bool3: false,
    bool4: false,
    bool5: false,
    bool6: false,
    bool7: false,
    bool8: false,
    bool9: false,
    bool10: false,
  });
  const [dataSets, setData] = useState({
    loader: false,
    data1: [],
    data2: [],
    data3: [],
    data4: [],
    data5: [],
    data6: [],
    data7: [],
    data8: [],
    data9: [],
    data10: [],
    data11: [],
    data12: [],
    data13: [],
    data14: [],
    data15: [],
    data16: [],
    data17: [],
    data18: [],
    data19: [],
    data20: [],
    data21: [],
    data22: [],
    data23: [],
    data24: [],
    data25: [],
    data26: [],
    data27: [],
    data28: [],
    data29: [],
    data30: [],
    data31: [],
    data32: [],
    data33: [],
    data34: [],
    data35: [],
    data36: [],
    data37: [],
    data38: [],
    data39: [],
    data40: [],
    data41: [],
    data42: [],
    data43: [],
    data44: [],
    data45: [],
    data46: [],
    data47: [],
    data48: [],
    data49: [],
    data51: [],
    data50: [],
    data52: [],
    data53: [],
    data54: [],
    data55: [],
    data56: [],
    data57: [],
    data58: [],
    data59: [],
    data60: [],
    data61: [],
    data62: [],
    data63: [],
    data64: [],
    data65: [],
    data66: [],
    data67: [],
    data68: [],
    data69: [],
    data70: [],
    data71: [],
    data72: [],
    data73: [],
    data74: [],
    data75: [],
    data76: [],
    data77: [],
    data78: [],
    data79: [],
    data80: [],
  });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open1 = Boolean(anchorEl);
  const [start, setStart] = useState(moment().subtract(30, "days"));
  const [end, setEnd] = useState(moment().subtract(1, "days"));
  const {
    data: eventsData,
    dataGeo: eventsDataGeo,
    dataGeolist: eventsDataGeolist,
    loading: eventsLoading,
  } = useEventReports({ game: game1, geo: itemGeo, start, end });
  const [usersGraphOpen, setUsersGraphOpen] = useState(false);
  const [revenueSpendGraphOpen, setRevenueSpendGraphOpen] = useState(false);
  const [usersGraphPosition, setUsersGraphPosition] = useState({
    x: 320,
    y: 170,
  });
  const [usersGraphSize, setUsersGraphSize] = useState({
    width: 760,
    height: 520,
  });
  const [revenueGraphPosition, setRevenueGraphPosition] = useState({
    x: 360,
    y: 190,
  });
  const [revenueGraphSize, setRevenueGraphSize] = useState({
    width: 760,
    height: 520,
  });
  const usersGraphRef = useRef(null);
  const revenueGraphRef = useRef(null);
  const usersDragRef = useRef(null);
  const usersResizeRef = useRef(null);
  const revenueDragRef = useRef(null);
  const revenueResizeRef = useRef(null);
  const usersGraphData = useMemo(
    () =>
      buildDashboardComparisonSeries(questions, start, end, [
        { name: "New", getValue: (row) => row?.total_users },
        { name: "DAU", getValue: (row) => row?.DAU },
      ]),
    [questions, start, end],
  );
  const revenueSpendGraphData = useMemo(
    () =>
      buildDashboardComparisonSeries(questions, start, end, [
        { name: "Revenue", getValue: (row) => row?.Ad_Rev },
        {
          name: "Total Spend",
          getValue: (row) =>
            row?.total_spend ??
            [
              "Facebook_cost",
              "googleadwords_cost",
              "ironsource_cost",
              "applovin_cost",
              "unityads_cost",
              "tapjoy_cost",
              "xiaomiglobal_cost",
              "swagbucks_cost",
              "mintegral_cost",
              "adcolony_cost",
              "chartboosts2s_cost",
              "sponsorpay_cost",
            ].reduce((total, field) => total + toMetricNumber(row?.[field]), 0),
        },
      ]),
    [questions, start, end],
  );
  const id = open1 ? "simple-popover" : undefined;
  const [state, setState] = useState([
    {
      startDate: subDays(new Date(), 1),
      endDate: subDays(new Date(), 30),
      key: "selection",
    },
  ]);
  const signout = () => signOut(router);

  const scrollLeft = () => {
    var slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft - 5000;
  };

  const scrollRight = () => {
    var slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft + 5000;
  };

  const getTopQuestions = async (query, game1) => {
    const url = `stackoverflow/${query}/${game1}`;
    if (!hasCachedResponse(url)) setLoading(true);

    getCachedOrFetch(url)
      .then((res) => {
        setQuestions(res.data);
      })
      .catch((error) => {
        console.error("Unable to load Dashboard data", error);
        setQuestions([]);
        setLoading(false);
      });
  };

  const getTopQuestions1 = (query1, game1) => {
    const url = `month/${query1}/${game1}`;
    if (!hasCachedResponse(url)) setLoading(true);
    getCachedOrFetch(url)
      .then((res) => {
        setQuestions1(res.data);
      })
      .catch((error) => {
        console.error("Unable to load monthly Dashboard data", error);
        setQuestions1([]);
        setLoading(false);
      });
  };

  const updateGame = (game1) => {
    setGame1(game1);
    setQuery("AI");
    getTopQuestions("AI", game1);
    getTopQuestions1("AIMA", game1);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleExpand = () => {
    setShowFullMonthTable(!showFullMonthTable);
  };
  const handleExpandfullData = () => {
    setShowFullDataTable(!showFullDataTable);
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleQuery = (queryValue, game1) => {
    setQuery(queryValue);
    setGame1(game1);
    getTopQuestions(queryValue, game1);
    getTopQuestions1(queryValue + "MA", game1);
  };
  const [signal, setSignal] = useState("false");

  useEffect(() => {
    if (initialData?.daily) {
      seedGetResponseCache(
        `stackoverflow/${initialData.query}/${initialData.game}`,
        initialData.daily,
      );
    }
    if (initialData?.monthly) {
      seedGetResponseCache(
        `month/${initialData.query}MA/${initialData.game}`,
        initialData.monthly,
      );
    }
    return preloadAnalytics({ query, game: game1 });
  }, [initialData, query, game1]);

  const handleIdChange = (id) => {
    setSignal(!signal);
    const game = games.find((g) => g.id === id);
    document.title = game ? `${game.name}` : "X2";
    updateGame(id);
    window.location.hash = id;
  };
  let temp = [];
  const handleDownload = () =>
    downloadRows(questions, `${game1}-${query}.xlsx`);

  useEffect(() => {
    const selectedGame = searchParams.get("game") || "x2";
    const selectedQuery = searchParams.get("q") || "AI";
    setGame1(selectedGame);
    setQuery(selectedQuery);
    const savedGraph = localStorage.getItem("showGraph");
    if (savedGraph !== null) setShowGraph(savedGraph === "true");
    if (
      initialData?.game !== selectedGame ||
      initialData?.query !== selectedQuery
    ) {
      getTopQuestions(selectedQuery, selectedGame);
      getTopQuestions1(`${selectedQuery}MA`, selectedGame);
    }
  }, [searchParams, initialData]);

  React.useEffect(() => {
    let temp = _.cloneDeep(questions);
    let data1 = [];
    let data2 = [];
    let data3 = [];
    let data4 = [];
    let data5 = [];
    let data6 = [];
    let data7 = [];
    let data8 = [];
    let data9 = [];
    let data10 = [];
    let data11 = [];
    let data12 = [];
    let data13 = [];
    let data14 = [];
    let data15 = [];
    let data16 = [];
    let data17 = [];
    let data18 = [];
    let data19 = [];
    let data20 = [];
    let data21 = [];
    let data22 = [];
    let data23 = [];
    let data24 = [];
    let data25 = [];
    let data26 = [];
    let data27 = [];
    let data28 = [];
    let data29 = [];
    let data30 = [];
    let data31 = [];
    let data32 = [];
    let data33 = [];
    let data34 = [];
    let data35 = [];
    let data36 = [];
    let data37 = [];
    let data38 = [];
    let data39 = [];
    let data40 = [];
    let data41 = [];
    let data42 = [];
    let data43 = [];
    let data44 = [];
    let data45 = [];
    let data46 = [];
    let data47 = [];
    let data48 = [];
    let data49 = [];
    let data50 = [];
    let data51 = [];
    let data52 = [];
    let data53 = [];
    let data54 = [];
    let data55 = [];
    let data56 = [];
    let data57 = [];
    let data58 = [];
    let data59 = [];
    let data60 = [];
    let data61 = [];
    let data62 = [];
    let data63 = [];
    let data64 = [];
    let data65 = [];
    let data66 = [];
    let data67 = [];
    let data68 = [];
    let data69 = [];
    let data70 = [];
    let data71 = [];
    let data72 = [];
    let data73 = [];
    let data74 = [];
    let data75 = [];
    let data76 = [];
    let data77 = [];
    let data78 = [];
    let data79 = [];

    temp?.sort((a, b) => {
      return getReportDay(a?.Install_time) - getReportDay(b?.Install_time);
    });

    temp &&
      temp?.map((row) => {
        const chartDate = getReportDay(row?.Install_time);
        if (
          chartDate !== null &&
          moment(chartDate).isBetween(start, end, "day", "[]")
        ) {
          if (row?.geo) {
            data1?.push({
              date: chartDate,
              value: row?.DAU,
              category: row?.geo,
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.Facebook_cost),
              category: row?.geo,
            });
            data63?.push({
              date: chartDate,
              value: Math.round(row?.googleadwords_cost),
              category: row?.geo,
            });
            data64?.push({
              date: chartDate,
              value: Math.round(row?.ironsource_cost),
              category: row?.geo,
            });
            data65?.push({
              date: chartDate,
              value: Math.round(row?.applovin_cost),
              category: row?.geo,
            });
            data66?.push({
              date: chartDate,
              value: Math.round(row?.unityads_cost),
              category: row?.geo,
            });
            data67?.push({
              date: chartDate,
              value: Math.round(row?.tapjoy_cost),
              category: row?.geo,
            });
            data68?.push({
              date: chartDate,
              value: Math.round(row?.xiaomiglobal_cost),
              category: row?.geo,
            });
            data69?.push({
              date: chartDate,
              value: Math.round(row?.swagbucks_cost),
              category: row?.geo,
            });
            data70?.push({
              date: chartDate,
              value: Math.round(row?.mintegral_cost),
              category: row?.geo,
            });
            data71?.push({
              date: chartDate,
              value: Math.round(row?.adcolony_cost),
              category: row?.geo,
            });
            data72?.push({
              date: chartDate,
              value: Math.round(row?.chartboosts2s_cost),
              category: row?.geo,
            });
            data73?.push({
              date: chartDate,
              value: Math.round(row?.sponsorpay_cost),
              category: row?.geo,
            });

            data3?.push({
              date: chartDate,
              value: Math.round(row?.Ad_Rev),
              category: row?.geo,
            });
            data10?.push({
              date: chartDate,
              value: Math.round(row?.AdRev),
              category: row?.geo,
            });
            data11?.push({
              date: chartDate,
              value: Math.round(row?.IAP),
              category: row?.geo,
            });
            data4?.push({
              date: chartDate,
              value: row?.Facebook_cpi,
              category: row?.geo,
            });
            data5?.push({
              date: chartDate,
              value: Math.round(row?.Facebook_users),
              category: row?.geo,
            });
            data6?.push({
              date: chartDate,
              value: Math.round(row?.Facebook_cost),
              category: row?.geo,
            });
            data12?.push({
              date: chartDate,
              value: row?.googleadwords_cpi,
              category: row?.geo,
            });
            data13?.push({
              date: chartDate,
              value: Math.round(row?.googleadwords_users),
              category: row?.geo,
            });
            data14?.push({
              date: chartDate,
              value: Math.round(row?.googleadwords_cost),
              category: row?.geo,
            });
            data15?.push({
              date: chartDate,
              value: row?.ironsource_cpi,
              category: row?.geo,
            });
            data16?.push({
              date: chartDate,
              value: Math.round(row?.ironsource_users),
              category: row?.geo,
            });
            data17?.push({
              date: chartDate,
              value: Math.round(row?.ironsource_cost),
              category: row?.geo,
            });
            data18?.push({
              date: chartDate,
              value: row?.applovin_cpi,
              category: row?.geo,
            });
            data19?.push({
              date: chartDate,
              value: Math.round(row?.applovin_users),
              category: row?.geo,
            });
            data20?.push({
              date: chartDate,
              value: Math.round(row?.applovin_cost),
              category: row?.geo,
            });
            data21?.push({
              date: chartDate,
              value: row?.unityads_cpi,
              category: row?.geo,
            });
            data22?.push({
              date: chartDate,
              value: Math.round(row?.unityads_users),
              category: row?.geo,
            });
            data23?.push({
              date: chartDate,
              value: Math.round(row?.unityads_cost),
              category: row?.geo,
            });
            data24?.push({
              date: chartDate,
              value: row?.tapjoy_cpi,
              category: row?.geo,
            });
            data25?.push({
              date: chartDate,
              value: Math.round(row?.tapjoy_users),
              category: row?.geo,
            });
            data26?.push({
              date: chartDate,
              value: Math.round(row?.tapjoy_cost),
              category: row?.geo,
            });
            data27?.push({
              date: chartDate,
              value: row?.xiaomiglobal_cpi,
              category: row?.geo,
            });
            data28?.push({
              date: chartDate,
              value: Math.round(row?.xiaomiglobal_users),
              category: row?.geo,
            });
            data29?.push({
              date: chartDate,
              value: Math.round(row?.xiaomiglobal_cost),
              category: row?.geo,
            });
            data30?.push({
              date: chartDate,
              value: row?.swagbucks_cpi,
              category: row?.geo,
            });
            data31?.push({
              date: chartDate,
              value: Math.round(row?.swagbucks_users),
              category: row?.geo,
            });
            data32?.push({
              date: chartDate,
              value: Math.round(row?.swagbucks_cost),
              category: row?.geo,
            });
            data33?.push({
              date: chartDate,
              value: row?.mintegral_cpi,
              category: row?.geo,
            });
            data34?.push({
              date: chartDate,
              value: Math.round(row?.mintegral_users),
              category: row?.geo,
            });
            data35?.push({
              date: chartDate,
              value: Math.round(row?.mintegral_cost),
              category: row?.geo,
            });
            data36?.push({
              date: chartDate,
              value: row?.adcolony_cpi,
              category: row?.geo,
            });
            data37?.push({
              date: chartDate,
              value: Math.round(row?.adcolony_users),
              category: row?.geo,
            });
            data38?.push({
              date: chartDate,
              value: Math.round(row?.adcolony_cost),
              category: row?.geo,
            });
            data39?.push({
              date: chartDate,
              value: row?.chartboosts2s_cpi,
              category: row?.geo,
            });
            data40?.push({
              date: chartDate,
              value: Math.round(row?.chartboosts2s_users),
              category: row?.geo,
            });
            data41?.push({
              date: chartDate,
              value: Math.round(row?.chartboosts2s_cost),
              category: row?.geo,
            });
            data42?.push({
              date: chartDate,
              value: row?.sponsorpay_cpi,
              category: row?.geo,
            });
            data43?.push({
              date: chartDate,
              value: Math.round(row?.sponsorpay_users),
              category: row?.geo,
            });
            data44?.push({
              date: chartDate,
              value: Math.round(row?.sponsorpay_cost),
              category: row?.geo,
            });
            data45?.push({
              date: chartDate,
              value: row?.IS_cpm,
              category: row?.geo,
            });
            data46?.push({
              date: chartDate,
              value: Math.round(row?.IS_Rev),
              category: row?.geo,
            });
            data47?.push({
              date: chartDate,
              value: Math.round(row?.IS_Imp),
              category: row?.geo,
            });
            data48?.push({
              date: chartDate,
              value: row?.BR_cpm,
              category: row?.geo,
            });
            data49?.push({
              date: chartDate,
              value: Math.round(row?.BR_Rev),
              category: row?.geo,
            });
            data50?.push({
              date: chartDate,
              value: Math.round(row?.BR_Imp),
              category: row?.geo,
            });
            data51?.push({
              date: chartDate,
              value: row?.RV_cpm,
              category: row?.geo,
            });
            data52?.push({
              date: chartDate,
              value: Math.round(row?.RV_Rev),
              category: row?.geo,
            });
            data53?.push({
              date: chartDate,
              value: row?.RV_Imp,
              category: row?.geo,
            });
          } else {
            data1?.push({
              date: chartDate,
              value: row?.DAU,
              category: "DAU",
            });
            data2?.push({
              date: chartDate,
              value:
                Math.round(row?.Facebook_cost) +
                Math.round(row?.googleadwords_cost) +
                Math.round(row?.ironsource_cost) +
                Math.round(row?.applovin_cost) +
                Math.round(row?.unityads_cost) +
                Math.round(row?.tapjoy_cost) +
                Math.round(row?.xiaomiglobal_cost) +
                Math.round(row?.swagbucks_cost) +
                Math.round(row?.mintegral_cost) +
                Math.round(row?.adcolony_cost) +
                Math.round(row?.chartboosts2s_cost) +
                Math.round(row?.sponsorpay_cost),
              category: "Total",
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.Facebook_cost),
              category: "FB",
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.googleadwords_cost),
              category: "Ggl",
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.ironsource_cost),
              category: "IS",
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.applovin_cost),
              category: "AL",
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.unityads_cost),
              category: "UA",
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.tapjoy_cost),
              category: "TJ",
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.xiaomiglobal_cost),
              category: "Xiaomi",
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.swagbucks_cost),
              category: "BDG",
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.mintegral_cost),
              category: "MTG",
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.adcolony_cost),
              category: "AC",
            });
            data2?.push({
              date: chartDate,
              value: Math.round(row?.chartboosts2s_cost),
              category: "CB",
            });

            data2?.push({
              date: chartDate,
              value: Math.round(row?.sponsorpay_cost),
              category: "SP",
            });
            // data3?.push({
            //   date: chartDate,
            //   value:
            //     Math.round(row?.IAP) +
            //     Math.round(row?.Ad_Rev) +
            //     Math.round(row?.AdRev),
            //   category: "Total",
            // });
            data3?.push({
              date: chartDate,
              value: Math.round(row?.Ad_Rev),
              category: "AdRev",
            });

            data3?.push({
              date: chartDate,
              value: Math.round(row?.IAP),
              category: "IAP",
            });

            data3?.push({
              date: chartDate,
              value: Math.round(row?.AdRev),
              category: "Ad",
            });
            data4?.push({
              date: chartDate,
              value: row?.Facebook_cpi,
              category: "cpi",
            });
            data4?.push({
              date: chartDate,
              value: Math.round(row?.Facebook_users),
              category: "users",
            });
            data4?.push({
              date: chartDate,
              value: Math.round(row?.Facebook_cost),
              category: "cost",
            });
            data5?.push({
              date: chartDate,
              value: row?.googleadwords_cpi,
              category: "cpi",
            });
            data5?.push({
              date: chartDate,
              value: Math.round(row?.googleadwords_users),
              category: "users",
            });
            data5?.push({
              date: chartDate,
              value: Math.round(row?.googleadwords_cost),
              category: "cost",
            });
            data6?.push({
              date: chartDate,
              value: row?.ironsource_cpi,
              category: "cpi",
            });
            data6?.push({
              date: chartDate,
              value: Math.round(row?.ironsource_users),
              category: "users",
            });
            data6?.push({
              date: chartDate,
              value: Math.round(row?.ironsource_cost),
              category: "cost",
            });
            data54?.push({
              date: chartDate,
              value: row?.applovin_cpi,
              category: "cpi",
            });
            data54?.push({
              date: chartDate,
              value: Math.round(row?.applovin_users),
              category: "users",
            });
            data54?.push({
              date: chartDate,
              value: Math.round(row?.applovin_cost),
              category: "cost",
            });
            data55?.push({
              date: chartDate,
              value: row?.unityads_cpi,
              category: "cpi",
            });
            data55?.push({
              date: chartDate,
              value: Math.round(row?.unityads_users),
              category: "users",
            });
            data55?.push({
              date: chartDate,
              value: Math.round(row?.unityads_cost),
              category: "cost",
            });
            data56?.push({
              date: chartDate,
              value: row?.tapjoy_cpi,
              category: "cpi",
            });
            data56?.push({
              date: chartDate,
              value: Math.round(row?.tapjoy_users),
              category: "users",
            });
            data56?.push({
              date: chartDate,
              value: Math.round(row?.tapjoy_cost),
              category: "cost",
            });
            data57?.push({
              date: chartDate,
              value: row?.xiaomiglobal_cpi,
              category: "cpi",
            });
            data57?.push({
              date: chartDate,
              value: Math.round(row?.xiaomiglobal_users),
              category: "users",
            });
            data57?.push({
              date: chartDate,
              value: Math.round(row?.xiaomiglobal_cost),
              category: "cost",
            });
            data58?.push({
              date: chartDate,
              value: row?.swagbucks_cpi,
              category: "cpi",
            });
            data58?.push({
              date: chartDate,
              value: Math.round(row?.swagbucks_users),
              category: "users",
            });
            data58?.push({
              date: chartDate,
              value: Math.round(row?.swagbucks_cost),
              category: "cost",
            });
            data59?.push({
              date: chartDate,
              value: row?.mintegral_cpi,
              category: "cpi",
            });
            data59?.push({
              date: chartDate,
              value: Math.round(row?.mintegral_users),
              category: "users",
            });
            data59?.push({
              date: chartDate,
              value: Math.round(row?.mintegral_cost),
              category: "cost",
            });
            data60?.push({
              date: chartDate,
              value: row?.adcolony_cpi,
              category: "cpi",
            });
            data60?.push({
              date: chartDate,
              value: Math.round(row?.adcolony_users),
              category: "users",
            });
            data60?.push({
              date: chartDate,
              value: Math.round(row?.adcolony_cost),
              category: "cost",
            });
            data61?.push({
              date: chartDate,
              value: row?.chartboosts2s_cpi,
              category: "cpi",
            });
            data61?.push({
              date: chartDate,
              value: Math.round(row?.chartboosts2s_users),
              category: "users",
            });
            data61?.push({
              date: chartDate,
              value: Math.round(row?.chartboosts2s_cost),
              category: "cost",
            });
            data62?.push({
              date: chartDate,
              value: row?.sponsorpay_cpi,
              category: "cpi",
            });
            data62?.push({
              date: chartDate,
              value: Math.round(row?.sponsorpay_users),
              category: "users",
            });
            data62?.push({
              date: chartDate,
              value: Math.round(row?.sponsorpay_cost),
              category: "cost",
            });
            data7?.push({
              date: chartDate,
              value: row?.IS_cpm,
              category: "IS",
            });
            data8.push({
              date: chartDate,
              value: Math.round(row?.IS_Rev),
              category: "IS",
            });
            data9.push({
              date: chartDate,
              value: Math.round(row?.IS_Imp),
              category: "IS",
            });
            data77.push({
              date: chartDate,
              value1: row?.BR_cpm,
              category: "BR",
            });
            data78.push({
              date: chartDate,
              value1: Math.round(row?.BR_Rev),
              category: "BR",
            });
            data79.push({
              date: chartDate,
              value1: Math.round(row?.BR_Imp),
              category: "BR",
            });
            data7?.push({
              date: chartDate,
              value: row?.RV_cpm,
              category: "RV",
            });
            data8?.push({
              date: chartDate,
              value: Math.round(row?.RV_Rev),
              category: "RV",
            });
            data9?.push({
              date: chartDate,
              value: Math.round(row?.RV_Imp),
              category: "RV",
            });
          }
        }
      });

    if (query === "CWA" || query === "CWI" || query === "CWO") {
      let total = 0;
      let tempArray = [];
      let tempArray1 = [];
      let uniqueArray = new Set(data2?.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data2?.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data2.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data2 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data63.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data63.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data63.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data63 = tempArray1;
      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data64.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data64.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data64.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data64 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data65.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data65.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data65.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data65 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data66.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data66.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data66.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data66 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data67.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data67.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data67.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data67 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data68.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data68.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data68.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data68 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data63.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data69.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data69.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data69 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data70.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data70.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data70.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data70 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data71.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data71.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data71.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data71 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data72.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data72.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data72.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data72 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data73.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data73.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data73.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data73 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data3?.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data3?.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data3?.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data3 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data10.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data10.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data10.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data10 = tempArray1;

      total = 0;
      tempArray = [];
      tempArray1 = [];
      uniqueArray = new Set(data11.map((item) => item.category));

      uniqueArray.forEach((item) => {
        data11.map((obj) => {
          if (item === obj.category) {
            total += obj.value;
          }
        });
        tempArray.push({ country: item, value: total });
        total = 0;
      });

      tempArray.sort((a, b) => b.value - a.value);
      tempArray.slice(0, 10).map((obj) => {
        data11.map((obj1) => {
          if (obj1.category === obj.country) {
            tempArray1.push(obj1);
          }
        });
      });
      data11 = tempArray1;
    }
    // arrayNumbers.forEach((val) => {
    // dataSets["data63"] = tempArray1;
    // });
    setData((currentData) => ({
      ...currentData,

      data1: data1,
      data2: data2,
      data3: data3,
      data4: data4,
      data5: data5,
      data6: data6,
      data7: data7,
      data8: data8,
      data9: data9,
      data10: data10,
      data11: data11,
      data12: data12,
      data13: data13,
      data14: data14,
      data15: data15,
      data16: data16,
      data17: data17,
      data18: data18,
      data19: data19,
      data20: data20,
      data21: data21,
      data22: data22,
      data23: data23,
      data24: data24,
      data25: data25,
      data26: data26,
      data27: data27,
      data28: data28,
      data29: data29,
      data30: data30,
      data31: data31,
      data32: data32,
      data33: data33,
      data34: data34,
      data35: data35,
      data36: data36,
      data37: data37,
      data38: data38,
      data39: data39,
      data40: data40,
      data41: data41,
      data42: data42,
      data43: data43,
      data44: data44,
      data45: data45,
      data46: data46,
      data47: data47,
      data48: data48,
      data49: data49,
      data50: data50,
      data51: data51,
      data52: data52,
      data53: data53,
      data54: data54,
      data55: data55,
      data56: data56,
      data57: data57,
      data58: data58,
      data59: data59,
      data60: data60,
      data61: data61,
      data62: data62,
      data63: data63,
      data64: data64,
      data65: data65,
      data66: data66,
      data67: data67,
      data68: data68,
      data69: data69,
      data70: data70,
      data71: data71,
      data72: data72,
      data73: data73,
      data74: data74,
      data75: data75,
      data76: data76,
      data77: data77,
      data78: data78,
      data79: data79,
      loader: false,
    }));

    setLoading(false);
  }, [questions, start, end]);
  useEffect(() => {
    showGraph !== null &&
      showGraph !== undefined &&
      localStorage.setItem("showGraph", showGraph);
  }, [showGraph]);
  return (
    <div>
      {(loading || dataSets.loader || eventsLoading) && (
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
            <div style={{ width: "100%" }}>
              <TopNav
                dataSets={dataSets}
                setData={setData}
                showGraph={showGraph}
                back={
                  <Tooltip title="Back">
                    <KeyboardBackspaceIcon
                      sx={{
                        cursor: "pointer",
                        backgroundColor: "#F3f3f3",
                        marginRight: "10px",
                        marginTop: "50px",
                        marginLeft: "10px",
                        border: "1px solid black",
                        color: "black",
                      }}
                      onClick={() => {
                        setShowGraph(false);
                      }}
                    />
                  </Tooltip>
                }
                setCount={(e) => setCount(e)}
                setShowGraph={setShowGraph}
                scrollLeft={scrollLeft}
                scrollRight={scrollRight}
                signal={signal}
                handleDownload={handleDownload}
                handleExpand={handleExpand}
                handleExpandFullData={handleExpandfullData}
                showFullMonthTable={showFullMonthTable}
                showFullDataTable={showFullDataTable}
                signout={signout}
                handleIdChange={handleIdChange}
                games={games}
                game={game1}
                query={query}
              />
            </div>
          </div>

          {!showGraph ? (
            <div
              id="slider"
              style={{
                marginTop: "100px",
              }}
            >
              {" "}
              <Suspense>
                <QuestionsTable
                  pageID="dashboard"
                  value4={Math?.round(9619.47)}
                  value5={Math?.round(46518.47)}
                  value6={Math?.round(2503.04)}
                  value7={Math?.round(625.91)}
                  // value3={29421.0}
                  query={query}
                  onQueryChange={handleQuery}
                  questions={questions}
                  questions1={questions1}
                  showFull={showFullMonthTable}
                  showFullData={showFullDataTable}
                  setLoading={setLoading}
                  game1={game1}
                  onOpenNewDauGraph={() =>
                    setOpen((currentOpen) => ({
                      ...currentOpen,
                      bool9: true,
                    }))
                  }
                  onOpenRevenueSpendGraph={() =>
                    setOpen((currentOpen) => ({
                      ...currentOpen,
                      bool10: true,
                    }))
                  }
                />
              </Suspense>
              <DashboardMetricPopup
                open={open.bool9}
                title="New vs DAU"
                graphData={usersGraphData}
                xAxisRange={{ start, end }}
                onDateFilterClick={handleClick}
                onClose={() =>
                  setOpen((currentOpen) => ({ ...currentOpen, bool9: false }))
                }
              />
              <DashboardMetricPopup
                open={open.bool10}
                title="Revenue vs Total Spend"
                graphData={revenueSpendGraphData}
                xAxisRange={{ start, end }}
                onDateFilterClick={handleClick}
                onClose={() =>
                  setOpen((currentOpen) => ({ ...currentOpen, bool10: false }))
                }
              />
            </div>
          ) : (
            <>
              {" "}
              <div
                style={{
                  position: "absolute",
                  overflowX: "scroll",

                  top: "50%",
                  // bottom: "10%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "100vw",
                  height: "90vh",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  // p: 4,
                }}
              >
                {game1 !== "2248" && game1 !== "x2" ? (
                  <>
                    {" "}
                    <div
                      style={{
                        paddingTop: "5px",
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                      }}
                    >
                      <IconButton
                        sx={{ marginTop: "42px" }}
                        onClick={handleClick}
                      >
                        <CalendarMonthIcon />
                      </IconButton>
                    </div>
                    <div
                      style={{
                        // marginTop: "-50px",
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                      }}
                    >
                      {query !== "CWA" && query !== "CWI" && (
                        <>
                          {" "}
                          {questions[0]?.geo !== "" &&
                          questions[0]?.geo !== null &&
                          questions[0]?.geo !== undefined ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "25%",
                                padding: "0px 10px",

                                height: "320px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                }}
                              >
                                <h3 style={{ fontWeight: "500" }}>DAU </h3>
                                <IconButton
                                  className={classes.icnBtn}
                                  onClick={() =>
                                    setOpen({ ...open, bool1: true })
                                  }
                                >
                                  <SettingsOverscanIcon />
                                </IconButton>{" "}
                              </div>
                              <BasicModal
                                handleClose={() => {
                                  setOpen({ ...open, bool1: false });
                                }}
                                open={open}
                                setOpen={setOpen}
                                bool="bool1"
                              >
                                {" "}
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100vw",

                                    // padding: "0 10px",

                                    height: "100%",
                                  }}
                                >
                                  <h3 style={{ fontWeight: "500" }}>DAU </h3>

                                  <DualMultiLineChart data={dataSets.data1} />
                                </div>
                              </BasicModal>

                              <LineChart data={dataSets.data1} />
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "30%",
                                padding: "0px 10px",

                                height: "320px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                }}
                              >
                                <h3 style={{ fontWeight: "500" }}>DAU </h3>
                                <IconButton
                                  className={classes.icnBtn}
                                  onClick={() =>
                                    setOpen({ ...open, bool1: true })
                                  }
                                >
                                  <SettingsOverscanIcon />
                                </IconButton>{" "}
                              </div>
                              <BasicModal
                                handleClose={() => {
                                  setOpen({ ...open, bool1: false });
                                }}
                                open={open}
                                setOpen={setOpen}
                                bool="bool1"
                              >
                                {" "}
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100vw",

                                    // padding: "0 10px",

                                    height: "100%",
                                  }}
                                >
                                  <h3 style={{ fontWeight: "500" }}>DAU </h3>

                                  <DualMultiLineChart data={dataSets.data1} />
                                </div>
                              </BasicModal>

                              <LineChart data={dataSets.data1} />
                            </div>
                          )}
                        </>
                      )}
                      {questions[0]?.geo !== "" &&
                      questions[0]?.geo !== null &&
                      questions[0]?.geo !== undefined ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "40%",
                            padding: "0 10px",

                            height: "350px",
                          }}
                        >
                          <div
                            style={{
                              marginTop: "00px",
                              display: "flex",
                              flexDirection: "row",
                            }}
                          >
                            {query !== "CWA" && query !== "CWI" ? (
                              <h3 style={{ fontWeight: "500" }}>
                                Total Spend{" "}
                              </h3>
                            ) : (
                              <h3 style={{ fontWeight: "500" }}>
                                Spend CW - Top 10{" "}
                              </h3>
                            )}
                            <IconButton
                              onClick={() => setOpen({ ...open, bool2: true })}
                            >
                              <SettingsOverscanIcon />
                            </IconButton>
                          </div>
                          <BasicModal
                            handleClose={() => {
                              setOpen({ ...open, bool2: false });
                            }}
                            open={open}
                            setOpen={setOpen}
                            bool="bool2"
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",

                                height: "100%",
                              }}
                            >
                              {query !== "CWA" && query !== "CWI" ? (
                                <h3 style={{ fontWeight: "500" }}>
                                  Total Spend{" "}
                                </h3>
                              ) : (
                                <h3 style={{ fontWeight: "500" }}>
                                  Spend CW - Top 10{" "}
                                </h3>
                              )}
                              <SimpleTabsModal
                                shrink={true}
                                query={query}
                                setLoading={setLoading}
                                allData={[
                                  { name: "FB", value: 2 },
                                  { name: "Ggl", value: 63 },
                                  { name: "IS", value: 64 },
                                  { name: "AL", value: 65 },
                                  { name: "UA", value: 66 },
                                  { name: "TJ", value: 67 },
                                  { name: "Xiaomi", value: 68 },
                                  { name: "BDG", value: 69 },
                                  { name: "MTG", value: 70 },
                                  { name: "AC", value: 71 },
                                  { name: "CB", value: 72 },
                                  { name: "SP", value: 73 },
                                ]}
                                iap={true}
                                data={dataSets}
                              />
                            </div>
                          </BasicModal>
                          <SimpleTabs
                            query={query}
                            setLoading={setLoading}
                            allData={[
                              { name: "FB", value: 2 },
                              { name: "Ggl", value: 63 },
                              { name: "IS", value: 64 },
                              { name: "AL", value: 65 },
                              { name: "UA", value: 66 },
                              { name: "TJ", value: 67 },
                              { name: "Xiaomi", value: 68 },
                              { name: "BDG", value: 69 },
                              { name: "MTG", value: 70 },
                              { name: "AC", value: 71 },
                              { name: "CB", value: 72 },
                              { name: "SP", value: 73 },
                            ]}
                            iap={true}
                            data={dataSets}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "30%",
                            padding: "0 10px",

                            height: "320px",
                          }}
                        >
                          <div
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <h3 style={{ fontWeight: "500" }}>Total Spend </h3>
                            <IconButton
                              onClick={() => setOpen({ ...open, bool2: true })}
                            >
                              <SettingsOverscanIcon />
                            </IconButton>
                          </div>
                          <BasicModal
                            handleClose={() => {
                              setOpen({ ...open, bool2: false });
                            }}
                            open={open}
                            setOpen={setOpen}
                            bool="bool2"
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",

                                // padding: "0 10px",

                                height: "100%",
                              }}
                            >
                              <h3 style={{ fontWeight: "500" }}>
                                Total Spend{" "}
                              </h3>

                              <DualMultiLineChart data={dataSets.data2} />
                            </div>
                          </BasicModal>
                          <LineChart data={dataSets.data2} />
                        </div>
                      )}

                      {questions[0]?.geo !== "" &&
                      questions[0]?.geo !== null &&
                      questions[0]?.geo !== undefined ? (
                        <>
                          {" "}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              width:
                                query !== "CWA" && query !== "CWI"
                                  ? "25%"
                                  : "43%",

                              height: "200px",
                            }}
                          >
                            <div
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              {query !== "CWA" && query !== "CWI" ? (
                                <h3 style={{ fontWeight: "500" }}>Revenue </h3>
                              ) : (
                                <h3 style={{ fontWeight: "500" }}>
                                  Revenue CW - Top 10{" "}
                                </h3>
                              )}
                              <IconButton
                                onClick={() =>
                                  setOpen({ ...open, bool3: true })
                                }
                              >
                                <SettingsOverscanIcon />
                              </IconButton>
                            </div>
                            <BasicModal
                              handleClose={() => {
                                setOpen({ ...open, bool3: false });
                              }}
                              open={open}
                              setOpen={setOpen}
                              bool="bool3"
                            >
                              {" "}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "100%",
                                  height: "100%",
                                }}
                              >
                                {query !== "CWA" && query !== "CWI" ? (
                                  <h3 style={{ fontWeight: "500" }}>
                                    Revenue{" "}
                                  </h3>
                                ) : (
                                  <h3 style={{ fontWeight: "500" }}>
                                    Revenue CW - Top 10{" "}
                                  </h3>
                                )}

                                <SimpleTabsModal
                                  query={query}
                                  setLoading={setLoading}
                                  iap={true}
                                  data={dataSets}
                                  allData={[
                                    { name: "AdRev", value: 3 },
                                    { name: "IAP", value: 10 },
                                    { name: "Ad", value: 11 },
                                  ]}
                                />
                              </div>
                            </BasicModal>
                            <SimpleTabs
                              query={query}
                              setLoading={setLoading}
                              iap={true}
                              data={dataSets}
                              allData={[
                                { name: "AdRev", value: 3 },
                                { name: "IAP", value: 10 },
                                { name: "Ad", value: 11 },
                              ]}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {" "}
                          <div
                            style={{
                              // marginTop: "-20px",
                              display: "flex",
                              flexDirection: "column",
                              width: "30%",
                              // padding: "60px 10px",
                              height: "320px",
                            }}
                          >
                            <div
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <h3 style={{ fontWeight: "500" }}>Revenue </h3>
                              <IconButton
                                onClick={() =>
                                  setOpen({ ...open, bool3: true })
                                }
                              >
                                <SettingsOverscanIcon />
                              </IconButton>
                            </div>
                            <BasicModal
                              handleClose={() => {
                                setOpen({ ...open, bool3: false });
                              }}
                              open={open}
                              setOpen={setOpen}
                              bool="bool3"
                            >
                              {" "}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "100%",
                                  height: "100%",
                                }}
                              >
                                <h3 style={{ fontWeight: "500" }}>Revenue </h3>

                                <DualMultiLineChart data={dataSets.data3} />
                              </div>
                            </BasicModal>
                            <LineChart data={dataSets.data3} />
                          </div>
                        </>
                      )}
                    </div>
                    {query !== "CWA" && query !== "CWI" && (
                      <>
                        <div
                          style={{
                            marginTop: "-20px",
                            display: "flex",
                            flexDirection: "row",
                            width: "100vw",
                          }}
                        >
                          {questions[0]?.geo !== "" &&
                          questions[0]?.geo !== null &&
                          questions[0]?.geo !== undefined ? (
                            <>
                              {" "}
                              <div
                                style={{
                                  marginTop: "0px",
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "30%",
                                  padding: "0px 10px",

                                  height: "350px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  <h3 style={{ fontWeight: "500" }}>CPM </h3>
                                  <IconButton
                                    onClick={() =>
                                      setOpen({ ...open, bool4: true })
                                    }
                                  >
                                    <SettingsOverscanIcon />
                                  </IconButton>
                                </div>
                                <BasicModal
                                  handleClose={() => {
                                    setOpen({ ...open, bool4: false });
                                  }}
                                  open={open}
                                  setOpen={setOpen}
                                  bool="bool4"
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      width: "100%",

                                      // padding: "0 10px",

                                      height: "100%",
                                    }}
                                  >
                                    <h3 style={{ fontWeight: "500" }}>CPM </h3>

                                    <SimpleTabsModal
                                      query={query}
                                      setLoading={setLoading}
                                      data={dataSets}
                                      allData={[
                                        { name: "IS", cpm: 45 },
                                        { name: "BR", cpm: 48 },
                                        { name: "RV", cpm: 51 },
                                      ]}
                                    />
                                  </div>
                                </BasicModal>
                                <SimpleTabs
                                  query={query}
                                  setLoading={setLoading}
                                  data={dataSets}
                                  allData={[
                                    { name: "IS", cpm: 45 },
                                    { name: "BR", cpm: 48 },
                                    { name: "RV", cpm: 51 },
                                  ]}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "30%",
                                  padding: "0 10px",

                                  height: "320px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  <h3 style={{ fontWeight: "500" }}>CPM </h3>
                                  <IconButton
                                    onClick={() =>
                                      setOpen({ ...open, bool4: true })
                                    }
                                  >
                                    <SettingsOverscanIcon />
                                  </IconButton>
                                </div>
                                <BasicModal
                                  handleClose={() => {
                                    setOpen({ ...open, bool4: false });
                                  }}
                                  open={open}
                                  setOpen={setOpen}
                                  bool="bool4"
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      width: "100%",

                                      // padding: "0 10px",

                                      height: "100%",
                                    }}
                                  >
                                    <h3 style={{ fontWeight: "500" }}>CPM</h3>
                                    {/* <div style={{ width: "90%" }}> */}{" "}
                                    <MixChart
                                      data={dataSets.data7}
                                      data1={dataSets.data77}
                                    />
                                    {/* </div> */}
                                  </div>
                                </BasicModal>
                                <MixChart
                                  data={dataSets.data7}
                                  data1={dataSets.data77}
                                />
                              </div>
                            </>
                          )}
                          {questions[0]?.geo !== "" &&
                          questions[0]?.geo !== null &&
                          questions[0]?.geo !== undefined ? (
                            <>
                              {" "}
                              <div
                                style={{
                                  marginTop: "0px",
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "30%",
                                  padding: "0px 10px",

                                  height: "350px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  <h3 style={{ fontWeight: "500" }}>Rev </h3>
                                  <IconButton
                                    onClick={() =>
                                      setOpen({ ...open, bool5: true })
                                    }
                                  >
                                    <SettingsOverscanIcon />
                                  </IconButton>
                                </div>
                                <BasicModal
                                  handleClose={() => {
                                    setOpen({ ...open, bool5: false });
                                  }}
                                  open={open}
                                  setOpen={setOpen}
                                  bool="bool5"
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      width: "100%",

                                      // padding: "0 10px",

                                      height: "100%",
                                    }}
                                  >
                                    <h3 style={{ fontWeight: "500" }}>Rev </h3>

                                    <SimpleTabsModal
                                      query={query}
                                      setLoading={setLoading}
                                      data={dataSets}
                                      allData={[
                                        { name: "IS", rev: 46 },
                                        { name: "BR", rev: 49 },
                                        { name: "RV", rev: 52 },
                                      ]}
                                    />
                                  </div>
                                </BasicModal>
                                <SimpleTabs
                                  query={query}
                                  setLoading={setLoading}
                                  data={dataSets}
                                  allData={[
                                    { name: "IS", rev: 46 },
                                    { name: "BR", rev: 49 },
                                    { name: "RV", rev: 52 },
                                  ]}
                                />
                              </div>{" "}
                            </>
                          ) : (
                            <>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "30%",
                                  padding: "0 10px",

                                  height: "320px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  <h3 style={{ fontWeight: "500" }}>Rev </h3>
                                  <IconButton
                                    onClick={() =>
                                      setOpen({ ...open, bool5: true })
                                    }
                                  >
                                    <SettingsOverscanIcon />
                                  </IconButton>
                                </div>
                                <BasicModal
                                  handleClose={() => {
                                    setOpen({ ...open, bool5: false });
                                  }}
                                  open={open}
                                  setOpen={setOpen}
                                  bool="bool5"
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      width: "100%",

                                      // padding: "0 10px",

                                      height: "100%",
                                    }}
                                  >
                                    <h3 style={{ fontWeight: "500" }}>Rev</h3>
                                    {/* <div style={{ width: "90%" }}> */}
                                    <MixChart
                                      data={dataSets.data8}
                                      data1={dataSets.data78}
                                    />
                                    {/* </div> */}
                                  </div>
                                </BasicModal>
                                {/* <div style={{ width: "60%" }}> */}
                                <MixChart
                                  data={dataSets.data8}
                                  data1={dataSets.data78}
                                />
                                {/* </div> */}
                              </div>
                            </>
                          )}

                          {questions[0]?.geo !== "" &&
                          questions[0]?.geo !== null &&
                          questions[0]?.geo !== undefined ? (
                            <>
                              {" "}
                              <div
                                style={{
                                  marginTop: "0px",
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "30%",
                                  padding: "0px 10px",

                                  height: "350px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  <h3 style={{ fontWeight: "500" }}>Imp </h3>
                                  <IconButton
                                    onClick={() =>
                                      setOpen({ ...open, bool6: true })
                                    }
                                  >
                                    <SettingsOverscanIcon />
                                  </IconButton>
                                </div>
                                <BasicModal
                                  handleClose={() => {
                                    setOpen({ ...open, bool6: false });
                                  }}
                                  open={open}
                                  setOpen={setOpen}
                                  bool="bool6"
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      width: "100%",
                                      height: "100%",
                                    }}
                                  >
                                    <h3 style={{ fontWeight: "500" }}>Imp </h3>

                                    <SimpleTabsModal
                                      query={query}
                                      setLoading={setLoading}
                                      data={dataSets}
                                      allData={[
                                        { name: "IS", imp: 47 },
                                        { name: "BR", imp: 50 },
                                        { name: "RV", imp: 53 },
                                      ]}
                                    />
                                  </div>
                                </BasicModal>
                                <SimpleTabs
                                  query={query}
                                  setLoading={setLoading}
                                  data={dataSets}
                                  allData={[
                                    { name: "IS", imp: 47 },
                                    { name: "BR", imp: 50 },
                                    { name: "RV", imp: 53 },
                                  ]}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "30%",
                                  padding: "0 10px",

                                  height: "320px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  <h3 style={{ fontWeight: "500" }}>Imp </h3>
                                  <IconButton
                                    onClick={() =>
                                      setOpen({ ...open, bool6: true })
                                    }
                                  >
                                    <SettingsOverscanIcon />
                                  </IconButton>
                                </div>
                                <BasicModal
                                  handleClose={() => {
                                    setOpen({ ...open, bool6: false });
                                  }}
                                  open={open}
                                  setOpen={setOpen}
                                  bool="bool6"
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      width: "100%",

                                      // padding: "0 10px",

                                      height: "100%",
                                    }}
                                  >
                                    <h3 style={{ fontWeight: "500" }}>Imp</h3>

                                    <MixChart
                                      data={dataSets.data9}
                                      data1={dataSets.data79}
                                    />
                                  </div>
                                </BasicModal>
                                {/* <div style={{ width: "150%" }}> */}
                                <MixChart
                                  data={dataSets.data9}
                                  data1={dataSets.data79}
                                />{" "}
                                {/* </div> */}
                              </div>
                            </>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100vw",
                          }}
                        >
                          {questions[0]?.geo !== "" &&
                          questions[0]?.geo !== null &&
                          questions[0]?.geo !== undefined ? (
                            <>
                              {" "}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "50%",

                                  padding: "0px 10px",

                                  marginTop: "-20px !important",
                                  height: "350px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  <h3 style={{ fontWeight: "500" }}>
                                    Media Sources{" "}
                                  </h3>
                                  <IconButton
                                    onClick={() =>
                                      setOpen({ ...open, bool7: true })
                                    }
                                  >
                                    <SettingsOverscanIcon />
                                  </IconButton>
                                </div>
                                <BasicModal
                                  handleClose={() => {
                                    setOpen({ ...open, bool7: false });
                                  }}
                                  open={open}
                                  setOpen={setOpen}
                                  bool="bool7"
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      width: "100%",

                                      // padding: "0 10px",

                                      height: "100%",
                                    }}
                                  >
                                    <h3 style={{ fontWeight: "500" }}>
                                      Media Sources{" "}
                                    </h3>
                                    <SimpleTabsModal
                                      shrink={true}
                                      query={query}
                                      setLoading={setLoading}
                                      data={dataSets}
                                      add={true}
                                      allData={[
                                        {
                                          name: "FB",
                                          cpi: 4,
                                          users: 5,
                                          cost: 6,
                                        },
                                        {
                                          name: "Ggl",
                                          cpi: 12,
                                          users: 13,
                                          cost: 14,
                                        },
                                        {
                                          name: "IS",
                                          cpi: 15,
                                          users: 16,
                                          cost: 17,
                                        },
                                        {
                                          name: "AL",
                                          cpi: 18,
                                          users: 19,
                                          cost: 20,
                                        },
                                        {
                                          name: "UA",
                                          cpi: 21,
                                          users: 22,
                                          cost: 23,
                                        },
                                        {
                                          name: "TJ",
                                          cpi: 24,
                                          users: 25,
                                          cost: 26,
                                        },
                                        {
                                          name: "Xiaomi",
                                          cpi: 27,
                                          users: 28,
                                          cost: 29,
                                        },
                                        {
                                          name: "BDG",
                                          cpi: 30,
                                          users: 31,
                                          cost: 32,
                                        },
                                        {
                                          name: "MTG",
                                          cpi: 33,
                                          users: 34,
                                          cost: 35,
                                        },
                                        {
                                          name: "AC",
                                          cpi: 36,
                                          users: 37,
                                          cost: 38,
                                        },
                                        {
                                          name: "CB",
                                          cpi: 39,
                                          users: 40,
                                          cost: 41,
                                        },
                                        {
                                          name: "SP",
                                          cpi: 42,
                                          users: 43,
                                          cost: 44,
                                        },
                                      ]}
                                    />
                                  </div>
                                </BasicModal>
                                <SimpleTabs
                                  query={query}
                                  setLoading={setLoading}
                                  data={dataSets}
                                  add={true}
                                  allData={[
                                    { name: "FB", cpi: 4, users: 5, cost: 6 },
                                    {
                                      name: "Ggl",
                                      cpi: 12,
                                      users: 13,
                                      cost: 14,
                                    },
                                    {
                                      name: "IS",
                                      cpi: 15,
                                      users: 16,
                                      cost: 17,
                                    },
                                    {
                                      name: "AL",
                                      cpi: 18,
                                      users: 19,
                                      cost: 20,
                                    },
                                    {
                                      name: "UA",
                                      cpi: 21,
                                      users: 22,
                                      cost: 23,
                                    },
                                    {
                                      name: "TJ",
                                      cpi: 24,
                                      users: 25,
                                      cost: 26,
                                    },
                                    {
                                      name: "Xiaomi",
                                      cpi: 27,
                                      users: 28,
                                      cost: 29,
                                    },
                                    {
                                      name: "BDG",
                                      cpi: 30,
                                      users: 31,
                                      cost: 32,
                                    },
                                    {
                                      name: "MTG",
                                      cpi: 33,
                                      users: 34,
                                      cost: 35,
                                    },
                                    {
                                      name: "AC",
                                      cpi: 36,
                                      users: 37,
                                      cost: 38,
                                    },
                                    {
                                      name: "CB",
                                      cpi: 39,
                                      users: 40,
                                      cost: 41,
                                    },
                                    {
                                      name: "SP",
                                      cpi: 42,
                                      users: 43,
                                      cost: 44,
                                    },
                                  ]}
                                />
                              </div>
                            </>
                          ) : (
                            <div
                              style={{
                                // top: "100px",
                                display: "flex",
                                flexDirection: "column",
                                width: "50%",
                                padding: "0px 10px",
                                marginBottom: "0px",
                                marginTop: "-20px",
                                height: "350px",
                              }}
                            >
                              <div
                                style={{
                                  // marginTop: "80px",
                                  display: "flex",
                                  flexDirection: "row",
                                }}
                              >
                                <h3 style={{ fontWeight: "500" }}>
                                  Media Sources{" "}
                                </h3>
                                <IconButton
                                  onClick={() =>
                                    setOpen({ ...open, bool7: true })
                                  }
                                >
                                  <SettingsOverscanIcon />
                                </IconButton>
                              </div>
                              <BasicModal
                                handleClose={() => {
                                  setOpen({ ...open, bool7: false });
                                }}
                                open={open}
                                setOpen={setOpen}
                                bool="bool7"
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",

                                    // padding: "0 10px",

                                    height: "100%",
                                  }}
                                >
                                  <h3 style={{ fontWeight: "500" }}>
                                    Media Sources{" "}
                                  </h3>
                                  <SimpleTabsModal
                                    shrink={true}
                                    query={query}
                                    setLoading={setLoading}
                                    allData={[
                                      { name: "FB", value: 4 },
                                      { name: "Ggl", value: 5 },
                                      { name: "IS", value: 6 },
                                      { name: "AL", value: 54 },
                                      { name: "UA", value: 55 },
                                      { name: "TJ", value: 56 },
                                      { name: "Xiaomi", value: 57 },
                                      { name: "BDG", value: 58 },
                                      { name: "MTG", value: 59 },
                                      { name: "AC", value: 60 },
                                      { name: "CB", value: 61 },
                                      { name: "SP", value: 62 },
                                    ]}
                                    iap={true}
                                    data={dataSets}
                                  />
                                </div>
                              </BasicModal>
                              <SimpleTabs
                                query={query}
                                setLoading={setLoading}
                                allData={[
                                  { name: "FB", value: 4 },
                                  { name: "Ggl", value: 5 },
                                  { name: "IS", value: 6 },
                                  { name: "AL", value: 54 },
                                  { name: "UA", value: 55 },
                                  { name: "TJ", value: 56 },
                                  { name: "Xiaomi", value: 57 },
                                  { name: "BDG", value: 58 },
                                  { name: "MTG", value: 59 },
                                  { name: "AC", value: 60 },
                                  { name: "CB", value: 61 },
                                  { name: "SP", value: 62 },
                                ]}
                                iap={true}
                                data={dataSets}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {location.pathname.slice(0, 10) === "/dashboard" &&
                    (game1 === "x2" || game1 === "2248") ? (
                      <div style={{ padding: "10px" }}>
                        <div
                          style={{
                            paddingTop: "5px",
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                          }}
                        >
                          <IconButton
                            sx={{ marginTop: "42px" }}
                            onClick={handleClick}
                          >
                            <CalendarMonthIcon />
                          </IconButton>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          <h3 style={{ fontWeight: "500" }}>Events </h3>
                          <IconButton
                            onClick={() => setOpen({ ...open, bool8: true })}
                          >
                            <SettingsOverscanIcon />
                          </IconButton>
                        </div>

                        <EventsChart
                          key={game1}
                          itemGeo={itemGeo}
                          setItemGeo={setItemGeo}
                          game={game1}
                          start={start}
                          end={end}
                          model={false}
                          data={eventsData}
                          dataGeo={eventsDataGeo}
                          dataGeolist={eventsDataGeolist}
                          query={query}
                          setLoading={setLoading}
                        />
                        <BasicModal
                          handleClose={() => {
                            setOpen({ ...open, bool8: false });
                          }}
                          open={open}
                          setOpen={setOpen}
                          bool="bool8"
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            <h3 style={{ fontWeight: "500" }}>Events </h3>
                            <EventsChart
                              key={game1}
                              itemGeo={itemGeo}
                              setItemGeo={setItemGeo}
                              game={game1}
                              start={start}
                              end={end}
                              model={true}
                              data={eventsData}
                              dataGeo={eventsDataGeo}
                              dataGeolist={eventsDataGeolist}
                              query={query}
                              setLoading={setLoading}
                            />
                          </div>
                        </BasicModal>
                      </div>
                    ) : (
                      ""
                    )}
                  </>
                )}
              </div>
            </>
          )}

          <div>
            <Selector
              loader={(l) => {
                setData((currentData) => ({ ...currentData, loader: l }));
              }}
              showGraph={showGraph}
              setCount={(e) => setCount(e)}
              temp={temp}
              location={location}
              signal={signal}
              onQueryChange={handleQuery}
              query={query}
              game1={game1}
            />
          </div>
        </div>
      </div>
      <Popover
        id={id}
        open={open1}
        anchorEl={anchorEl}
        onClose={handleClose}
        sx={{ zIndex: 1700 }}
        PaperProps={{ sx: { zIndex: 1701 } }}
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
              setStart(moment(state[0].startDate));
              setEnd(moment(state[0].endDate));
            }}
          >
            Filter
          </Button>
        </div>
      </Popover>
    </div>
  );
}

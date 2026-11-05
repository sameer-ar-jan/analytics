"use client";

import { downloadRows } from "../../export";

import React, {
  useEffect,
  useState,
  lazy,
  Suspense,
  useMemo,
  useRef,
} from "react";
import "../../App.css";
import axiosInstance, {
  getCachedResponse,
  hasCachedResponse,
} from "../../api/axios";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { subDays } from "date-fns";
import { Box, Button, Tooltip } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Popover from "@mui/material/Popover";
// import XLSX from "xlsx";
import { DateRangePicker } from "react-date-range";
import LineChart from "../../Components/Charts/LineChart";
import { getReportDay } from "../../Components/Charts/chartDates";
import DualMultiLineChart from "../../Components/Charts/DualMultiLineChart";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signOut } from "../../api/session";
import BasicModal from "../../Components/BasicModal/BasicModal";
import Selector from "../../Components/Selector/Selector";
import TopNav from "../../Components/TopNav/TopNav";
import moment from "moment";
import SimpleTabs from "../../Components/TabPanel/TabPanel";
import SimpleTabsModal from "../../Components/TabPanel/TabPanelModal";
import { IconButton } from "@mui/material";
import "./overall.css";
const classes = { icnBtn: "icnBtn" };
import SettingsOverscanIcon from "@mui/icons-material/SettingsOverscan";
import MixChart from "../../Components/Charts/MixChart";
import RevenueSpendPopup from "./RevenueSpendPopup";
import NewDauPopup from "./NewDauPopup";
import { loadGameWiseRows } from "./gamewise-data";
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

const spendFields = [
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
];

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const clampValue = (value, min, max) => {
  const safeMax = Math.max(min, max);
  return Math.max(min, Math.min(value, safeMax));
};

const revenueSpendDialogMinSize = {
  width: 360,
  height: 320,
};

const revenueSpendDialogResizeHandles = [
  {
    corner: "top-left",
    cursor: "nwse-resize",
    style: { top: -2, left: -2 },
  },
  {
    corner: "top-right",
    cursor: "nesw-resize",
    style: { top: -2, right: -2 },
  },
  {
    corner: "bottom-left",
    cursor: "nesw-resize",
    style: { bottom: -2, left: -2 },
  },
  {
    corner: "bottom-right",
    cursor: "nwse-resize",
    style: { bottom: -2, right: -2 },
  },
];

const getRevenue = (row) => toFiniteNumber(row?.Ad_Rev);

const getTotalSpend = (row) => {
  const totalSpend = Number(row?.total_spend);
  if (Number.isFinite(totalSpend)) return totalSpend;
  return spendFields.reduce(
    (sum, field) => sum + toFiniteNumber(row?.[field]),
    0,
  );
};

const getRowDate = (row) => row?.Install_time?.value || row?.Install_time;

const buildRevenueSpendSeries = (rows, startDate, endDate) => {
  const bucket = new Map();

  rows.forEach((row) => {
    const dateValue = getRowDate(row);
    const date = moment(dateValue);
    if (!date.isValid() || date < startDate || date > endDate) return;

    const key = date.format("YYYY-MM-DD");
    const existing = bucket.get(key) || {
      date: date.clone().startOf("day").toDate(),
      revenue: 0,
      spend: 0,
    };

    existing.revenue += getRevenue(row);
    existing.spend += getTotalSpend(row);
    bucket.set(key, existing);
  });

  return Array.from(bucket.entries())
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .flatMap(([, item]) => [
      {
        date: item.date,
        value: Math.round(item.revenue),
        category: "Revenue",
      },
      {
        date: item.date,
        value: Math.round(item.spend),
        category: "Total Spend",
      },
    ]);
};

const buildNewDauSeries = (rows, startDate, endDate) => {
  const bucket = new Map();

  rows.forEach((row) => {
    const date = moment(getRowDate(row));
    if (!date.isValid() || date < startDate || date > endDate) return;

    const key = date.format("YYYY-MM-DD");
    const existing = bucket.get(key) || {
      date: date.clone().startOf("day").toDate(),
      newUsers: 0,
      dau: 0,
    };

    existing.newUsers += toFiniteNumber(row?.total_users);
    existing.dau += toFiniteNumber(row?.DAU);
    bucket.set(key, existing);
  });

  return Array.from(bucket.entries())
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .flatMap(([, item]) => [
      { date: item.date, value: Math.round(item.newUsers), category: "New" },
      { date: item.date, value: Math.round(item.dau), category: "DAU" },
    ]);
};

/** @param {{ initialData?: { daily: object[], monthly: object[] } | null }} props */
export default function Overall({ initialData = null }) {
  const router = useRouter();
  const [start, setStart] = useState(moment().subtract(94, "days"));
  const [end, setEnd] = useState(moment().subtract(1, "days"));
  const [selectedValue, setSelectedValue] = useState(null);
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
    data50: [],
    data51: [],
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
  });
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState({
    bool1: false,
    bool2: false,
    bool3: false,
    bool4: false,
    bool5: false,
    bool6: false,
    bool7: false,
    bool8: false,
  });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open1 = Boolean(anchorEl);
  const id = open1 ? "simple-popover" : undefined;
  const [state, setState] = useState([
    {
      startDate: subDays(new Date(), 1),
      endDate: subDays(new Date(), 30),
      key: "selection",
    },
  ]);
  const [questions, setQuestions] = useState(
    () => initialData?.daily || getCachedResponse("stackoverflow/AI") || [],
  );
  const [spendAdjustment, setSpendAdjustment] = useState(["hello"]);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [questionschart, setQuestionschart] = useState(["hello"]);
  const [showGraph, setShowGraph] = useState(null);
  const [questions1, setQuestions1] = useState(
    () => initialData?.monthly || getCachedResponse("month/AIMA") || [],
  );
  const [query, setQuery] = useState("AI");
  const [valuesData, setValuesData] = useState([]);
  const [game1, setGame1] = useState("x2");
  const [showFullMonthTable, setShowFullMonthTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [revenueSpendOpen, setRevenueSpendOpen] = useState(false);
  const [newDauOpen, setNewDauOpen] = useState(false);
  const [showGameWiseNewDau, setShowGameWiseNewDau] = useState(false);
  const [selectedNewDauGame, setSelectedNewDauGame] = useState(games[0].id);
  const [showGameWiseRevenueSpend, setShowGameWiseRevenueSpend] =
    useState(false);
  const [selectedRevenueSpendGame, setSelectedRevenueSpendGame] = useState(
    games[0].id,
  );
  const [dashboardGameRows, setDashboardGameRows] = useState({});
  const [dashboardGameQuery, setDashboardGameQuery] = useState("");
  const [dashboardGameLoading, setDashboardGameLoading] = useState(true);
  const [dashboardGameError, setDashboardGameError] = useState("");
  const [revenueSpendPosition, setRevenueSpendPosition] = useState({
    x: 280,
    y: 130,
  });
  const [revenueSpendSize, setRevenueSpendSize] = useState({
    width: 760,
    height: 520,
  });
  const revenueSpendDialogRef = useRef(null);
  const newDauDialogRef = useRef(null);
  const revenueSpendDragRef = useRef(null);
  const revenueSpendResizeRef = useRef(null);
  const dateRangePopoverRef = useRef(null);
  const signout = () => signOut(router);
  let tempperr = {
    Jan: null,
    Feb: null,
    Mar: null,
    Apr: null,
    May: null,
    June: null,
    July: null,
    Aug: null,
    Sep: null,
    Oct: null,
    Nov: null,
    Dec: null,
  };
  const getTopQuestions = async (query) => {
    const url = `stackoverflow/${query ? query : "AI"}`;
    if (!hasCachedResponse(url)) setLoading(true);

    return axiosInstance
      .get(url)
      .then((res) => {
        setQuestions(res.data);
      })
      .catch((error) => {
        console.error("Unable to load Overall data", error);
        setQuestions([]);
        setLoading(false);
      });
  };
  const GetSpendAdjustment = async () => {
    if (!hasCachedResponse("month/spendAdjustment")) setLoading(true);

    return axiosInstance
      .get(`month/spendAdjustment`)
      .then((res) => {
        let temp = [];
        let temp1 = [];
        temp = filterLatest12MonthsSpend(res.data);

        temp?.map((item) => {
          temp1[moment(item?.dt?.value).format("MMM")] = item;
        });

        localStorage.setItem("spendAdjustment", temp1);
        setSpendAdjustment(() => temp1);
      })
      .catch((error) => {
        console.error("Unable to load spend adjustment", error);
        setSpendAdjustment([]);
        setLoading(false);
      });
  };
  function filterLatest12Months(data) {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Convert "year" field to full format
    data.forEach((item) => {
      item.fullYear = 2000 + parseInt(item.year, 10);
    });

    // Filter out the last 12 months from the current year
    const filteredCurrentYear = data
      .filter((item) => item.fullYear === currentYear)
      .sort((a, b) => new Date(b.dt_Month.value) - new Date(a.dt_Month.value));

    // Extract months present in the current year
    const currentYearMonths = new Set(
      filteredCurrentYear.map((item) => item.month),
    );

    // Find missing months from the last year
    const lastYearData = data.filter((item) => item.fullYear === lastYear);
    const missingMonths = lastYearData.filter(
      (item) => !currentYearMonths.has(item.month),
    );

    // Combine filtered current year data with missing months from last year
    return [...filteredCurrentYear, ...missingMonths];
  }
  // function filterAllMonths(data) {
  //   // Convert "year" field to full format
  //   data.forEach((item) => {
  //     item.fullYear = 2000 + parseInt(item.year, 10);
  //     item.date = new Date(item.dt_Month.value);
  //   });

  //   // Sort by year ascending, then by month ascending
  //   data.sort((a, b) => {
  //     if (a.fullYear === b.fullYear) {
  //       return a.date.getMonth() - b.date.getMonth();
  //     }
  //     return a.fullYear - b.fullYear;
  //   });

  //   return data;
  // }

  // function filterLatest12MonthsSpend(data) {
  //   // Convert date strings to Date objects and extract year/month

  //   console.log("latest months to filter", data);
  //   data.forEach((item) => {
  //     item.date = new Date(item.dt.value);
  //     item.year = item.date.getFullYear();
  //     item.month = item.date.getMonth() + 1; // JS months are 0-based
  //   });

  //   // Sort by year ascending, then by month ascending
  //   data.sort((a, b) => {
  //     if (a.year === b.year) {
  //       return a.month - b.month;
  //     }
  //     return a.year - b.year;
  //   });
  //   console.log("latest months to filter1", data);
  //   return data;
  // }

  function filterLatest12MonthsSpend(data) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    const lastYear = currentYear - 1;

    // Convert date strings to Date objects and extract year/month
    data.forEach((item) => {
      item.date = new Date(item.dt.value);
      item.year = item.date.getFullYear();
      item.month = item.date.getMonth() + 1;
    });

    // Filter last 12 months of data
    const filteredData = data.filter(
      (item) =>
        (item.year === currentYear && item.month <= currentMonth) ||
        (item.year === lastYear && item.month > currentMonth),
    );

    // Sort by date in descending order (latest first)
    filteredData.sort((a, b) => b.date - a.date);

    return filteredData;
  }

  // Example usage

  const getTopQuestions1 = (query) => {
    let query1 = "AI";
    if (query) {
      query1 = query;
    }
    const monthUrl = `month/${
      query1 &&
      query1 !== "GWA" &&
      query1 !== "GWI" &&
      query1 !== "GWO" &&
      query1 !== "CWP_7" &&
      query1 !== "CWP_30"
        ? query1 + "MA"
        : query1
    }`;
    if (!hasCachedResponse(monthUrl) || !hasCachedResponse("month/values")) {
      setLoading(true);
    }
    const monthlyRequest = axiosInstance
      .get(monthUrl)
      .then((res) => {
        setQuestions1(res.data);
      })
      .catch((error) => {
        console.error("Unable to load monthly Overall data", error);
        setQuestions1([]);
        setLoading(false);
      });
    const valuesRequest = axiosInstance
      .get("month/values")
      .then((res) => {
        const checkData = filterLatest12Months(res.data || []);

        try {
          localStorage.setItem("latest12months", JSON.stringify(checkData));
        } catch (error) {
          console.warn("Unable to save monthly values locally", error);
        }

        const monthlyValues = {};
        checkData
          .filter((item) => item?.media_source === "applovin")
          .forEach((item) => {
            monthlyValues[item?.month?.slice(0, 3)] = item;
          });
        setValuesData(monthlyValues);
      })
      .catch((error) => {
        console.error("Unable to load monthly values", error);
        setValuesData({});
        setLoading(false);
      });
    return Promise.all([monthlyRequest, valuesRequest]);
  };

  // valuesData?.map((i) => {
  //   tempperr[i?.month.slice(0, 3)] = i;
  //   console.log("checking temperrvalue", tempperr[i?.month?.slice(0, 3)]?.rev);
  // });

  const updateGame = (game1) => {
    setGame1(game1);

    setQuery(query);
    getTopQuestions(query);
    getTopQuestions1(query);
    GetSpendAdjustment();
  };

  const handleQuery = (queryValue) => {
    setQuery(queryValue);
    setGame1(game1);
    getTopQuestions(queryValue);
    getTopQuestions1(queryValue);
    GetSpendAdjustment();
  };

  const handleExpand = () => {
    setShowFullMonthTable(!showFullMonthTable);
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const closeDateFilterFromDialog = (event) => {
    if (!anchorEl) return;
    if (dateRangePopoverRef.current?.contains(event.target)) return;
    setAnchorEl(null);
  };
  const handleIdChange = (id) => {
    // let temp = _.cloneDeep(questions);

    const game = games.find((g) => g.id === id);
    setSelectedValue(id);
    document.title = game ? `${game.name}` : "X2";
    updateGame(id);
    //  handleToggle();
    window.location.hash = id; // set the ID as the URL hash
  };
  const handleDownload = () =>
    downloadRows(questions, `${game1}-${query}.xlsx`);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const revenueSpendGraphData = useMemo(() => {
    if (!Array.isArray(questions)) return [];
    return buildRevenueSpendSeries(questions, start, end);
  }, [questions, start, end]);

  const newDauGraphData = useMemo(() => {
    if (!Array.isArray(questions)) return [];
    return buildNewDauSeries(questions, start, end);
  }, [questions, start, end]);

  const revenueSpendGameData = useMemo(() => {
    return games.map((game) => {
      const entry =
        dashboardGameQuery === (query || "AI")
          ? dashboardGameRows[game.id] || {}
          : {};
      const rows = Array.isArray(entry.rows) ? entry.rows : [];

      return {
        id: game.id,
        game: game.name,
        data: buildRevenueSpendSeries(rows, start, end),
        error: entry.error,
      };
    });
  }, [dashboardGameRows, dashboardGameQuery, query, start, end]);

  const selectedRevenueSpendGameData = useMemo(() => {
    return (
      revenueSpendGameData.find(
        (item) => item.id === selectedRevenueSpendGame,
      ) || revenueSpendGameData[0]
    );
  }, [revenueSpendGameData, selectedRevenueSpendGame]);

  const newDauGameData = useMemo(() => {
    return games.map((game) => {
      const entry =
        dashboardGameQuery === (query || "AI")
          ? dashboardGameRows[game.id] || {}
          : {};
      return {
        id: game.id,
        game: game.name,
        data: buildNewDauSeries(
          Array.isArray(entry.rows) ? entry.rows : [],
          start,
          end,
        ),
        error: entry.error,
      };
    });
  }, [dashboardGameRows, dashboardGameQuery, query, start, end]);

  const selectedNewDauGameData = useMemo(() => {
    return (
      newDauGameData.find((item) => item.id === selectedNewDauGame) ||
      newDauGameData[0]
    );
  }, [newDauGameData, selectedNewDauGame]);

  const revenueSpendChartHeight = Math.max(
    220,
    revenueSpendSize.height - (showGameWiseRevenueSpend ? 180 : 118),
  );

  // Both popups share one batch, started when Overall mounts or its query changes.
  useEffect(() => {
    let active = true;
    const activeQuery = query || "AI";
    setDashboardGameLoading(true);
    setDashboardGameError("");

    loadGameWiseRows(games, activeQuery, (url) => axiosInstance.get(url)).then(
      (result) => {
        // A previous query can finish after a newer one. Ignore it after cleanup.
        if (!active) return;
        setDashboardGameRows(result.rows);
        setDashboardGameQuery(activeQuery);
        setDashboardGameError(result.error);
        setDashboardGameLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, [query]);

  const handleRevenueSpendDragStart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const point = event.touches?.[0] || event;
    const dialog = revenueSpendDialogRef.current;
    if (!point || !dialog) return;
    const dialogRect = dialog.getBoundingClientRect();

    dialog.style.willChange = "transform";
    dialog.style.transition = "none";

    revenueSpendDragRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      originX: revenueSpendPosition.x,
      originY: revenueSpendPosition.y,
      nextX: revenueSpendPosition.x,
      nextY: revenueSpendPosition.y,
      width: dialogRect.width,
      height: dialogRect.height,
      frameId: null,
    };

    const paintDialogPosition = () => {
      const drag = revenueSpendDragRef.current;
      if (!drag || !revenueSpendDialogRef.current) return;

      revenueSpendDialogRef.current.style.transform = `translate3d(${
        drag.nextX - drag.originX
      }px, ${drag.nextY - drag.originY}px, 0)`;
      drag.frameId = null;
    };

    const requestDialogPaint = () => {
      const drag = revenueSpendDragRef.current;
      if (!drag || drag.frameId !== null) return;

      drag.frameId = window.requestAnimationFrame(paintDialogPosition);
    };

    const handleMove = (moveEvent) => {
      const movePoint = moveEvent.touches?.[0] || moveEvent;
      const drag = revenueSpendDragRef.current;
      if (!movePoint || !drag) return;
      moveEvent.preventDefault();

      const nextX = drag.originX + movePoint.clientX - drag.startX;
      const nextY = drag.originY + movePoint.clientY - drag.startY;

      drag.nextX = clampValue(nextX, 8, window.innerWidth - drag.width - 8);
      drag.nextY = clampValue(nextY, 8, window.innerHeight - drag.height - 8);
      requestDialogPaint();
    };

    const stopDragging = () => {
      const drag = revenueSpendDragRef.current;
      const finalPosition = drag
        ? {
            x: drag.nextX,
            y: drag.nextY,
          }
        : revenueSpendPosition;

      if (drag && drag.frameId !== null) {
        window.cancelAnimationFrame(drag.frameId);
      }

      if (revenueSpendDialogRef.current) {
        revenueSpendDialogRef.current.style.left = `${finalPosition.x}px`;
        revenueSpendDialogRef.current.style.top = `${finalPosition.y}px`;
        revenueSpendDialogRef.current.style.transform = "";
        revenueSpendDialogRef.current.style.willChange = "";
        revenueSpendDialogRef.current.style.transition = "";
      }

      revenueSpendDragRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", stopDragging);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", stopDragging);
      setRevenueSpendPosition(finalPosition);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", stopDragging);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", stopDragging);
  };

  const handleRevenueSpendResizeStart = (corner) => (event) => {
    event.preventDefault();
    event.stopPropagation();

    const point = event.touches?.[0] || event;
    const dialog = revenueSpendDialogRef.current;
    if (!point || !dialog) return;

    const dialogRect = dialog.getBoundingClientRect();
    const startsAtLeft = corner.includes("left");
    const startsAtTop = corner.includes("top");

    dialog.style.willChange = "width, height, left, top";
    dialog.style.transition = "none";

    revenueSpendResizeRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      originX: dialogRect.left,
      originY: dialogRect.top,
      originWidth: dialogRect.width,
      originHeight: dialogRect.height,
      nextX: dialogRect.left,
      nextY: dialogRect.top,
      nextWidth: dialogRect.width,
      nextHeight: dialogRect.height,
      startsAtLeft,
      startsAtTop,
      frameId: null,
    };

    const paintDialogSize = () => {
      const resize = revenueSpendResizeRef.current;
      if (!resize || !revenueSpendDialogRef.current) return;

      revenueSpendDialogRef.current.style.left = `${resize.nextX}px`;
      revenueSpendDialogRef.current.style.top = `${resize.nextY}px`;
      revenueSpendDialogRef.current.style.width = `${resize.nextWidth}px`;
      revenueSpendDialogRef.current.style.height = `${resize.nextHeight}px`;
      resize.frameId = null;
    };

    const requestDialogPaint = () => {
      const resize = revenueSpendResizeRef.current;
      if (!resize || resize.frameId !== null) return;

      resize.frameId = window.requestAnimationFrame(paintDialogSize);
    };

    const handleMove = (moveEvent) => {
      const movePoint = moveEvent.touches?.[0] || moveEvent;
      const resize = revenueSpendResizeRef.current;
      if (!movePoint || !resize) return;
      moveEvent.preventDefault();

      const deltaX = movePoint.clientX - resize.startX;
      const deltaY = movePoint.clientY - resize.startY;

      if (resize.startsAtLeft) {
        const maxX =
          resize.originX + resize.originWidth - revenueSpendDialogMinSize.width;
        resize.nextX = clampValue(resize.originX + deltaX, 8, maxX);
        resize.nextWidth = resize.originX + resize.originWidth - resize.nextX;
      } else {
        resize.nextWidth = clampValue(
          resize.originWidth + deltaX,
          revenueSpendDialogMinSize.width,
          window.innerWidth - resize.originX - 8,
        );
      }

      if (resize.startsAtTop) {
        const maxY =
          resize.originY +
          resize.originHeight -
          revenueSpendDialogMinSize.height;
        resize.nextY = clampValue(resize.originY + deltaY, 8, maxY);
        resize.nextHeight = resize.originY + resize.originHeight - resize.nextY;
      } else {
        resize.nextHeight = clampValue(
          resize.originHeight + deltaY,
          revenueSpendDialogMinSize.height,
          window.innerHeight - resize.originY - 8,
        );
      }

      requestDialogPaint();
    };

    const stopResizing = () => {
      const resize = revenueSpendResizeRef.current;
      const finalPosition = resize
        ? {
            x: resize.nextX,
            y: resize.nextY,
          }
        : revenueSpendPosition;
      const finalSize = resize
        ? {
            width: resize.nextWidth,
            height: resize.nextHeight,
          }
        : revenueSpendSize;

      if (resize && resize.frameId !== null) {
        window.cancelAnimationFrame(resize.frameId);
      }

      if (revenueSpendDialogRef.current) {
        revenueSpendDialogRef.current.style.left = `${finalPosition.x}px`;
        revenueSpendDialogRef.current.style.top = `${finalPosition.y}px`;
        revenueSpendDialogRef.current.style.width = `${finalSize.width}px`;
        revenueSpendDialogRef.current.style.height = `${finalSize.height}px`;
        revenueSpendDialogRef.current.style.willChange = "";
        revenueSpendDialogRef.current.style.transition = "";
      }

      revenueSpendResizeRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", stopResizing);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", stopResizing);
      setRevenueSpendPosition(finalPosition);
      setRevenueSpendSize(finalSize);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", stopResizing);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", stopResizing);
  };

  useEffect(() => {
    if (!revenueSpendOpen && !newDauOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (revenueSpendDialogRef.current?.contains(event.target)) return;
      if (newDauDialogRef.current?.contains(event.target)) return;
      if (dateRangePopoverRef.current?.contains(event.target)) return;
      if (anchorEl) {
        setAnchorEl(null);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("touchstart", closeOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("touchstart", closeOnOutsideClick);
    };
  }, [revenueSpendOpen, newDauOpen, anchorEl]);

  let temper = [];

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
    temp.sort((a, b) => {
      return getReportDay(a?.Install_time) - getReportDay(b?.Install_time);
    });

    temp?.map((row) => {
      const chartDate = getReportDay(row?.Install_time);
      if (chartDate !== null && moment(chartDate).isBetween(start, end, "day", "[]")) {
        if (row?.game) {
          data1?.push({
            date: chartDate,
            value: row?.DAU,
            category: row?.game,
          });
          data2?.push({
            date: chartDate,
            value: Math.round(row?.Facebook_cost),
            category: row?.game,
          });
          data63?.push({
            date: chartDate,
            value: Math.round(row?.googleadwords_cost),
            category: row?.game,
          });
          data64?.push({
            date: chartDate,
            value: Math.round(row?.ironsource_cost),
            category: row?.game,
          });
          data65?.push({
            date: chartDate,
            value: Math.round(row?.applovin_cost),
            category: row?.game,
          });
          data66?.push({
            date: chartDate,
            value: Math.round(row?.unityads_cost),
            category: row?.game,
          });
          data67?.push({
            date: chartDate,
            value: Math.round(row?.tapjoy_cost),
            category: row?.game,
          });
          data68?.push({
            date: chartDate,
            value: Math.round(row?.xiaomiglobal_cost),
            category: row?.game,
          });
          data69?.push({
            date: chartDate,
            value: Math.round(row?.swagbucks_cost),
            category: row?.game,
          });
          data70?.push({
            date: chartDate,
            value: Math.round(row?.mintegral_cost),
            category: row?.game,
          });
          data71?.push({
            date: chartDate,
            value: Math.round(row?.adcolony_cost),
            category: row?.game,
          });
          data72?.push({
            date: chartDate,
            value: Math.round(row?.chartboosts2s_cost),
            category: row?.game,
          });
          data73?.push({
            date: chartDate,
            value: Math.round(row?.sponsorpay_cost),
            category: row?.game,
          });

          data3.push({
            date: chartDate,
            value: Math.round(row?.Ad_Rev),
            category: row?.game,
          });
          data10.push({
            date: chartDate,
            value: Math.round(row?.AdRev),
            category: row?.game,
          });
          data11.push({
            date: chartDate,
            value: Math.round(row?.IAP),
            category: row?.game,
          });
          data4.push({
            date: chartDate,
            value: row?.Facebook_cpi,
            category: row?.game,
          });
          data5.push({
            date: chartDate,
            value: Math.round(row?.Facebook_users),
            category: row?.game,
          });
          data6.push({
            date: chartDate,
            value: Math.round(row?.Facebook_cost),
            category: row?.game,
          });
          data12.push({
            date: chartDate,
            value: row?.googleadwords_cpi,
            category: row?.game,
          });
          data13.push({
            date: chartDate,
            value: Math.round(row?.googleadwords_users),
            category: row?.game,
          });
          data14.push({
            date: chartDate,
            value: Math.round(row?.googleadwords_cost),
            category: row?.game,
          });
          data15.push({
            date: chartDate,
            value: row?.ironsource_cpi,
            category: row?.game,
          });
          data16.push({
            date: chartDate,
            value: Math.round(row?.ironsource_users),
            category: row?.game,
          });
          data17.push({
            date: chartDate,
            value: Math.round(row?.ironsource_cost),
            category: row?.game,
          });
          data18.push({
            date: chartDate,
            value: row?.applovin_cpi,
            category: row?.game,
          });
          data19.push({
            date: chartDate,
            value: Math.round(row?.applovin_users),
            category: row?.game,
          });
          data20.push({
            date: chartDate,
            value: Math.round(row?.applovin_cost),
            category: row?.game,
          });
          data21.push({
            date: chartDate,
            value: row?.unityads_cpi,
            category: row?.game,
          });
          data22.push({
            date: chartDate,
            value: Math.round(row?.unityads_users),
            category: row?.game,
          });
          data23.push({
            date: chartDate,
            value: Math.round(row?.unityads_cost),
            category: row?.game,
          });
          data24.push({
            date: chartDate,
            value: row?.tapjoy_cpi,
            category: row?.game,
          });
          data25.push({
            date: chartDate,
            value: Math.round(row?.tapjoy_users),
            category: row?.game,
          });
          data26.push({
            date: chartDate,
            value: Math.round(row?.tapjoy_cost),
            category: row?.game,
          });
          data27.push({
            date: chartDate,
            value: row?.xiaomiglobal_cpi,
            category: row?.game,
          });
          data28.push({
            date: chartDate,
            value: Math.round(row?.xiaomiglobal_users),
            category: row?.game,
          });
          data29.push({
            date: chartDate,
            value: Math.round(row?.xiaomiglobal_cost),
            category: row?.game,
          });
          data30.push({
            date: chartDate,
            value: row?.swagbucks_cpi,
            category: row?.game,
          });
          data31.push({
            date: chartDate,
            value: Math.round(row?.swagbucks_users),
            category: row?.game,
          });
          data32.push({
            date: chartDate,
            value: Math.round(row?.swagbucks_cost),
            category: row?.game,
          });
          data33.push({
            date: chartDate,
            value: row?.mintegral_cpi,
            category: row?.game,
          });
          data34.push({
            date: chartDate,
            value: Math.round(row?.mintegral_users),
            category: row?.game,
          });
          data35.push({
            date: chartDate,
            value: Math.round(row?.mintegral_cost),
            category: row?.game,
          });
          data36.push({
            date: chartDate,
            value: row?.adcolony_cpi,
            category: row?.game,
          });
          data37.push({
            date: chartDate,
            value: Math.round(row?.adcolony_users),
            category: row?.game,
          });
          data38.push({
            date: chartDate,
            value: Math.round(row?.adcolony_cost),
            category: row?.game,
          });
          data39.push({
            date: chartDate,
            value: row?.chartboosts2s_cpi,
            category: row?.game,
          });
          data40.push({
            date: chartDate,
            value: Math.round(row?.chartboosts2s_users),
            category: row?.game,
          });
          data41.push({
            date: chartDate,
            value: Math.round(row?.chartboosts2s_cost),
            category: row?.game,
          });
          data42.push({
            date: chartDate,
            value: row?.sponsorpay_cpi,
            category: row?.game,
          });
          data43.push({
            date: chartDate,
            value: Math.round(row?.sponsorpay_users),
            category: row?.game,
          });
          data44.push({
            date: chartDate,
            value: Math.round(row?.sponsorpay_cost),
            category: row?.game,
          });
          data45.push({
            date: chartDate,
            value: row?.IS_cpm,
            category: row?.game,
          });
          data46.push({
            date: chartDate,
            value: Math.round(row?.IS_Rev),
            category: row?.game,
          });
          data47.push({
            date: chartDate,
            value: Math.round(row?.IS_Imp),
            category: row?.game,
          });
          data48.push({
            date: chartDate,
            value: row?.BR_cpm,
            category: row?.game,
          });
          data49.push({
            date: chartDate,
            value: Math.round(row?.BR_Rev),
            category: row?.game,
          });
          data50.push({
            date: chartDate,
            value: Math.round(row?.BR_Imp),
            category: row?.game,
          });
          data51.push({
            date: chartDate,
            value: row?.RV_cpm,
            category: row?.game,
          });
          data52.push({
            date: chartDate,
            value: Math.round(row?.RV_Rev),
            category: row?.game,
          });
          data53.push({
            date: chartDate,
            value: row?.RV_Imp,
            category: row?.game,
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
            value: Math.round(row.googleadwords_cost),
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

          data3.push({
            date: chartDate,
            value: Math.round(row?.Ad_Rev),
            category: "AdRev",
          });

          data3.push({
            date: chartDate,
            value: Math.round(row?.IAP),
            category: "IAP",
          });

          data3.push({
            date: chartDate,
            value: Math.round(row?.AdRev),
            category: "Ad",
          });
          data4.push({
            date: chartDate,
            value: row?.Facebook_cpi,
            category: "cpi",
          });
          data4.push({
            date: chartDate,
            value: Math.round(row?.Facebook_users),
            category: "users",
          });
          data4.push({
            date: chartDate,
            value: Math.round(row?.Facebook_cost),
            category: "cost",
          });
          data5.push({
            date: chartDate,
            value: row?.googleadwords_cpi,
            category: "cpi",
          });
          data5.push({
            date: chartDate,
            value: Math.round(row?.googleadwords_users),
            category: "users",
          });
          data5.push({
            date: chartDate,
            value: Math.round(row?.googleadwords_cost),
            category: "cost",
          });
          data6.push({
            date: chartDate,
            value: row?.ironsource_cpi,
            category: "cpi",
          });
          data6.push({
            date: chartDate,
            value: Math.round(row?.ironsource_users),
            category: "users",
          });
          data6.push({
            date: chartDate,
            value: Math.round(row?.ironsource_cost),
            category: "cost",
          });
          data54.push({
            date: chartDate,
            value: row?.applovin_cpi,
            category: "cpi",
          });
          data54.push({
            date: chartDate,
            value: Math.round(row?.applovin_users),
            category: "users",
          });
          data54.push({
            date: chartDate,
            value: Math.round(row?.applovin_cost),
            category: "cost",
          });
          data55.push({
            date: chartDate,
            value: row?.unityads_cpi,
            category: "cpi",
          });
          data55.push({
            date: chartDate,
            value: Math.round(row?.unityads_users),
            category: "users",
          });
          data55.push({
            date: chartDate,
            value: Math.round(row?.unityads_cost),
            category: "cost",
          });
          data56.push({
            date: chartDate,
            value: row?.tapjoy_cpi,
            category: "cpi",
          });
          data56.push({
            date: chartDate,
            value: Math.round(row?.tapjoy_users),
            category: "users",
          });
          data56.push({
            date: chartDate,
            value: Math.round(row?.tapjoy_cost),
            category: "cost",
          });
          data57.push({
            date: chartDate,
            value: row?.xiaomiglobal_cpi,
            category: "cpi",
          });
          data57.push({
            date: chartDate,
            value: Math.round(row?.xiaomiglobal_users),
            category: row?.game,
          });
          data57.push({
            date: chartDate,
            value: Math.round(row?.xiaomiglobal_cost),
            category: "cost",
          });
          data58.push({
            date: chartDate,
            value: row?.swagbucks_cpi,
            category: "cpi",
          });
          data58.push({
            date: chartDate,
            value: Math.round(row?.swagbucks_users),
            category: "users",
          });
          data58.push({
            date: chartDate,
            value: Math.round(row?.swagbucks_cost),
            category: "cost",
          });
          data59.push({
            date: chartDate,
            value: row?.mintegral_cpi,
            category: "cpi",
          });
          data59.push({
            date: chartDate,
            value: Math.round(row?.mintegral_users),
            category: "users",
          });
          data59.push({
            date: chartDate,
            value: Math.round(row?.mintegral_cost),
            category: "cost",
          });
          data60.push({
            date: chartDate,
            value: row?.adcolony_cpi,
            category: "cpi",
          });
          data60.push({
            date: chartDate,
            value: Math.round(row?.adcolony_users),
            category: "users",
          });
          data60.push({
            date: chartDate,
            value: Math.round(row?.adcolony_cost),
            category: "cost",
          });
          data61.push({
            date: chartDate,
            value: row?.chartboosts2s_cpi,
            category: "cpi",
          });
          data61.push({
            date: chartDate,
            value: Math.round(row?.chartboosts2s_users),
            category: "users",
          });
          data61.push({
            date: chartDate,
            value: Math.round(row?.chartboosts2s_cost),
            category: "cost",
          });
          data62.push({
            date: chartDate,
            value: row?.sponsorpay_cpi,
            category: "cpi",
          });
          data62.push({
            date: chartDate,
            value: Math.round(row?.sponsorpay_users),
            category: "users",
          });
          data62.push({
            date: chartDate,
            value: Math.round(row?.sponsorpay_cost),
            category: "cost",
          });
          data7.push({
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
          data8.push({
            date: chartDate,
            value: Math.round(row?.BR_Rev),
            category: "BR",
          });
          data79.push({
            date: chartDate,
            value1: Math.round(row?.BR_Imp),
            category: "BR",
          });
          data7.push({
            date: chartDate,
            value: row?.RV_cpm,
            category: "RV",
          });
          data8.push({
            date: chartDate,
            value: Math.round(row?.RV_Rev),
            category: "RV",
          });
          data9.push({
            date: chartDate,
            value: Math.round(row?.RV_Imp),
            category: "RV",
          });
        }
      }
    });

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
    // load();
  }, [questions, start, end]);
  useEffect(() => {
    showGraph !== null &&
      showGraph !== undefined &&
      localStorage.setItem("showGraph", showGraph);
  }, [showGraph]);

  useEffect(() => {
    let active = true;
    const requests = [];
    const savedGraph = localStorage.getItem("showGraph");
    if (savedGraph !== null) setShowGraph(savedGraph === "true");
    if (!initialData) {
      requests.push(getTopQuestions("AI"), getTopQuestions1("AI"));
    } else {
      requests.push(axiosInstance
        .get("month/values")
        .then((res) => {
          const checkData = filterLatest12Months(res.data || []);
          localStorage.setItem("latest12months", JSON.stringify(checkData));
          const monthlyValues = {};
          checkData
            .filter((item) => item?.media_source === "applovin")
            .forEach((item) => {
              monthlyValues[item?.month?.slice(0, 3)] = item;
            });
          setValuesData(monthlyValues);
        })
        .catch(() => setValuesData({})));
    }
    requests.push(GetSpendAdjustment());
    Promise.all(requests).finally(() => {
      if (active) setInitialLoadComplete(true);
    });
    return () => { active = false; };
  }, [initialData]);

  const showPageLoading = !initialLoadComplete && (loading || dataSets.loader);

  return (
    <Box>
      {showPageLoading && (
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
          opacity: showPageLoading ? 0.5 : 1,
          pointerEvents: showPageLoading ? "none" : "auto",
        }}
      >
        <div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ paddingLeft: "0", width: "100%" }}>
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
                questions={questions}
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

          {!showGraph ? (
            <div style={{ marginTop: "100px" }}>
              <Suspense>
                <QuestionsTable
                  pageID="overall"
                  addValues={valuesData}
                  value4={Math?.round(9619.47)}
                  value5={Math?.round(46518.47)}
                  value3={Math?.round(31568.0)}
                  value2={Math?.round(29975.0)}
                  value1={Math?.round(29421.0)}
                  value6={Math?.round(2503.04)}
                  value7={Math?.round(625.91)}
                  query={query}
                  onQueryChange={handleQuery}
                  questions={questions}
                  questions1={questions1}
                  showFull={showFullMonthTable}
                  setLoading={setLoading}
                  spendAdjustment={spendAdjustment}
                  onOpenNewDauGraph={() => {
                    setRevenueSpendOpen(false);
                    setShowGameWiseNewDau(false);
                    setNewDauOpen(true);
                  }}
                  onOpenRevenueSpendGraph={() => {
                    setNewDauOpen(false);
                    setShowGameWiseRevenueSpend(false);
                    setRevenueSpendOpen(true);
                  }}
                />
              </Suspense>
            </div>
          ) : (
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
              {" "}
              <div
                style={{
                  paddingTop: "5px",
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <IconButton sx={{ marginTop: "42px" }} onClick={handleClick}>
                  <CalendarMonthIcon />
                </IconButton>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                {questions[0]?.game !== "" &&
                questions[0]?.game !== null &&
                questions[0]?.game !== undefined ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "25%",
                      padding: "0px 10px",

                      height: "320px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <h3 style={{ fontWeight: "500" }}>DAU </h3>
                      <IconButton
                        className={classes.icnBtn}
                        onClick={() => setOpen({ ...open, bool1: true })}
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
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <h3 style={{ fontWeight: "500" }}>DAU </h3>
                      <IconButton
                        className={classes.icnBtn}
                        onClick={() => setOpen({ ...open, bool1: true })}
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
                {questions[0]?.game !== "" &&
                questions[0]?.game !== null &&
                questions[0]?.game !== undefined ? (
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

                          height: "100%",
                        }}
                      >
                        <h3 style={{ fontWeight: "500" }}>Total Spend </h3>
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
                    <div style={{ display: "flex", flexDirection: "row" }}>
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
                        <h3 style={{ fontWeight: "500" }}>Total Spend </h3>

                        <DualMultiLineChart data={dataSets.data2} />
                      </div>
                    </BasicModal>
                    <LineChart data={dataSets.data2} />
                  </div>
                )}

                {questions[0]?.game !== "" &&
                questions[0]?.game !== null &&
                questions[0]?.game !== undefined ? (
                  <>
                    {" "}
                    <div
                      style={{
                        // marginTop: "-20px",
                        display: "flex",
                        flexDirection: "column",
                        width: "25%",
                        // padding: "60px 10px",
                        height: "200px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <h3 style={{ fontWeight: "500" }}>Revenue </h3>
                        <IconButton
                          onClick={() => setOpen({ ...open, bool3: true })}
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
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <h3 style={{ fontWeight: "500" }}>Revenue </h3>
                        <IconButton
                          onClick={() => setOpen({ ...open, bool3: true })}
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
              <div
                style={{
                  marginTop: "-20px",
                  display: "flex",
                  flexDirection: "row",
                  width: "100vw",
                }}
              >
                {questions[0]?.game !== "" &&
                questions[0]?.game !== null &&
                questions[0]?.game !== undefined ? (
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
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <h3 style={{ fontWeight: "500" }}>CPM </h3>
                        <IconButton
                          onClick={() => setOpen({ ...open, bool4: true })}
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
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <h3 style={{ fontWeight: "500" }}>CPM </h3>
                        <IconButton
                          onClick={() => setOpen({ ...open, bool4: true })}
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

                            height: "100%",
                          }}
                        >
                          <h3 style={{ fontWeight: "500" }}>CPM</h3>

                          <MixChart
                            data={dataSets?.data7}
                            data1={dataSets?.data77}
                          />
                        </div>
                      </BasicModal>
                      <MixChart data={dataSets.data7} data1={dataSets.data77} />
                    </div>
                  </>
                )}
                {questions[0]?.game !== "" &&
                questions[0]?.game !== null &&
                questions[0]?.game !== undefined ? (
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
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <h3 style={{ fontWeight: "500" }}>Rev </h3>
                        <IconButton
                          onClick={() => setOpen({ ...open, bool5: true })}
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
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <h3 style={{ fontWeight: "500" }}>Rev </h3>
                        <IconButton
                          onClick={() => setOpen({ ...open, bool5: true })}
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

                          <DualMultiLineChart
                            data={dataSets.data8}
                            // data1={dataSets.data78}
                          />
                        </div>
                      </BasicModal>
                      <LineChart
                        data={dataSets.data8}
                        // data1={dataSets.data78}
                      />
                    </div>
                  </>
                )}

                {questions[0]?.game !== "" &&
                questions[0]?.game !== null &&
                questions[0]?.game !== undefined ? (
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
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <h3 style={{ fontWeight: "500" }}>Imp </h3>
                        <IconButton
                          onClick={() => setOpen({ ...open, bool6: true })}
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
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <h3 style={{ fontWeight: "500" }}>Imp </h3>
                        <IconButton
                          onClick={() => setOpen({ ...open, bool6: true })}
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

                          <MixChart
                            data={dataSets.data9}
                            data1={dataSets.data79}
                          />
                        </div>
                      </BasicModal>
                      <MixChart data={dataSets.data9} data1={dataSets.data79} />
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
                {questions[0]?.game !== "" &&
                questions[0]?.game !== null &&
                questions[0]?.game !== undefined ? (
                  <>
                    {" "}
                    <div
                      style={{
                        // top: "100px",
                        display: "flex",
                        flexDirection: "column",
                        width: "50%",
                        // marginLeft: "-30px",
                        padding: "0px 10px",
                        // marginBottom: "30px",
                        marginTop: "-20px !important",
                        height: "350px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <h3 style={{ fontWeight: "500" }}>Media Sources </h3>
                        <IconButton
                          onClick={() => setOpen({ ...open, bool7: true })}
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
                          <h3 style={{ fontWeight: "500" }}>Media Sources </h3>
                          <SimpleTabsModal
                            shrink={true}
                            query={query}
                            setLoading={setLoading}
                            data={dataSets}
                            add={true}
                            allData={[
                              { name: "FB", cpi: 4, users: 5, cost: 6 },
                              { name: "Ggl", cpi: 12, users: 13, cost: 14 },
                              { name: "IS", cpi: 15, users: 16, cost: 17 },
                              { name: "AL", cpi: 18, users: 19, cost: 20 },
                              { name: "UA", cpi: 21, users: 22, cost: 23 },
                              { name: "TJ", cpi: 24, users: 25, cost: 26 },
                              { name: "Xiaomi", cpi: 27, users: 28, cost: 29 },
                              { name: "BDG", cpi: 30, users: 31, cost: 32 },
                              { name: "MTG", cpi: 33, users: 34, cost: 35 },
                              { name: "AC", cpi: 36, users: 37, cost: 38 },
                              { name: "CB", cpi: 39, users: 40, cost: 41 },
                              { name: "SP", cpi: 42, users: 43, cost: 44 },
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
                          { name: "Ggl", cpi: 12, users: 13, cost: 14 },
                          { name: "IS", cpi: 15, users: 16, cost: 17 },
                          { name: "AL", cpi: 18, users: 19, cost: 20 },
                          { name: "UA", cpi: 21, users: 22, cost: 23 },
                          { name: "TJ", cpi: 24, users: 25, cost: 26 },
                          { name: "Xiaomi", cpi: 27, users: 28, cost: 29 },
                          { name: "BDG", cpi: 30, users: 31, cost: 32 },
                          { name: "MTG", cpi: 33, users: 34, cost: 35 },
                          { name: "AC", cpi: 36, users: 37, cost: 38 },
                          { name: "CB", cpi: 39, users: 40, cost: 41 },
                          { name: "SP", cpi: 42, users: 43, cost: 44 },
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
                      <h3 style={{ fontWeight: "500" }}>Media Sources </h3>
                      <IconButton
                        onClick={() => setOpen({ ...open, bool7: true })}
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
                        <h3 style={{ fontWeight: "500" }}>Media Sources </h3>
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
            </div>
          )}
          <div>
            <Selector
              loader={(l) => {
                setData((currentData) => ({ ...currentData, loader: l }));
              }}
              count={count}
              setCount={(e) => setCount(e)}
              onQueryChange={handleQuery}
              query={query}
              game1={game1}
            />
          </div>
        </div>
      </div>
      <RevenueSpendPopup
        open={revenueSpendOpen}
        dialogRef={revenueSpendDialogRef}
        position={revenueSpendPosition}
        size={revenueSpendSize}
        chartHeight={revenueSpendChartHeight}
        resizeHandles={revenueSpendDialogResizeHandles}
        closeDateFilterFromDialog={closeDateFilterFromDialog}
        handleDragStart={handleRevenueSpendDragStart}
        handleResizeStart={handleRevenueSpendResizeStart}
        onDateFilterClick={handleClick}
        onClose={() => setRevenueSpendOpen(false)}
        showGameWise={showGameWiseRevenueSpend}
        onToggleGameWise={() => setShowGameWiseRevenueSpend((value) => !value)}
        gameLoading={
          dashboardGameLoading || dashboardGameQuery !== (query || "AI")
        }
        gameError={dashboardGameError}
        games={games}
        selectedGame={selectedRevenueSpendGame}
        onSelectedGameChange={setSelectedRevenueSpendGame}
        selectedGameData={selectedRevenueSpendGameData}
        graphData={revenueSpendGraphData}
        xAxisRange={{ start, end }}
      />
      <NewDauPopup
        open={newDauOpen}
        dialogRef={newDauDialogRef}
        closeDateFilterFromDialog={closeDateFilterFromDialog}
        onDateFilterClick={handleClick}
        onClose={() => setNewDauOpen(false)}
        showGameWise={showGameWiseNewDau}
        onToggleGameWise={() => setShowGameWiseNewDau((value) => !value)}
        gameLoading={
          dashboardGameLoading || dashboardGameQuery !== (query || "AI")
        }
        gameError={dashboardGameError}
        games={games}
        selectedGame={selectedNewDauGame}
        onSelectedGameChange={setSelectedNewDauGame}
        selectedGameData={selectedNewDauGameData}
        graphData={newDauGraphData}
        xAxisRange={{ start, end }}
      />
      <Popover
        id={id}
        open={open1}
        anchorEl={anchorEl}
        onClose={handleClose}
        sx={{ zIndex: 1700 }}
        PaperProps={{
          sx: {
            zIndex: 1701,
          },
        }}
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
          ref={dateRangePopoverRef}
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
              handleClose();
            }}
          >
            Filter
          </Button>
        </div>
      </Popover>
    </Box>
  );
}

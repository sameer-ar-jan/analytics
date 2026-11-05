import BigNumber from "bignumber.js";
import React, { useLayoutEffect, useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { styled } from "@mui/system";
import classes from "./QuestionsTable.module.css";
import moment from "moment";
const TableCellDate = styled(TableCell)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
function QuestionsTable(props) {
  const ecpi = (totalSpend, totalusers) => {
    if (totalusers === 0) {
      return 0;
    } else {
      return totalSpend / totalusers;
    }
  };

  function roundToDecimal(value, decimalPlaces) {
    let bn = new BigNumber(value);
    if (bn?.isFinite()) {
      return bn?.toFixed(decimalPlaces);
    } else {
      return 0;
    }
  }

  const ret_per = (ret_users, totalusers) => {
    if (totalusers === 0) {
      return 0;
    } else {
      return (ret_users / totalusers) * 100;
    }
  };

  let monthNames = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };
  let yearNames = {
    lastYear: (new Date().getFullYear() - 1).toString().slice(-2),
    currentYear: new Date().getFullYear().toString().slice(-2),
  };
  let yearNameSort = {
    22: 22,
    23: 23,
    24: 24,
    25: 25,
    26: 26,
    27: 27,
    28: 28,
    29: 29,
    30: 30,
  };
  function replaceNaNWithZero(value) {
    return isNaN(value) || value === null ? 0 : value;
  }

  const handleOptionClick = (query) => {
    props?.onQueryChange(query, props?.game1);
  };
  function CommaSeparated(number) {
    if (typeof number === "number") {
      return number?.toLocaleString();
    }
  }
  const [topTable, setTopTable] = useState([]);
  const [topTableExpand, setTopTableExpand] = useState([]);
  useEffect(() => {
    const display =
      props?.questions1?.length > 1 && props?.questions?.length > 1;
    const sortedQuestions = [...(props?.questions1 || [])].sort(
      function (a, b) {
        return monthNames[a?.month] - monthNames[b?.month];
      },
    );
    const currentYear = new Date().getFullYear().toString().slice(-2);

    // Output: 25
    const lastYear = (new Date().getFullYear() - 1).toString().slice(-2);
    // Output: 24

    let temp = [];
    sortedQuestions.map((item) => {
      if (item?.month !== "Last 30 days" && item?.month !== "overall")
        temp?.push(item);
    });

    temp?.sort(function (a, b) {
      return monthNames[a?.month] - monthNames[b?.month];
    });

    let temp1 = [];
    temp?.map((item) => {
      if (
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]?.includes(item?.month) &&
        (item?.year === yearNames.currentYear ||
          item?.year === yearNames.lastYear)
      ) {
        temp1.push(item);
      }
    });
    temp1?.sort(function (a, b) {
      return yearNameSort[a?.year] - yearNameSort[b?.year];
    });
    temp?.sort(function (a, b) {
      return yearNameSort[a?.year] - yearNameSort[b?.year];
    });

    let countLastYear = 0;
    let countCurrentYear = 0;
    temp1?.map((i) => {
      i.year === yearNames.currentYear && countLastYear++;
      i.year === yearNames.lastYear && countCurrentYear++;
    });
    let totalCount = countLastYear + countCurrentYear;
    let extraMonths = totalCount - 12;

    let temp2 = [];
    temp1.map((i) => {
      if (extraMonths < 1) {
        temp2.push(i);
      }
      extraMonths && extraMonths--;
    });
    temp2?.sort(function (a, b) {
      return yearNameSort[a?.year] - yearNameSort[b?.year];
    });
    setTopTable(temp2.slice(-4));
    setTopTableExpand(temp);
    setTimeout(() => {
      display && props?.setLoading(false);
    }, 1000);
  }, [props?.questions1, props?.questions]);

  return (
    <div>
      <div className={classes?.styles}>
        <Table
          sx={{
            borderSpacing: 0,
            border: "1px solid #cccccc",
            width: "100%",
            overflowY: "scroll",
            overflowX: "scroll",
          }}
        >
          <TableHead
            sx={{
              position: "sticky",
              top: 65,
              "z-index": 10,
            }}
            className={classes?.Thead}
          >
            <TableRow>
              <TableCell
                sx={{ position: "sticky", left: 0 }}
                className={classes?.group1}
              ></TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  left: props?.questions[10]?.geo
                    ? 33
                    : props?.questions[10]?.game &&
                        props?.query?.startsWith("GW")
                      ? 58
                      : 18,
                }}
                className={classes?.group1}
              ></TableCell>
              <TableCell className={classes?.group1} colSpan={2}>
                Spend
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={4}
                sx={{ borderRight: "5px solid white !important" }}
              >
                Users
                {(props?.pageID === "overall" ||
                  props?.pageID === "dashboard") &&
                  props?.onOpenNewDauGraph && (
                    <Tooltip title="New vs DAU">
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          props.onOpenNewDauGraph();
                        }}
                        sx={{
                          width: 22,
                          height: 22,
                          padding: 0,
                          color: "black",
                        }}
                      >
                        <QueryStatsIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
              </TableCell>
              <TableCell
                sx={{ borderLeft: "5px solid white !important" }}
                className={classes?.group2}
                colSpan={4}
              >
                Ret
              </TableCell>
              <TableCell className={classes?.group5} colSpan={1}></TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={5}
                sx={{ borderRight: "5px solid white !important" }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  Rev
                  {(props?.pageID === "overall" ||
                    props?.pageID === "dashboard") &&
                    props?.onOpenRevenueSpendGraph && (
                      <Tooltip title="Revenue vs Total Spend">
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            props.onOpenRevenueSpendGraph();
                          }}
                          sx={{
                            width: 22,
                            height: 22,
                            padding: 0,
                            color: "black",
                          }}
                        >
                          <QueryStatsIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                </span>
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={3}
                sx={{ borderRight: "5px solid white !important" }}
              >
                ADS per DAU
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                FB
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                Ggl
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                IS
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                AL
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                UA
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                TJ
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                Adjoe
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                Swagbucks
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                MTG
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                Aura
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                litoff
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={7}
                sx={{ borderRight: "5px solid white !important" }}
              >
                SP
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={3}
                sx={{
                  borderRight: "5px solid white !important",
                  color: "black",
                  backgroundColor: " #ADD8E6 !important",
                }}
              >
                IS
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={3}
                sx={{
                  color: "black",
                  borderRight: "5px solid white !important",
                  backgroundColor: "#87CEFA !important",
                }}
              >
                BR
              </TableCell>
              <TableCell
                className={classes?.group2}
                colSpan={3}
                sx={{ color: "black", backgroundColor: "#DDA0DD !important" }}
              >
                RV
              </TableCell>
            </TableRow>
            <TableRow
              sx={{ height: "3rem !important" }}
              className={classes?.tableRow}
            >
              <TableCell
                sx={{ position: "sticky", left: 0 }}
                className={classes?.tableHeader}
              ></TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  left: props?.questions[10]?.geo
                    ? 33
                    : props?.questions[10]?.game &&
                        props?.query?.startsWith("GW")
                      ? 58
                      : 18,
                }}
                className={classes?.tableHeader}
              ></TableCell>
              <TableCell className={classes?.tableHeader}>Total</TableCell>
              <TableCell className={classes?.tableHeader}>ecpi</TableCell>
              <TableCell className={classes?.tableHeader}>New</TableCell>
              <TableCell className={classes?.tableHeader}>paid</TableCell>
              <TableCell className={classes?.tableHeader}>DAU</TableCell>
              <TableCell className={classes?.tableHeader1}>org%</TableCell>

              <TableCell
                sx={{ borderLeft: "5px solid white !important" }}
                className={classes?.tableHeader}
              >
                d1
              </TableCell>
              <TableCell className={classes?.tableHeader}>d7</TableCell>
              <TableCell className={classes?.tableHeader}>d14</TableCell>
              <TableCell
                className={classes?.tableHeader1}
                sx={{ borderRight: "1px solid #c3c3c3 !important" }}
              >
                d30
              </TableCell>

              <TableCell
                className={classes?.tableHeader3}
                sx={{ borderLeft: "1px solid #c3c3c3" }}
              ></TableCell>

              <TableCell className={classes?.headerGreen}>AdRev</TableCell>
              <TableCell className={classes?.headerGreen}>IAP</TableCell>
              <TableCell className={classes?.headerGreen}>Ad</TableCell>
              <TableCell className={classes?.headerGreen}>AdDau</TableCell>
              <TableCell
                className={classes?.headerGreen1}
                sx={{ borderRight: "5px solid white !important" }}
              >
                Arpdau
              </TableCell>

              <TableCell className={classes?.tableHeader}>IS</TableCell>
              <TableCell className={classes?.tableHeader}>RV</TableCell>
              <TableCell className={classes?.tableHeader1}>BR</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell className={classes?.tableHeader}>users</TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell className={classes?.tableHeader}>users</TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell className={classes?.tableHeader}>users</TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell className={classes?.tableHeader}>users</TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell z className={classes?.tableHeader}>
                users
              </TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell className={classes?.tableHeader}>users</TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell className={classes?.tableHeader}>users</TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell className={classes?.tableHeader}>users</TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell className={classes?.tableHeader}>users</TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell className={classes?.tableHeader}>users</TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell className={classes?.tableHeader}>users</TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>spend</TableCell>
              <TableCell className={classes?.tableHeader}>users</TableCell>
              <TableCell className={classes?.tableHeader}>cpi</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D0</TableCell>
              <TableCell className={classes?.tableHeader}>R0_D7</TableCell>
              <TableCell className={classes?.tableHeader}>Ret_D1</TableCell>
              <TableCell className={classes?.tableHeader1}>Ret_D7</TableCell>

              <TableCell className={classes?.tableHeader}>imp</TableCell>
              <TableCell className={classes?.tableHeader}>Rev</TableCell>
              <TableCell className={classes?.tableHeader1}>CPM</TableCell>

              <TableCell className={classes?.tableHeader}>imp</TableCell>
              <TableCell className={classes?.tableHeader}>Rev</TableCell>
              <TableCell className={classes?.tableHeader1}>CPM</TableCell>

              <TableCell className={classes?.tableHeader}>imp</TableCell>
              <TableCell className={classes?.tableHeader}>Rev</TableCell>
              <TableCell className={classes?.tableHeader}>CPM</TableCell>
            </TableRow>
          </TableHead>

          {props?.showFull ? (
            <TableBody
              className={classes?.spacedBody}
              displayRowCheckbox={false}
            >
              {topTableExpand &&
                topTableExpand?.map(
                  (item, rowIndex) =>
                    [
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ]?.includes(item?.month) && (
                      // &&
                      // (item?.year === yearNames.lastYear ||
                      //   item?.year === yearNames.currentYear)
                      <TableRow key={rowIndex} className={classes?.tableRow}>
                        <TableCell
                          sx={{ position: "sticky", left: 0 }}
                          className={classes?.tableCellM}
                        >
                          {props?.showFull && item?.year}
                        </TableCell>
                        <TableCellDate
                          sx={{
                            position: "sticky",
                            left: props?.questions[10]?.geo
                              ? 33
                              : props?.questions[10]?.game &&
                                  props?.query?.startsWith("GW")
                                ? 58
                                : 18,
                          }}
                          className={classes?.tableCellM}
                        >
                          {item?.month && item?.month}
                        </TableCellDate>
                        <TableCell className={classes?.tableCellM1}>
                          {props?.pageID === "overall" &&
                          (props?.query === "AI" || props?.query === "A") &&
                          item?.month === "October"
                            ? CommaSeparated(
                                replaceNaNWithZero(
                                  Math?.round(item?.total_spend) +
                                    (props?.spendAdjustment[
                                      item?.month?.slice(0, 3)
                                    ] !== undefined &&
                                      props?.spendAdjustment[
                                        item?.month?.slice(0, 3)
                                      ] !== null &&
                                      props?.spendAdjustment[
                                        item?.month?.slice(0, 3)
                                      ]?.actualcost -
                                        props?.spendAdjustment[
                                          item?.month?.slice(0, 3)
                                        ]?.appsflyercost),
                                ),
                              )
                            : props?.pageID === "overall" &&
                                (props?.query === "AI" ||
                                  props?.query === "A") &&
                                item?.month === "November"
                              ? CommaSeparated(
                                  replaceNaNWithZero(
                                    Math?.round(item?.total_spend) +
                                      (props?.spendAdjustment[
                                        item?.month?.slice(0, 3)
                                      ] !== undefined &&
                                        props?.spendAdjustment[
                                          item?.month?.slice(0, 3)
                                        ] !== null &&
                                        props?.spendAdjustment[
                                          item?.month?.slice(0, 3)
                                        ]?.actualcost -
                                          props?.spendAdjustment[
                                            item?.month?.slice(0, 3)
                                          ]?.appsflyercost),
                                  ),
                                )
                              : props?.pageID === "overall" &&
                                  (props?.query === "AI" ||
                                    props?.query === "A") &&
                                  item?.month === "December"
                                ? CommaSeparated(
                                    replaceNaNWithZero(
                                      Math?.round(item?.total_spend) +
                                        (props?.spendAdjustment[
                                          item?.month?.slice(0, 3)
                                        ] !== undefined &&
                                          props?.spendAdjustment[
                                            item?.month?.slice(0, 3)
                                          ] !== null &&
                                          props?.spendAdjustment[
                                            item?.month?.slice(0, 3)
                                          ]?.actualcost -
                                            props?.spendAdjustment[
                                              item?.month?.slice(0, 3)
                                            ]?.appsflyercost),
                                    ),
                                  )
                                : props?.pageID === "overall" &&
                                    (props?.query === "AI" ||
                                      props?.query === "A") &&
                                    item?.month === "January"
                                  ? CommaSeparated(
                                      replaceNaNWithZero(
                                        Math?.round(item?.total_spend) +
                                          (props?.spendAdjustment[
                                            item?.month?.slice(0, 3)
                                          ] !== undefined &&
                                            props?.spendAdjustment[
                                              item?.month?.slice(0, 3)
                                            ] !== null &&
                                            props?.spendAdjustment[
                                              item?.month?.slice(0, 3)
                                            ]?.actualcost -
                                              props?.spendAdjustment[
                                                item?.month?.slice(0, 3)
                                              ]?.appsflyercost),
                                      ),
                                    )
                                  : props?.pageID === "overall" &&
                                      (props?.query === "AI" ||
                                        props?.query === "A") &&
                                      item?.month === "February"
                                    ? CommaSeparated(
                                        replaceNaNWithZero(
                                          Math?.round(item?.total_spend) +
                                            (props?.spendAdjustment[
                                              item?.month?.slice(0, 3)
                                            ] !== undefined &&
                                              props?.spendAdjustment[
                                                item?.month?.slice(0, 3)
                                              ] !== null &&
                                              props?.spendAdjustment[
                                                item?.month?.slice(0, 3)
                                              ]?.actualcost -
                                                props?.spendAdjustment[
                                                  item?.month?.slice(0, 3)
                                                ]?.appsflyercost),
                                        ),
                                      )
                                    : props?.pageID === "overall" &&
                                        (props?.query === "AI" ||
                                          props?.query === "A") &&
                                        item?.month === "March"
                                      ? CommaSeparated(
                                          replaceNaNWithZero(
                                            Math?.round(item?.total_spend) +
                                              (props?.spendAdjustment[
                                                item?.month?.slice(0, 3)
                                              ] !== undefined &&
                                                props?.spendAdjustment[
                                                  item?.month?.slice(0, 3)
                                                ] !== null &&
                                                props?.spendAdjustment[
                                                  item?.month?.slice(0, 3)
                                                ]?.actualcost -
                                                  props?.spendAdjustment[
                                                    item?.month?.slice(0, 3)
                                                  ]?.appsflyercost),
                                          ),
                                        )
                                      : props?.pageID === "overall" &&
                                          (props?.query === "AI" ||
                                            props?.query === "A") &&
                                          item?.month === "April"
                                        ? CommaSeparated(
                                            replaceNaNWithZero(
                                              Math?.round(item?.total_spend) +
                                                (props?.spendAdjustment[
                                                  item?.month?.slice(0, 3)
                                                ] !== undefined &&
                                                  props?.spendAdjustment[
                                                    item?.month?.slice(0, 3)
                                                  ] !== null &&
                                                  props?.spendAdjustment[
                                                    item?.month?.slice(0, 3)
                                                  ]?.actualcost -
                                                    props?.spendAdjustment[
                                                      item?.month?.slice(0, 3)
                                                    ]?.appsflyercost),
                                            ),
                                          )
                                        : props?.pageID === "overall" &&
                                            (props?.query === "AI" ||
                                              props?.query === "A") &&
                                            item?.month === "May"
                                          ? CommaSeparated(
                                              replaceNaNWithZero(
                                                Math?.round(item?.total_spend) +
                                                  (props?.spendAdjustment[
                                                    item?.month?.slice(0, 3)
                                                  ] !== undefined &&
                                                    props?.spendAdjustment[
                                                      item?.month?.slice(0, 3)
                                                    ] !== null &&
                                                    props?.spendAdjustment[
                                                      item?.month?.slice(0, 3)
                                                    ]?.actualcost -
                                                      props?.spendAdjustment[
                                                        item?.month?.slice(0, 3)
                                                      ]?.appsflyercost),
                                              ),
                                            )
                                          : props?.pageID === "overall" &&
                                              (props?.query === "AI" ||
                                                props?.query === "A") &&
                                              item?.month === "June"
                                            ? CommaSeparated(
                                                replaceNaNWithZero(
                                                  Math?.round(
                                                    item?.total_spend,
                                                  ) +
                                                    (props?.spendAdjustment[
                                                      item?.month?.slice(0, 3)
                                                    ] !== undefined &&
                                                      props?.spendAdjustment[
                                                        item?.month?.slice(0, 3)
                                                      ] !== null &&
                                                      props?.spendAdjustment[
                                                        item?.month?.slice(0, 3)
                                                      ]?.actualcost -
                                                        props?.spendAdjustment[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.appsflyercost),
                                                ),
                                              )
                                            : props?.pageID === "overall" &&
                                                (props?.query === "AI" ||
                                                  props?.query === "A") &&
                                                item?.month === "July"
                                              ? CommaSeparated(
                                                  replaceNaNWithZero(
                                                    Math?.round(
                                                      item?.total_spend,
                                                    ) +
                                                      (props?.spendAdjustment[
                                                        item?.month?.slice(0, 3)
                                                      ] !== undefined &&
                                                        props?.spendAdjustment[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ] !== null &&
                                                        props?.spendAdjustment[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.actualcost -
                                                          props
                                                            ?.spendAdjustment[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.appsflyercost),
                                                  ),
                                                )
                                              : props?.pageID === "overall" &&
                                                  (props?.query === "AI" ||
                                                    props?.query === "A") &&
                                                  item?.month === "August"
                                                ? CommaSeparated(
                                                    replaceNaNWithZero(
                                                      Math?.round(
                                                        item?.total_spend,
                                                      ) +
                                                        (props?.spendAdjustment[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ] !== undefined &&
                                                          props
                                                            ?.spendAdjustment[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ] !== null &&
                                                          props
                                                            ?.spendAdjustment[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.actualcost -
                                                            props
                                                              ?.spendAdjustment[
                                                              item?.month?.slice(
                                                                0,
                                                                3,
                                                              )
                                                            ]?.appsflyercost),
                                                    ),
                                                  )
                                                : props?.pageID === "overall" &&
                                                    (props?.query === "AI" ||
                                                      props?.query === "A") &&
                                                    item?.month === "September"
                                                  ? CommaSeparated(
                                                      replaceNaNWithZero(
                                                        Math?.round(
                                                          item?.total_spend,
                                                        ) +
                                                          (props
                                                            ?.spendAdjustment[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ] !== undefined &&
                                                            props
                                                              ?.spendAdjustment[
                                                              item?.month?.slice(
                                                                0,
                                                                3,
                                                              )
                                                            ] !== null &&
                                                            props
                                                              ?.spendAdjustment[
                                                              item?.month?.slice(
                                                                0,
                                                                3,
                                                              )
                                                            ]?.actualcost -
                                                              props
                                                                ?.spendAdjustment[
                                                                item?.month?.slice(
                                                                  0,
                                                                  3,
                                                                )
                                                              ]?.appsflyercost),
                                                      ),
                                                    )
                                                  : CommaSeparated(
                                                      replaceNaNWithZero(
                                                        Math?.round(
                                                          item?.total_spend,
                                                        ),
                                                      ),
                                                    )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {replaceNaNWithZero(roundToDecimal(item?.ecpi, 2))}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(item?.total_users),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(replaceNaNWithZero(item?.paid_users))}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(replaceNaNWithZero(item?.DAU))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCellM1}
                          sx={{
                            color: "#ff9900",
                            borderRight: "5px solid white !important",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.org_per, 0))}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {Math?.round(
                            ret_per(item?.Retention_Day_1, item?.total_users),
                            2,
                          )?.toFixed(0)}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {Math?.round(
                            ret_per(item?.Retention_Day_7, item?.total_users),
                            2,
                          )?.toFixed(0)}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {Math?.round(
                            ret_per(item?.Retention_Day_14, item?.total_users),
                            2,
                          )?.toFixed(0)}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            color: "#ff9900",
                            borderRight: "1px solid #c3c3c3",
                          }}
                        >
                          {Math?.round(
                            ret_per(item?.Retention_Day_30, item?.total_users),
                            2,
                          )?.toFixed(0)}
                        </TableCell>

                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            color: "#ff9900 !important",
                            backgroundColor: "#FFFFFF",
                            borderRight: "1px solid #c3c3c3",
                          }}
                        >
                          {props?.pageID === "overall" &&
                          (props?.query === "AI" || props?.query === "A") &&
                          item?.month === "October"
                            ? CommaSeparated(
                                replaceNaNWithZero(Math?.round(item?.Profit)) +
                                  (item.year === "23" && props?.value1) +
                                  replaceNaNWithZero(
                                    props?.addValues[item?.month?.slice(0, 3)]
                                      ?.rev,
                                  ) +
                                  replaceNaNWithZero(
                                    props?.addValues[item?.month?.slice(0, 3)]
                                      ?.cost,
                                  ),
                              )
                            : props?.pageID === "overall" &&
                                (props?.query === "AI" ||
                                  props?.query === "A") &&
                                item?.month === "November"
                              ? CommaSeparated(
                                  replaceNaNWithZero(
                                    Math?.round(item?.Profit),
                                  ) +
                                    (item.year === "23" && props?.value2) +
                                    replaceNaNWithZero(
                                      props?.addValues[item?.month?.slice(0, 3)]
                                        ?.rev,
                                    ) +
                                    replaceNaNWithZero(
                                      props?.addValues[item?.month?.slice(0, 3)]
                                        ?.cost,
                                    ),
                                )
                              : props?.pageID === "overall" &&
                                  (props?.query === "AI" ||
                                    props?.query === "A") &&
                                  item?.month === "December"
                                ? CommaSeparated(
                                    replaceNaNWithZero(
                                      Math?.round(item?.Profit),
                                    ) +
                                      (item.year === "23" && props?.value3) +
                                      replaceNaNWithZero(
                                        props?.addValues[
                                          item?.month?.slice(0, 3)
                                        ]?.rev,
                                      ) +
                                      replaceNaNWithZero(
                                        props?.addValues[
                                          item?.month?.slice(0, 3)
                                        ]?.cost,
                                      ),
                                  )
                                : props?.pageID === "overall" &&
                                    (props?.query === "AI" ||
                                      props?.query === "A") &&
                                    item?.month === "January"
                                  ? CommaSeparated(
                                      replaceNaNWithZero(
                                        Math?.round(item?.Profit),
                                      ) +
                                        replaceNaNWithZero(
                                          props?.addValues[
                                            item?.month?.slice(0, 3)
                                          ]?.rev,
                                        ) +
                                        replaceNaNWithZero(
                                          props?.addValues[
                                            item?.month?.slice(0, 3)
                                          ]?.cost,
                                        ),
                                    )
                                  : props?.pageID === "overall" &&
                                      (props?.query === "AI" ||
                                        props?.query === "A") &&
                                      item?.month === "February"
                                    ? CommaSeparated(
                                        replaceNaNWithZero(
                                          Math?.round(item?.Profit),
                                        ) +
                                          replaceNaNWithZero(
                                            props?.addValues[
                                              item?.month?.slice(0, 3)
                                            ]?.rev,
                                          ) +
                                          replaceNaNWithZero(
                                            props?.addValues[
                                              item?.month?.slice(0, 3)
                                            ]?.cost,
                                          ),
                                      )
                                    : props?.pageID === "overall" &&
                                        (props?.query === "AI" ||
                                          props?.query === "A") &&
                                        item?.month === "March"
                                      ? CommaSeparated(
                                          replaceNaNWithZero(
                                            Math?.round(item?.Profit),
                                          ) +
                                            replaceNaNWithZero(
                                              props?.addValues[
                                                item?.month?.slice(0, 3)
                                              ]?.rev,
                                            ) +
                                            replaceNaNWithZero(
                                              props?.addValues[
                                                item?.month?.slice(0, 3)
                                              ]?.cost,
                                            ),
                                        )
                                      : props?.pageID === "overall" &&
                                          (props?.query === "AI" ||
                                            props?.query === "A") &&
                                          item?.month === "April"
                                        ? CommaSeparated(
                                            replaceNaNWithZero(
                                              Math?.round(item?.Profit),
                                            ) +
                                              replaceNaNWithZero(
                                                props?.addValues[
                                                  item?.month?.slice(0, 3)
                                                ]?.rev,
                                              ) +
                                              replaceNaNWithZero(
                                                props?.addValues[
                                                  item?.month?.slice(0, 3)
                                                ]?.cost,
                                              ),
                                          )
                                        : props?.pageID === "overall" &&
                                            (props?.query === "AI" ||
                                              props?.query === "A") &&
                                            item?.month === "May"
                                          ? CommaSeparated(
                                              replaceNaNWithZero(
                                                Math?.round(item?.Profit),
                                              ) +
                                                replaceNaNWithZero(
                                                  props?.addValues[
                                                    item?.month?.slice(0, 3)
                                                  ]?.rev,
                                                ) +
                                                replaceNaNWithZero(
                                                  props?.addValues[
                                                    item?.month?.slice(0, 3)
                                                  ]?.cost,
                                                ),
                                            )
                                          : props?.pageID === "overall" &&
                                              (props?.query === "AI" ||
                                                props?.query === "A") &&
                                              item?.month === "June"
                                            ? CommaSeparated(
                                                replaceNaNWithZero(
                                                  Math?.round(item?.Profit),
                                                ) +
                                                  replaceNaNWithZero(
                                                    props?.addValues[
                                                      item?.month?.slice(0, 3)
                                                    ]?.rev,
                                                  ) +
                                                  replaceNaNWithZero(
                                                    props?.addValues[
                                                      item?.month?.slice(0, 3)
                                                    ]?.cost,
                                                  ),
                                              )
                                            : props?.pageID === "overall" &&
                                                (props?.query === "AI" ||
                                                  props?.query === "A") &&
                                                item?.month === "July"
                                              ? CommaSeparated(
                                                  replaceNaNWithZero(
                                                    Math?.round(item?.Profit),
                                                  ) +
                                                    replaceNaNWithZero(
                                                      props?.addValues[
                                                        item?.month?.slice(0, 3)
                                                      ]?.rev,
                                                    ) +
                                                    replaceNaNWithZero(
                                                      props?.addValues[
                                                        item?.month?.slice(0, 3)
                                                      ]?.cost,
                                                    ),
                                                )
                                              : props?.pageID === "overall" &&
                                                  (props?.query === "AI" ||
                                                    props?.query === "A") &&
                                                  item?.month === "August"
                                                ? CommaSeparated(
                                                    replaceNaNWithZero(
                                                      Math?.round(item?.Profit),
                                                    ) +
                                                      replaceNaNWithZero(
                                                        props?.addValues[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.rev,
                                                      ) +
                                                      replaceNaNWithZero(
                                                        props?.addValues[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.cost,
                                                      ),
                                                  )
                                                : props?.pageID === "overall" &&
                                                    (props?.query === "AI" ||
                                                      props?.query === "A") &&
                                                    item?.month === "September"
                                                  ? CommaSeparated(
                                                      replaceNaNWithZero(
                                                        Math?.round(
                                                          item?.Profit,
                                                        ),
                                                      ) +
                                                        replaceNaNWithZero(
                                                          props?.addValues[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.rev,
                                                        ) +
                                                        replaceNaNWithZero(
                                                          props?.addValues[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.cost,
                                                        ),
                                                    )
                                                  : props?.pageID ===
                                                        "dashboard" &&
                                                      (props?.query === "AI" ||
                                                        props?.query === "A" ||
                                                        props?.query ===
                                                          "US A") &&
                                                      props?.game1 === "MTN" &&
                                                      item?.month === "June"
                                                    ? CommaSeparated(
                                                        replaceNaNWithZero(
                                                          Math?.round(
                                                            item?.Profit,
                                                          ),
                                                        ) +
                                                          (item.year === "23" &&
                                                            props?.value4),
                                                      )
                                                    : props?.pageID ===
                                                          "dashboard" &&
                                                        (props?.query ===
                                                          "AI" ||
                                                          props?.query ===
                                                            "A" ||
                                                          props?.query ===
                                                            "US A") &&
                                                        props?.game1 ===
                                                          "MTN" &&
                                                        item?.month === "July"
                                                      ? CommaSeparated(
                                                          replaceNaNWithZero(
                                                            Math?.round(
                                                              item?.Profit,
                                                            ),
                                                          ) +
                                                            (item.year ===
                                                              "23" &&
                                                              props?.value5),
                                                        )
                                                      : props?.pageID ===
                                                            "dashboard" &&
                                                          (props?.query ===
                                                            "AI" ||
                                                            props?.query ===
                                                              "A" ||
                                                            props?.query ===
                                                              "US A") &&
                                                          props?.game1 ===
                                                            "MTN" &&
                                                          item?.month ===
                                                            "August"
                                                        ? CommaSeparated(
                                                            replaceNaNWithZero(
                                                              Math?.round(
                                                                item?.Profit,
                                                              ),
                                                            ) +
                                                              (item.year ===
                                                                "23" &&
                                                                props?.value6),
                                                          )
                                                        : props?.pageID ===
                                                              "dashboard" &&
                                                            (props?.query ===
                                                              "AI" ||
                                                              props?.query ===
                                                                "A" ||
                                                              props?.query ===
                                                                "US A") &&
                                                            props?.game1 ===
                                                              "MTN" &&
                                                            item?.month ===
                                                              "September"
                                                          ? CommaSeparated(
                                                              replaceNaNWithZero(
                                                                Math?.round(
                                                                  item?.Profit,
                                                                ),
                                                              ) +
                                                                (item.year ===
                                                                  "23" &&
                                                                  props?.value7),
                                                            )
                                                          : CommaSeparated(
                                                              replaceNaNWithZero(
                                                                Math?.round(
                                                                  item?.Profit,
                                                                ),
                                                              ),
                                                            )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableGreen}
                          sx={{ color: "#ff9900 !important" }}
                        >
                          {props?.pageID === "overall" &&
                          (props?.query === "AI" || props?.query === "A") &&
                          item?.month === "October"
                            ? CommaSeparated(
                                replaceNaNWithZero(Math?.round(item?.Ad_Rev)) +
                                  (item.year === "23" && props?.value1) +
                                  replaceNaNWithZero(
                                    props?.addValues[item?.month?.slice(0, 3)]
                                      ?.rev,
                                  ),
                              )
                            : props?.pageID === "overall" &&
                                (props?.query === "AI" ||
                                  props?.query === "A") &&
                                item?.month === "November"
                              ? CommaSeparated(
                                  replaceNaNWithZero(
                                    Math?.round(item?.Ad_Rev),
                                  ) +
                                    (item.year === "23" && props?.value2) +
                                    replaceNaNWithZero(
                                      props?.addValues[item?.month?.slice(0, 3)]
                                        ?.rev,
                                    ),
                                )
                              : props?.pageID === "overall" &&
                                  (props?.query === "AI" ||
                                    props?.query === "A") &&
                                  item?.month === "December"
                                ? CommaSeparated(
                                    replaceNaNWithZero(
                                      Math?.round(item?.Ad_Rev),
                                    ) +
                                      (item.year === "23" && props?.value3) +
                                      replaceNaNWithZero(
                                        props?.addValues[
                                          item?.month?.slice(0, 3)
                                        ]?.rev,
                                      ),
                                  )
                                : props?.pageID === "overall" &&
                                    (props?.query === "AI" ||
                                      props?.query === "A") &&
                                    item?.month === "January"
                                  ? CommaSeparated(
                                      replaceNaNWithZero(
                                        Math?.round(item?.Ad_Rev),
                                      ) +
                                        replaceNaNWithZero(
                                          props?.addValues[
                                            item?.month?.slice(0, 3)
                                          ]?.rev,
                                        ),
                                    )
                                  : props?.pageID === "overall" &&
                                      (props?.query === "AI" ||
                                        props?.query === "A") &&
                                      item?.month === "February"
                                    ? CommaSeparated(
                                        replaceNaNWithZero(
                                          Math?.round(item?.Ad_Rev),
                                        ) +
                                          replaceNaNWithZero(
                                            props?.addValues[
                                              item?.month?.slice(0, 3)
                                            ]?.rev,
                                          ),
                                      )
                                    : props?.pageID === "overall" &&
                                        (props?.query === "AI" ||
                                          props?.query === "A") &&
                                        item?.month === "March"
                                      ? CommaSeparated(
                                          replaceNaNWithZero(
                                            Math?.round(item?.Ad_Rev),
                                          ) +
                                            replaceNaNWithZero(
                                              props?.addValues[
                                                item?.month?.slice(0, 3)
                                              ]?.rev,
                                            ),
                                        )
                                      : props?.pageID === "overall" &&
                                          (props?.query === "AI" ||
                                            props?.query === "A") &&
                                          item?.month === "April"
                                        ? CommaSeparated(
                                            replaceNaNWithZero(
                                              Math?.round(item?.Ad_Rev),
                                            ) +
                                              replaceNaNWithZero(
                                                props?.addValues[
                                                  item?.month?.slice(0, 3)
                                                ]?.rev,
                                              ),
                                          )
                                        : props?.pageID === "overall" &&
                                            (props?.query === "AI" ||
                                              props?.query === "A") &&
                                            item?.month === "May"
                                          ? CommaSeparated(
                                              replaceNaNWithZero(
                                                Math?.round(item?.Ad_Rev),
                                              ) +
                                                replaceNaNWithZero(
                                                  props?.addValues[
                                                    item?.month?.slice(0, 3)
                                                  ]?.rev,
                                                ),
                                            )
                                          : props?.pageID === "overall" &&
                                              (props?.query === "AI" ||
                                                props?.query === "A") &&
                                              item?.month === "June"
                                            ? CommaSeparated(
                                                replaceNaNWithZero(
                                                  Math?.round(item?.Ad_Rev),
                                                ) +
                                                  replaceNaNWithZero(
                                                    props?.addValues[
                                                      item?.month?.slice(0, 3)
                                                    ]?.rev,
                                                  ),
                                              )
                                            : props?.pageID === "overall" &&
                                                (props?.query === "AI" ||
                                                  props?.query === "A") &&
                                                item?.month === "July"
                                              ? CommaSeparated(
                                                  replaceNaNWithZero(
                                                    Math?.round(item?.Ad_Rev),
                                                  ) +
                                                    replaceNaNWithZero(
                                                      props?.addValues[
                                                        item?.month?.slice(0, 3)
                                                      ]?.rev,
                                                    ),
                                                )
                                              : props?.pageID === "overall" &&
                                                  (props?.query === "AI" ||
                                                    props?.query === "A") &&
                                                  item?.month === "August"
                                                ? CommaSeparated(
                                                    replaceNaNWithZero(
                                                      Math?.round(item?.Ad_Rev),
                                                    ) +
                                                      replaceNaNWithZero(
                                                        props?.addValues[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.rev,
                                                      ),
                                                  )
                                                : props?.pageID === "overall" &&
                                                    (props?.query === "AI" ||
                                                      props?.query === "A") &&
                                                    item?.month === "September"
                                                  ? CommaSeparated(
                                                      replaceNaNWithZero(
                                                        Math?.round(
                                                          item?.Ad_Rev,
                                                        ),
                                                      ) +
                                                        replaceNaNWithZero(
                                                          props?.addValues[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.rev,
                                                        ),
                                                    )
                                                  : props?.pageID ===
                                                        "dashboard" &&
                                                      (props?.query === "AI" ||
                                                        props?.query === "A" ||
                                                        props?.query ===
                                                          "US A") &&
                                                      props?.game1 === "MTN" &&
                                                      item?.month === "June"
                                                    ? CommaSeparated(
                                                        replaceNaNWithZero(
                                                          Math?.round(
                                                            item?.Ad_Rev,
                                                          ),
                                                        ) +
                                                          (item.year === "23" &&
                                                            props?.value4),
                                                      )
                                                    : props?.pageID ===
                                                          "dashboard" &&
                                                        (props?.query ===
                                                          "AI" ||
                                                          props?.query ===
                                                            "A" ||
                                                          props?.query ===
                                                            "US A") &&
                                                        props?.game1 ===
                                                          "MTN" &&
                                                        item?.month === "July"
                                                      ? CommaSeparated(
                                                          replaceNaNWithZero(
                                                            Math?.round(
                                                              item?.Ad_Rev,
                                                            ),
                                                          ) +
                                                            (item.year ===
                                                              "23" &&
                                                              props?.value5),
                                                        )
                                                      : props?.pageID ===
                                                            "dashboard" &&
                                                          (props?.query ===
                                                            "AI" ||
                                                            props?.query ===
                                                              "A" ||
                                                            props?.query ===
                                                              "US A") &&
                                                          props?.game1 ===
                                                            "MTN" &&
                                                          item?.month ===
                                                            "August"
                                                        ? CommaSeparated(
                                                            replaceNaNWithZero(
                                                              Math?.round(
                                                                item?.Ad_Rev,
                                                              ),
                                                            ) +
                                                              (item.year ===
                                                                "23" &&
                                                                props?.value6),
                                                          )
                                                        : props?.pageID ===
                                                              "dashboard" &&
                                                            (props?.query ===
                                                              "AI" ||
                                                              props?.query ===
                                                                "A" ||
                                                              props?.query ===
                                                                "US A") &&
                                                            props?.game1 ===
                                                              "MTN" &&
                                                            item?.month ===
                                                              "September"
                                                          ? CommaSeparated(
                                                              replaceNaNWithZero(
                                                                Math?.round(
                                                                  item?.Ad_Rev,
                                                                ),
                                                              ) +
                                                                (item.year ===
                                                                  "23" &&
                                                                  props?.value7),
                                                            )
                                                          : CommaSeparated(
                                                              replaceNaNWithZero(
                                                                Math?.round(
                                                                  item?.Ad_Rev,
                                                                ),
                                                              ),
                                                            )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableGreen}
                          sx={{ color: "#ff9900 !important" }}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.IAP)),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableGreen}
                          sx={{ color: "#ff9900 !important" }}
                        >
                          {props?.pageID === "overall" &&
                          (props?.query === "AI" || props?.query === "A") &&
                          item?.month === "October"
                            ? CommaSeparated(
                                replaceNaNWithZero(Math?.round(item?.AdRev)) +
                                  (item.year === "23" && props?.value1) +
                                  replaceNaNWithZero(
                                    props?.addValues[item?.month?.slice(0, 3)]
                                      ?.rev,
                                  ),
                              )
                            : props?.pageID === "overall" &&
                                (props?.query === "AI" ||
                                  props?.query === "A") &&
                                item?.month === "November"
                              ? CommaSeparated(
                                  replaceNaNWithZero(Math?.round(item?.AdRev)) +
                                    (item.year === "23" && props?.value2) +
                                    replaceNaNWithZero(
                                      props?.addValues[item?.month?.slice(0, 3)]
                                        ?.rev,
                                    ),
                                )
                              : props?.pageID === "overall" &&
                                  (props?.query === "AI" ||
                                    props?.query === "A") &&
                                  item?.month === "December"
                                ? CommaSeparated(
                                    replaceNaNWithZero(
                                      Math?.round(item?.AdRev),
                                    ) +
                                      (item.year === "23" && props?.value3) +
                                      replaceNaNWithZero(
                                        props?.addValues[
                                          item?.month?.slice(0, 3)
                                        ]?.rev,
                                      ),
                                  )
                                : props?.pageID === "overall" &&
                                    (props?.query === "AI" ||
                                      props?.query === "A") &&
                                    item?.month === "January"
                                  ? CommaSeparated(
                                      replaceNaNWithZero(
                                        Math?.round(item?.AdRev),
                                      ) +
                                        replaceNaNWithZero(
                                          props?.addValues[
                                            item?.month?.slice(0, 3)
                                          ]?.rev,
                                        ),
                                    )
                                  : props?.pageID === "overall" &&
                                      (props?.query === "AI" ||
                                        props?.query === "A") &&
                                      item?.month === "February"
                                    ? CommaSeparated(
                                        replaceNaNWithZero(
                                          Math?.round(item?.AdRev),
                                        ) +
                                          replaceNaNWithZero(
                                            props?.addValues[
                                              item?.month?.slice(0, 3)
                                            ]?.rev,
                                          ),
                                      )
                                    : props?.pageID === "overall" &&
                                        (props?.query === "AI" ||
                                          props?.query === "A") &&
                                        item?.month === "March"
                                      ? CommaSeparated(
                                          replaceNaNWithZero(
                                            Math?.round(item?.AdRev),
                                          ) +
                                            replaceNaNWithZero(
                                              props?.addValues[
                                                item?.month?.slice(0, 3)
                                              ]?.rev,
                                            ),
                                        )
                                      : props?.pageID === "overall" &&
                                          (props?.query === "AI" ||
                                            props?.query === "A") &&
                                          item?.month === "April"
                                        ? CommaSeparated(
                                            replaceNaNWithZero(
                                              Math?.round(item?.AdRev),
                                            ) +
                                              replaceNaNWithZero(
                                                props?.addValues[
                                                  item?.month?.slice(0, 3)
                                                ]?.rev,
                                              ),
                                          )
                                        : props?.pageID === "overall" &&
                                            (props?.query === "AI" ||
                                              props?.query === "A") &&
                                            item?.month === "May"
                                          ? CommaSeparated(
                                              replaceNaNWithZero(
                                                Math?.round(item?.AdRev),
                                              ) +
                                                replaceNaNWithZero(
                                                  props?.addValues[
                                                    item?.month?.slice(0, 3)
                                                  ]?.rev,
                                                ),
                                            )
                                          : props?.pageID === "overall" &&
                                              (props?.query === "AI" ||
                                                props?.query === "A") &&
                                              item?.month === "June"
                                            ? CommaSeparated(
                                                replaceNaNWithZero(
                                                  Math?.round(item?.AdRev),
                                                ) +
                                                  replaceNaNWithZero(
                                                    props?.addValues[
                                                      item?.month?.slice(0, 3)
                                                    ]?.rev,
                                                  ),
                                              )
                                            : props?.pageID === "overall" &&
                                                (props?.query === "AI" ||
                                                  props?.query === "A") &&
                                                item?.month === "July"
                                              ? CommaSeparated(
                                                  replaceNaNWithZero(
                                                    Math?.round(item?.AdRev),
                                                  ) +
                                                    replaceNaNWithZero(
                                                      props?.addValues[
                                                        item?.month?.slice(0, 3)
                                                      ]?.rev,
                                                    ),
                                                )
                                              : props?.pageID === "overall" &&
                                                  (props?.query === "AI" ||
                                                    props?.query === "A") &&
                                                  item?.month === "August"
                                                ? CommaSeparated(
                                                    replaceNaNWithZero(
                                                      Math?.round(item?.AdRev),
                                                    ) +
                                                      replaceNaNWithZero(
                                                        props?.addValues[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.rev,
                                                      ),
                                                  )
                                                : props?.pageID === "overall" &&
                                                    (props?.query === "AI" ||
                                                      props?.query === "A") &&
                                                    item?.month === "September"
                                                  ? CommaSeparated(
                                                      replaceNaNWithZero(
                                                        Math?.round(
                                                          item?.AdRev,
                                                        ),
                                                      ) +
                                                        replaceNaNWithZero(
                                                          props?.addValues[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.rev,
                                                        ),
                                                    )
                                                  : props?.pageID ===
                                                        "dashboard" &&
                                                      (props?.query === "AI" ||
                                                        props?.query === "A" ||
                                                        props?.query ===
                                                          "US A") &&
                                                      props?.game1 === "MTN" &&
                                                      item?.month === "June"
                                                    ? CommaSeparated(
                                                        replaceNaNWithZero(
                                                          Math?.round(
                                                            item?.AdRev,
                                                          ),
                                                        ) +
                                                          (item.year === "23" &&
                                                            props?.value4),
                                                      )
                                                    : props?.pageID ===
                                                          "dashboard" &&
                                                        (props?.query ===
                                                          "AI" ||
                                                          props?.query ===
                                                            "A" ||
                                                          props?.query ===
                                                            "US A") &&
                                                        props?.game1 ===
                                                          "MTN" &&
                                                        item?.month === "July"
                                                      ? CommaSeparated(
                                                          replaceNaNWithZero(
                                                            Math?.round(
                                                              item?.AdRev,
                                                            ),
                                                          ) +
                                                            (item.year ===
                                                              "23" &&
                                                              props?.value5),
                                                        )
                                                      : props?.pageID ===
                                                            "dashboard" &&
                                                          (props?.query ===
                                                            "AI" ||
                                                            props?.query ===
                                                              "A" ||
                                                            props?.query ===
                                                              "US A") &&
                                                          props?.game1 ===
                                                            "MTN" &&
                                                          item?.month ===
                                                            "August"
                                                        ? CommaSeparated(
                                                            replaceNaNWithZero(
                                                              Math?.round(
                                                                item?.AdRev,
                                                              ),
                                                            ) +
                                                              (item.year ===
                                                                "23" &&
                                                                props?.value6),
                                                          )
                                                        : props?.pageID ===
                                                              "dashboard" &&
                                                            (props?.query ===
                                                              "AI" ||
                                                              props?.query ===
                                                                "A" ||
                                                              props?.query ===
                                                                "US A") &&
                                                            props?.game1 ===
                                                              "MTN" &&
                                                            item?.month ===
                                                              "September"
                                                          ? CommaSeparated(
                                                              replaceNaNWithZero(
                                                                Math?.round(
                                                                  item?.AdRev,
                                                                ),
                                                              ) +
                                                                (item.year ===
                                                                  "23" &&
                                                                  props?.value7),
                                                            )
                                                          : CommaSeparated(
                                                              replaceNaNWithZero(
                                                                Math?.round(
                                                                  item?.AdRev,
                                                                ),
                                                              ),
                                                            )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableGreen}
                          sx={{ color: "#ff9900 !important" }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.AdDau, 3))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableGreen1}
                          sx={{ color: "#ff9900 !important" }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.Arpdau, 3))}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {replaceNaNWithZero(item?.IS_?.toFixed(1))}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {replaceNaNWithZero(item?.RV?.toFixed(1))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(Math?.round(item?.BR))}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.Facebook_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.Facebook_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.Facebook_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.fb_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.fb_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.facebook_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.facebook_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.googleadwords_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.googleadwords_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.googleadwords_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.google_r0, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.google_r7, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.googleadwords_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.googleadwords__ret7, 0),
                          )}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.ironsource_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.ironsource_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.ironsource_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.IS_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.IS_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.ironsource_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.ironsource_ret7, 0),
                          )}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.applovin_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.applovin_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.applovin_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.AL_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.AL_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.applovin_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.applovin_ret7, 0),
                          )}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.unityads_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.unityads_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px sold white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.unityads_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.UA_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.UA_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.unityads_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.unityads_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.tapjoy_cost)),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.tapjoy_users)),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.tapjoy_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.TJ_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.TJ_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.tapjoy_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.tapjoy_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.xiaomiglobal_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.xiaomiglobal_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.xiaomiglobal_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.X_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.X_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.xiaomi_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.xiaomi_ret7, 0),
                          )}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.swagbucks_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.swagbucks_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.swagbucks_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.SB_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.SB_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.swagbucks_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.swagbucks_ret7, 0),
                          )}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.mintegral_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.mintegral_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.mintegral_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.Mint_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.Mint_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.Mintint_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.Mintint_ret7, 0),
                          )}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.aura_cost)),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.aura_users)),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.aura_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.aura_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.aura_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.aura_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.aura_ret7, 0),
                          )}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.litoff_cost)),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.litoff_users)),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.litoff_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.LO_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.LO_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.LiftOff_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.LiftOff_ret7, 0),
                          )}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.sponsorpay_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.sponsorpay_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.sponsorpay_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.SP_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.SP_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.sponserpayretention_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.sponserpayretention_ret7, 0),
                          )}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(Math?.round(item?.IS_Imp))}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(Math?.round(item?.IS_Rev))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.IS_cpm, 1))}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(Math?.round(item?.BR_Imp))}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(Math?.round(item?.BR_Rev))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.BR_cpm, 2))}
                        </TableCell>

                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(Math?.round(item?.RV_Imp))}
                        </TableCell>
                        <TableCell className={classes?.tableCellM1}>
                          {CommaSeparated(Math?.round(item?.RV_Rev))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{ color: "#ff9900" }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.RV_cpm, 1))}
                        </TableCell>
                      </TableRow>
                    ),
                )}
            </TableBody>
          ) : (
            <TableBody
              className={classes?.spacedBody}
              displayRowCheckbox={false}
            >
              {topTable &&
                topTable?.map(
                  (item, rowIndex) =>
                    [
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ]?.includes(item?.month) &&
                    (item?.year === yearNames.currentYear ||
                      item?.year === yearNames.lastYear) && (
                      <TableRow key={rowIndex} className={classes?.tableRow}>
                        <TableCell
                          sx={{ position: "sticky", left: 0 }}
                          className={classes?.tableCellM}
                        ></TableCell>
                        <TableCellDate
                          sx={{
                            color: "white",
                            position: "sticky",
                            left: props?.questions[10]?.geo
                              ? 33
                              : props?.questions[10]?.game &&
                                  props?.query?.startsWith("GW")
                                ? 58
                                : 18,
                          }}
                          className={classes?.tableCellM}
                        >
                          {item?.month && item?.month}
                        </TableCellDate>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {props?.pageID === "overall" &&
                          (props?.query === "AI" || props?.query === "A") &&
                          item?.month === "October"
                            ? CommaSeparated(
                                replaceNaNWithZero(
                                  Math?.round(item?.total_spend) +
                                    (props?.spendAdjustment[
                                      item?.month?.slice(0, 3)
                                    ] !== undefined &&
                                      props?.spendAdjustment[
                                        item?.month?.slice(0, 3)
                                      ] !== null &&
                                      props?.spendAdjustment[
                                        item?.month?.slice(0, 3)
                                      ]?.actualcost -
                                        props?.spendAdjustment[
                                          item?.month?.slice(0, 3)
                                        ]?.appsflyercost),
                                ),
                              )
                            : props?.pageID === "overall" &&
                                (props?.query === "AI" ||
                                  props?.query === "A") &&
                                item?.month === "November"
                              ? CommaSeparated(
                                  replaceNaNWithZero(
                                    Math?.round(item?.total_spend) +
                                      (props?.spendAdjustment[
                                        item?.month?.slice(0, 3)
                                      ] !== undefined &&
                                        props?.spendAdjustment[
                                          item?.month?.slice(0, 3)
                                        ] !== null &&
                                        props?.spendAdjustment[
                                          item?.month?.slice(0, 3)
                                        ]?.actualcost -
                                          props?.spendAdjustment[
                                            item?.month?.slice(0, 3)
                                          ]?.appsflyercost),
                                  ),
                                )
                              : props?.pageID === "overall" &&
                                  (props?.query === "AI" ||
                                    props?.query === "A") &&
                                  item?.month === "December"
                                ? CommaSeparated(
                                    replaceNaNWithZero(
                                      Math?.round(item?.total_spend) +
                                        (props?.spendAdjustment[
                                          item?.month?.slice(0, 3)
                                        ] !== undefined &&
                                          props?.spendAdjustment[
                                            item?.month?.slice(0, 3)
                                          ] !== null &&
                                          props?.spendAdjustment[
                                            item?.month?.slice(0, 3)
                                          ]?.actualcost -
                                            props?.spendAdjustment[
                                              item?.month?.slice(0, 3)
                                            ]?.appsflyercost),
                                    ),
                                  )
                                : props?.pageID === "overall" &&
                                    (props?.query === "AI" ||
                                      props?.query === "A") &&
                                    item?.month === "January"
                                  ? CommaSeparated(
                                      replaceNaNWithZero(
                                        Math?.round(item?.total_spend) +
                                          (props?.spendAdjustment[
                                            item?.month?.slice(0, 3)
                                          ] !== undefined &&
                                            props?.spendAdjustment[
                                              item?.month?.slice(0, 3)
                                            ] !== null &&
                                            props?.spendAdjustment[
                                              item?.month?.slice(0, 3)
                                            ]?.actualcost -
                                              props?.spendAdjustment[
                                                item?.month?.slice(0, 3)
                                              ]?.appsflyercost),
                                      ),
                                    )
                                  : props?.pageID === "overall" &&
                                      (props?.query === "AI" ||
                                        props?.query === "A") &&
                                      item?.month === "February"
                                    ? CommaSeparated(
                                        replaceNaNWithZero(
                                          Math?.round(item?.total_spend) +
                                            (props?.spendAdjustment[
                                              item?.month?.slice(0, 3)
                                            ] !== undefined &&
                                              props?.spendAdjustment[
                                                item?.month?.slice(0, 3)
                                              ] !== null &&
                                              props?.spendAdjustment[
                                                item?.month?.slice(0, 3)
                                              ]?.actualcost -
                                                props?.spendAdjustment[
                                                  item?.month?.slice(0, 3)
                                                ]?.appsflyercost),
                                        ),
                                      )
                                    : props?.pageID === "overall" &&
                                        (props?.query === "AI" ||
                                          props?.query === "A") &&
                                        item?.month === "March"
                                      ? CommaSeparated(
                                          replaceNaNWithZero(
                                            Math?.round(item?.total_spend) +
                                              (props?.spendAdjustment[
                                                item?.month?.slice(0, 3)
                                              ] !== undefined &&
                                                props?.spendAdjustment[
                                                  item?.month?.slice(0, 3)
                                                ] !== null &&
                                                props?.spendAdjustment[
                                                  item?.month?.slice(0, 3)
                                                ]?.actualcost -
                                                  props?.spendAdjustment[
                                                    item?.month?.slice(0, 3)
                                                  ]?.appsflyercost),
                                          ),
                                        )
                                      : props?.pageID === "overall" &&
                                          (props?.query === "AI" ||
                                            props?.query === "A") &&
                                          item?.month === "April"
                                        ? CommaSeparated(
                                            replaceNaNWithZero(
                                              Math?.round(item?.total_spend) +
                                                (props?.spendAdjustment[
                                                  item?.month?.slice(0, 3)
                                                ] !== undefined &&
                                                  props?.spendAdjustment[
                                                    item?.month?.slice(0, 3)
                                                  ] !== null &&
                                                  props?.spendAdjustment[
                                                    item?.month?.slice(0, 3)
                                                  ]?.actualcost -
                                                    props?.spendAdjustment[
                                                      item?.month?.slice(0, 3)
                                                    ]?.appsflyercost),
                                            ),
                                          )
                                        : props?.pageID === "overall" &&
                                            (props?.query === "AI" ||
                                              props?.query === "A") &&
                                            item?.month === "May"
                                          ? CommaSeparated(
                                              replaceNaNWithZero(
                                                Math?.round(item?.total_spend) +
                                                  (props?.spendAdjustment[
                                                    item?.month?.slice(0, 3)
                                                  ] !== undefined &&
                                                    props?.spendAdjustment[
                                                      item?.month?.slice(0, 3)
                                                    ] !== null &&
                                                    props?.spendAdjustment[
                                                      item?.month?.slice(0, 3)
                                                    ]?.actualcost -
                                                      props?.spendAdjustment[
                                                        item?.month?.slice(0, 3)
                                                      ]?.appsflyercost),
                                              ),
                                            )
                                          : props?.pageID === "overall" &&
                                              (props?.query === "AI" ||
                                                props?.query === "A") &&
                                              item?.month === "June"
                                            ? CommaSeparated(
                                                replaceNaNWithZero(
                                                  Math?.round(
                                                    item?.total_spend,
                                                  ) +
                                                    (props?.spendAdjustment[
                                                      item?.month?.slice(0, 3)
                                                    ] !== undefined &&
                                                      props?.spendAdjustment[
                                                        item?.month?.slice(0, 3)
                                                      ] !== null &&
                                                      props?.spendAdjustment[
                                                        item?.month?.slice(0, 3)
                                                      ]?.actualcost -
                                                        props?.spendAdjustment[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.appsflyercost),
                                                ),
                                              )
                                            : props?.pageID === "overall" &&
                                                (props?.query === "AI" ||
                                                  props?.query === "A") &&
                                                item?.month === "July"
                                              ? CommaSeparated(
                                                  replaceNaNWithZero(
                                                    Math?.round(
                                                      item?.total_spend,
                                                    ) +
                                                      (props?.spendAdjustment[
                                                        item?.month?.slice(0, 3)
                                                      ] !== undefined &&
                                                        props?.spendAdjustment[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ] !== null &&
                                                        props?.spendAdjustment[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.actualcost -
                                                          props
                                                            ?.spendAdjustment[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.appsflyercost),
                                                  ),
                                                )
                                              : props?.pageID === "overall" &&
                                                  (props?.query === "AI" ||
                                                    props?.query === "A") &&
                                                  item?.month === "August"
                                                ? CommaSeparated(
                                                    replaceNaNWithZero(
                                                      Math?.round(
                                                        item?.total_spend,
                                                      ) +
                                                        (props?.spendAdjustment[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ] !== undefined &&
                                                          props
                                                            ?.spendAdjustment[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ] !== null &&
                                                          props
                                                            ?.spendAdjustment[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.actualcost -
                                                            props
                                                              ?.spendAdjustment[
                                                              item?.month?.slice(
                                                                0,
                                                                3,
                                                              )
                                                            ]?.appsflyercost),
                                                    ),
                                                  )
                                                : props?.pageID === "overall" &&
                                                    (props?.query === "AI" ||
                                                      props?.query === "A") &&
                                                    item?.month === "September"
                                                  ? CommaSeparated(
                                                      replaceNaNWithZero(
                                                        Math?.round(
                                                          item?.total_spend,
                                                        ) +
                                                          (props
                                                            ?.spendAdjustment[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ] !== undefined &&
                                                            props
                                                              ?.spendAdjustment[
                                                              item?.month?.slice(
                                                                0,
                                                                3,
                                                              )
                                                            ] !== null &&
                                                            props
                                                              ?.spendAdjustment[
                                                              item?.month?.slice(
                                                                0,
                                                                3,
                                                              )
                                                            ]?.actualcost -
                                                              props
                                                                ?.spendAdjustment[
                                                                item?.month?.slice(
                                                                  0,
                                                                  3,
                                                                )
                                                              ]?.appsflyercost),
                                                      ),
                                                    )
                                                  : CommaSeparated(
                                                      replaceNaNWithZero(
                                                        Math?.round(
                                                          item?.total_spend,
                                                        ),
                                                      ),
                                                    )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.ecpi, 2))}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(item?.total_users),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(replaceNaNWithZero(item?.paid_users))}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(replaceNaNWithZero(item?.DAU))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCellM1}
                          sx={{
                            color: "#ff9900",
                            borderRight: "5px solid white !important",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.org_per, 0))}
                        </TableCell>

                        <TableCell
                          sx={{
                            color: "#ff9900",
                            borderLeft: "5px solid white !important",
                          }}
                          className={classes?.tableCellM1}
                        >
                          {Math?.round(
                            ret_per(item?.Retention_Day_1, item?.total_users),
                            2,
                          )?.toFixed(0)}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900 !important" }}
                          className={classes?.tableCellM1}
                        >
                          {Math?.round(
                            ret_per(item?.Retention_Day_7, item?.total_users),
                            2,
                          )?.toFixed(0)}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {Math?.round(
                            ret_per(item?.Retention_Day_14, item?.total_users),
                            2,
                          )?.toFixed(0)}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#ff9900 !important",
                            borderRight: "1px solid #c3c3c3",
                          }}
                          className={classes?.tableCell1}
                        >
                          {Math?.round(
                            ret_per(item?.Retention_Day_30, item?.total_users),
                            2,
                          )?.toFixed(0)}
                        </TableCell>

                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            color: "#ff9900 !important",
                            backgroundColor: "#FFFFFF !important",
                            borderRight: "1px solid #c3c3c3 !important",
                          }}
                        >
                          {props?.pageID === "overall" &&
                          (props?.query === "AI" || props?.query === "A") &&
                          item?.month === "October"
                            ? CommaSeparated(
                                replaceNaNWithZero(Math?.round(item?.Profit)) +
                                  (item.year === "23" && props?.value1) +
                                  replaceNaNWithZero(
                                    props?.addValues[item?.month?.slice(0, 3)]
                                      ?.rev,
                                  ) +
                                  replaceNaNWithZero(
                                    props?.addValues[item?.month?.slice(0, 3)]
                                      ?.cost,
                                  ),
                              )
                            : props?.pageID === "overall" &&
                                (props?.query === "AI" ||
                                  props?.query === "A") &&
                                item?.month === "November"
                              ? CommaSeparated(
                                  replaceNaNWithZero(
                                    Math?.round(item?.Profit),
                                  ) +
                                    (item.year === "23" && props?.value2) +
                                    replaceNaNWithZero(
                                      props?.addValues[item?.month?.slice(0, 3)]
                                        ?.rev,
                                    ) +
                                    replaceNaNWithZero(
                                      props?.addValues[item?.month?.slice(0, 3)]
                                        ?.cost,
                                    ),
                                )
                              : props?.pageID === "overall" &&
                                  (props?.query === "AI" ||
                                    props?.query === "A") &&
                                  item?.month === "December"
                                ? CommaSeparated(
                                    replaceNaNWithZero(
                                      Math?.round(item?.Profit),
                                    ) +
                                      (item.year === "23" && props?.value3) +
                                      replaceNaNWithZero(
                                        props?.addValues[
                                          item?.month?.slice(0, 3)
                                        ]?.rev,
                                      ) +
                                      replaceNaNWithZero(
                                        props?.addValues[
                                          item?.month?.slice(0, 3)
                                        ]?.cost,
                                      ),
                                  )
                                : props?.pageID === "overall" &&
                                    (props?.query === "AI" ||
                                      props?.query === "A") &&
                                    item?.month === "January"
                                  ? CommaSeparated(
                                      replaceNaNWithZero(
                                        Math?.round(item?.Profit),
                                      ) +
                                        replaceNaNWithZero(
                                          props?.addValues[
                                            item?.month?.slice(0, 3)
                                          ]?.rev,
                                        ) +
                                        replaceNaNWithZero(
                                          props?.addValues[
                                            item?.month?.slice(0, 3)
                                          ]?.cost,
                                        ),
                                    )
                                  : props?.pageID === "overall" &&
                                      (props?.query === "AI" ||
                                        props?.query === "A") &&
                                      item?.month === "February"
                                    ? CommaSeparated(
                                        replaceNaNWithZero(
                                          Math?.round(item?.Profit),
                                        ) +
                                          replaceNaNWithZero(
                                            props?.addValues[
                                              item?.month?.slice(0, 3)
                                            ]?.rev,
                                          ) +
                                          replaceNaNWithZero(
                                            props?.addValues[
                                              item?.month?.slice(0, 3)
                                            ]?.cost,
                                          ),
                                      )
                                    : props?.pageID === "overall" &&
                                        (props?.query === "AI" ||
                                          props?.query === "A") &&
                                        item?.month === "March"
                                      ? CommaSeparated(
                                          replaceNaNWithZero(
                                            Math?.round(item?.Profit),
                                          ) +
                                            replaceNaNWithZero(
                                              props?.addValues[
                                                item?.month?.slice(0, 3)
                                              ]?.rev,
                                            ) +
                                            replaceNaNWithZero(
                                              props?.addValues[
                                                item?.month?.slice(0, 3)
                                              ]?.cost,
                                            ),
                                        )
                                      : props?.pageID === "overall" &&
                                          (props?.query === "AI" ||
                                            props?.query === "A") &&
                                          item?.month === "April"
                                        ? CommaSeparated(
                                            replaceNaNWithZero(
                                              Math?.round(item?.Profit),
                                            ) +
                                              replaceNaNWithZero(
                                                props?.addValues[
                                                  item?.month?.slice(0, 3)
                                                ]?.rev,
                                              ) +
                                              replaceNaNWithZero(
                                                props?.addValues[
                                                  item?.month?.slice(0, 3)
                                                ]?.cost,
                                              ),
                                          )
                                        : props?.pageID === "overall" &&
                                            (props?.query === "AI" ||
                                              props?.query === "A") &&
                                            item?.month === "May"
                                          ? CommaSeparated(
                                              replaceNaNWithZero(
                                                Math?.round(item?.Profit),
                                              ) +
                                                replaceNaNWithZero(
                                                  props?.addValues[
                                                    item?.month?.slice(0, 3)
                                                  ]?.rev,
                                                ) +
                                                replaceNaNWithZero(
                                                  props?.addValues[
                                                    item?.month?.slice(0, 3)
                                                  ]?.cost,
                                                ),
                                            )
                                          : props?.pageID === "overall" &&
                                              (props?.query === "AI" ||
                                                props?.query === "A") &&
                                              item?.month === "June"
                                            ? CommaSeparated(
                                                replaceNaNWithZero(
                                                  Math?.round(item?.Profit),
                                                ) +
                                                  replaceNaNWithZero(
                                                    props?.addValues[
                                                      item?.month?.slice(0, 3)
                                                    ]?.rev,
                                                  ),
                                              )
                                            : props?.pageID === "overall" &&
                                                (props?.query === "AI" ||
                                                  props?.query === "A") &&
                                                item?.month === "July"
                                              ? CommaSeparated(
                                                  replaceNaNWithZero(
                                                    Math?.round(item?.Profit),
                                                  ) +
                                                    replaceNaNWithZero(
                                                      props?.addValues[
                                                        item?.month?.slice(0, 3)
                                                      ]?.rev,
                                                    ) +
                                                    replaceNaNWithZero(
                                                      props?.addValues[
                                                        item?.month?.slice(0, 3)
                                                      ]?.cost,
                                                    ),
                                                )
                                              : props?.pageID === "overall" &&
                                                  (props?.query === "AI" ||
                                                    props?.query === "A") &&
                                                  item?.month === "August"
                                                ? CommaSeparated(
                                                    replaceNaNWithZero(
                                                      Math?.round(item?.Profit),
                                                    ) +
                                                      replaceNaNWithZero(
                                                        props?.addValues[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.rev,
                                                      ) +
                                                      replaceNaNWithZero(
                                                        props?.addValues[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.cost,
                                                      ),
                                                  )
                                                : props?.pageID === "overall" &&
                                                    (props?.query === "AI" ||
                                                      props?.query === "A") &&
                                                    item?.month === "September"
                                                  ? CommaSeparated(
                                                      replaceNaNWithZero(
                                                        Math?.round(
                                                          item?.Profit,
                                                        ),
                                                      ) +
                                                        replaceNaNWithZero(
                                                          props?.addValues[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.rev,
                                                        ) +
                                                        replaceNaNWithZero(
                                                          props?.addValues[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.cost,
                                                        ),
                                                    )
                                                  : props?.pageID ===
                                                        "dashboard" &&
                                                      (props?.query === "AI" ||
                                                        props?.query === "A" ||
                                                        props?.query ===
                                                          "US A") &&
                                                      props?.game1 === "MTN" &&
                                                      item?.month === "June"
                                                    ? CommaSeparated(
                                                        replaceNaNWithZero(
                                                          Math?.round(
                                                            item?.Profit,
                                                          ),
                                                        ) +
                                                          (item.year === "23" &&
                                                            props?.value4),
                                                      )
                                                    : props?.pageID ===
                                                          "dashboard" &&
                                                        (props?.query ===
                                                          "AI" ||
                                                          props?.query ===
                                                            "A" ||
                                                          props?.query ===
                                                            "US A") &&
                                                        props?.game1 ===
                                                          "MTN" &&
                                                        item?.month === "July"
                                                      ? CommaSeparated(
                                                          replaceNaNWithZero(
                                                            Math?.round(
                                                              item?.Profit,
                                                            ),
                                                          ) +
                                                            (item.year ===
                                                              "23" &&
                                                              props?.value5),
                                                        )
                                                      : props?.pageID ===
                                                            "dashboard" &&
                                                          (props?.query ===
                                                            "AI" ||
                                                            props?.query ===
                                                              "A" ||
                                                            props?.query ===
                                                              "US A") &&
                                                          props?.game1 ===
                                                            "MTN" &&
                                                          item?.month ===
                                                            "August"
                                                        ? CommaSeparated(
                                                            replaceNaNWithZero(
                                                              Math?.round(
                                                                item?.Profit,
                                                              ),
                                                            ) +
                                                              (item.year ===
                                                                "23" &&
                                                                props?.value6),
                                                          )
                                                        : props?.pageID ===
                                                              "dashboard" &&
                                                            (props?.query ===
                                                              "AI" ||
                                                              props?.query ===
                                                                "A" ||
                                                              props?.query ===
                                                                "US A") &&
                                                            props?.game1 ===
                                                              "MTN" &&
                                                            item?.month ===
                                                              "September"
                                                          ? CommaSeparated(
                                                              replaceNaNWithZero(
                                                                Math?.round(
                                                                  item?.Profit,
                                                                ),
                                                              ) +
                                                                (item.year ===
                                                                  "23" &&
                                                                  props?.value7),
                                                            )
                                                          : CommaSeparated(
                                                              replaceNaNWithZero(
                                                                Math?.round(
                                                                  item?.Profit,
                                                                ),
                                                              ),
                                                            )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableGreen}
                          sx={{ color: "#ff9900 !important" }}
                        >
                          {props?.pageID === "overall" &&
                          (props?.query === "AI" || props?.query === "A") &&
                          item?.month === "October"
                            ? CommaSeparated(
                                replaceNaNWithZero(Math?.round(item?.Ad_Rev)) +
                                  (item?.year === "23" && props?.value1) +
                                  replaceNaNWithZero(
                                    props?.addValues[item?.month?.slice(0, 3)]
                                      ?.rev,
                                  ),
                              )
                            : props?.pageID === "overall" &&
                                (props?.query === "AI" ||
                                  props?.query === "A") &&
                                item?.month === "November"
                              ? CommaSeparated(
                                  replaceNaNWithZero(
                                    Math?.round(item?.Ad_Rev),
                                  ) +
                                    (item.year === "23" && props?.value2) +
                                    replaceNaNWithZero(
                                      props?.addValues[item?.month?.slice(0, 3)]
                                        ?.rev,
                                    ),
                                )
                              : props?.pageID === "overall" &&
                                  (props?.query === "AI" ||
                                    props?.query === "A") &&
                                  item?.month === "December"
                                ? CommaSeparated(
                                    replaceNaNWithZero(
                                      Math?.round(item?.Ad_Rev),
                                    ) +
                                      (item.year === "23" && props?.value3) +
                                      replaceNaNWithZero(
                                        props?.addValues[
                                          item?.month?.slice(0, 3)
                                        ]?.rev,
                                      ),
                                  )
                                : props?.pageID === "overall" &&
                                    (props?.query === "AI" ||
                                      props?.query === "A") &&
                                    item?.month === "January"
                                  ? CommaSeparated(
                                      replaceNaNWithZero(
                                        Math?.round(item?.Ad_Rev),
                                      ) +
                                        replaceNaNWithZero(
                                          props?.addValues[
                                            item?.month?.slice(0, 3)
                                          ]?.rev,
                                        ),
                                    )
                                  : props?.pageID === "overall" &&
                                      (props?.query === "AI" ||
                                        props?.query === "A") &&
                                      item?.month === "February"
                                    ? CommaSeparated(
                                        replaceNaNWithZero(
                                          Math?.round(item?.Ad_Rev),
                                        ) +
                                          replaceNaNWithZero(
                                            props?.addValues[
                                              item?.month?.slice(0, 3)
                                            ]?.rev,
                                          ),
                                      )
                                    : props?.pageID === "overall" &&
                                        (props?.query === "AI" ||
                                          props?.query === "A") &&
                                        item?.month === "March"
                                      ? CommaSeparated(
                                          replaceNaNWithZero(
                                            Math?.round(item?.Ad_Rev),
                                          ) +
                                            replaceNaNWithZero(
                                              props?.addValues[
                                                item?.month?.slice(0, 3)
                                              ]?.rev,
                                            ),
                                        )
                                      : props?.pageID === "overall" &&
                                          (props?.query === "AI" ||
                                            props?.query === "A") &&
                                          item?.month === "April"
                                        ? CommaSeparated(
                                            replaceNaNWithZero(
                                              Math?.round(item?.Ad_Rev),
                                            ) +
                                              replaceNaNWithZero(
                                                props?.addValues[
                                                  item?.month?.slice(0, 3)
                                                ]?.rev,
                                              ),
                                          )
                                        : props?.pageID === "overall" &&
                                            (props?.query === "AI" ||
                                              props?.query === "A") &&
                                            item?.month === "May"
                                          ? CommaSeparated(
                                              replaceNaNWithZero(
                                                Math?.round(item?.Ad_Rev),
                                              ) +
                                                replaceNaNWithZero(
                                                  props?.addValues[
                                                    item?.month?.slice(0, 3)
                                                  ]?.rev,
                                                ),
                                            )
                                          : props?.pageID === "overall" &&
                                              (props?.query === "AI" ||
                                                props?.query === "A") &&
                                              item?.month === "June"
                                            ? CommaSeparated(
                                                replaceNaNWithZero(
                                                  Math?.round(item?.Ad_Rev),
                                                ) +
                                                  replaceNaNWithZero(
                                                    props?.addValues[
                                                      item?.month?.slice(0, 3)
                                                    ]?.rev,
                                                  ),
                                              )
                                            : props?.pageID === "overall" &&
                                                (props?.query === "AI" ||
                                                  props?.query === "A") &&
                                                item?.month === "July"
                                              ? CommaSeparated(
                                                  replaceNaNWithZero(
                                                    Math?.round(item?.Ad_Rev),
                                                  ) +
                                                    replaceNaNWithZero(
                                                      props?.addValues[
                                                        item?.month?.slice(0, 3)
                                                      ]?.rev,
                                                    ),
                                                )
                                              : props?.pageID === "overall" &&
                                                  (props?.query === "AI" ||
                                                    props?.query === "A") &&
                                                  item?.month === "August"
                                                ? CommaSeparated(
                                                    replaceNaNWithZero(
                                                      Math?.round(item?.Ad_Rev),
                                                    ) +
                                                      replaceNaNWithZero(
                                                        props?.addValues[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.rev,
                                                      ),
                                                  )
                                                : props?.pageID === "overall" &&
                                                    (props?.query === "AI" ||
                                                      props?.query === "A") &&
                                                    item?.month === "September"
                                                  ? CommaSeparated(
                                                      replaceNaNWithZero(
                                                        Math?.round(
                                                          item?.Ad_Rev,
                                                        ),
                                                      ) +
                                                        replaceNaNWithZero(
                                                          props?.addValues[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.rev,
                                                        ),
                                                    )
                                                  : props?.pageID ===
                                                        "dashboard" &&
                                                      (props?.query === "AI" ||
                                                        props?.query === "A" ||
                                                        props?.query ===
                                                          "US A") &&
                                                      props?.game1 === "MTN" &&
                                                      item?.month === "June"
                                                    ? CommaSeparated(
                                                        replaceNaNWithZero(
                                                          Math?.round(
                                                            item?.Ad_Rev,
                                                          ),
                                                        ) +
                                                          (item.year === "23" &&
                                                            props?.value4),
                                                      )
                                                    : props?.pageID ===
                                                          "dashboard" &&
                                                        (props?.query ===
                                                          "AI" ||
                                                          props?.query ===
                                                            "A" ||
                                                          props?.query ===
                                                            "US A") &&
                                                        props?.game1 ===
                                                          "MTN" &&
                                                        item?.month === "July"
                                                      ? CommaSeparated(
                                                          replaceNaNWithZero(
                                                            Math?.round(
                                                              item?.Ad_Rev,
                                                            ),
                                                          ) +
                                                            (item.year ===
                                                              "23" &&
                                                              props?.value5),
                                                        )
                                                      : CommaSeparated(
                                                          replaceNaNWithZero(
                                                            Math?.round(
                                                              item?.Ad_Rev,
                                                            ),
                                                          ),
                                                        )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableGreen}
                          sx={{ color: "#ff9900 !important" }}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.IAP)),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableGreen}
                          sx={{ color: "#ff9900 !important" }}
                        >
                          {props?.pageID === "overall" &&
                          (props?.query === "AI" || props?.query === "A") &&
                          item?.month === "October"
                            ? CommaSeparated(
                                replaceNaNWithZero(Math?.round(item?.AdRev)) +
                                  (item.year === "23" && props?.value1) +
                                  replaceNaNWithZero(
                                    props?.addValues[item?.month?.slice(0, 3)]
                                      ?.rev,
                                  ),
                              )
                            : props?.pageID === "overall" &&
                                (props?.query === "AI" ||
                                  props?.query === "A") &&
                                item?.month === "November"
                              ? CommaSeparated(
                                  replaceNaNWithZero(Math?.round(item?.AdRev)) +
                                    (item.year === "23" && props?.value2) +
                                    replaceNaNWithZero(
                                      props?.addValues[item?.month?.slice(0, 3)]
                                        ?.rev,
                                    ),
                                )
                              : props?.pageID === "overall" &&
                                  (props?.query === "AI" ||
                                    props?.query === "A") &&
                                  item?.month === "December"
                                ? CommaSeparated(
                                    replaceNaNWithZero(
                                      Math?.round(item?.AdRev),
                                    ) +
                                      (item.year === "23" && props?.value3) +
                                      replaceNaNWithZero(
                                        props?.addValues[
                                          item?.month?.slice(0, 3)
                                        ]?.rev,
                                      ),
                                  )
                                : props?.pageID === "overall" &&
                                    (props?.query === "AI" ||
                                      props?.query === "A") &&
                                    item?.month === "January"
                                  ? CommaSeparated(
                                      replaceNaNWithZero(
                                        Math?.round(item?.AdRev),
                                      ) +
                                        replaceNaNWithZero(
                                          props?.addValues[
                                            item?.month?.slice(0, 3)
                                          ]?.rev,
                                        ),
                                    )
                                  : props?.pageID === "overall" &&
                                      (props?.query === "AI" ||
                                        props?.query === "A") &&
                                      item?.month === "February"
                                    ? CommaSeparated(
                                        replaceNaNWithZero(
                                          Math?.round(item?.AdRev),
                                        ) +
                                          replaceNaNWithZero(
                                            props?.addValues[
                                              item?.month?.slice(0, 3)
                                            ]?.rev,
                                          ),
                                      )
                                    : props?.pageID === "overall" &&
                                        (props?.query === "AI" ||
                                          props?.query === "A") &&
                                        item?.month === "March"
                                      ? CommaSeparated(
                                          replaceNaNWithZero(
                                            Math?.round(item?.AdRev),
                                          ) +
                                            replaceNaNWithZero(
                                              props?.addValues[
                                                item?.month?.slice(0, 3)
                                              ]?.rev,
                                            ),
                                        )
                                      : props?.pageID === "overall" &&
                                          (props?.query === "AI" ||
                                            props?.query === "A") &&
                                          item?.month === "April"
                                        ? CommaSeparated(
                                            replaceNaNWithZero(
                                              Math?.round(item?.AdRev),
                                            ) +
                                              replaceNaNWithZero(
                                                props?.addValues[
                                                  item?.month?.slice(0, 3)
                                                ]?.rev,
                                              ),
                                          )
                                        : props?.pageID === "overall" &&
                                            (props?.query === "AI" ||
                                              props?.query === "A") &&
                                            item?.month === "May"
                                          ? CommaSeparated(
                                              replaceNaNWithZero(
                                                Math?.round(item?.AdRev),
                                              ) +
                                                replaceNaNWithZero(
                                                  props?.addValues[
                                                    item?.month?.slice(0, 3)
                                                  ]?.rev,
                                                ),
                                            )
                                          : props?.pageID === "overall" &&
                                              (props?.query === "AI" ||
                                                props?.query === "A") &&
                                              item?.month === "June"
                                            ? CommaSeparated(
                                                replaceNaNWithZero(
                                                  Math?.round(item?.AdRev),
                                                ) +
                                                  replaceNaNWithZero(
                                                    props?.addValues[
                                                      item?.month?.slice(0, 3)
                                                    ]?.rev,
                                                  ),
                                              )
                                            : props?.pageID === "overall" &&
                                                (props?.query === "AI" ||
                                                  props?.query === "A") &&
                                                item?.month === "July"
                                              ? CommaSeparated(
                                                  replaceNaNWithZero(
                                                    Math?.round(item?.AdRev),
                                                  ) +
                                                    replaceNaNWithZero(
                                                      props?.addValues[
                                                        item?.month?.slice(0, 3)
                                                      ]?.rev,
                                                    ),
                                                )
                                              : props?.pageID === "overall" &&
                                                  (props?.query === "AI" ||
                                                    props?.query === "A") &&
                                                  item?.month === "August"
                                                ? CommaSeparated(
                                                    replaceNaNWithZero(
                                                      Math?.round(item?.AdRev),
                                                    ) +
                                                      replaceNaNWithZero(
                                                        props?.addValues[
                                                          item?.month?.slice(
                                                            0,
                                                            3,
                                                          )
                                                        ]?.rev,
                                                      ),
                                                  )
                                                : props?.pageID === "overall" &&
                                                    (props?.query === "AI" ||
                                                      props?.query === "A") &&
                                                    item?.month === "September"
                                                  ? CommaSeparated(
                                                      replaceNaNWithZero(
                                                        Math?.round(
                                                          item?.AdRev,
                                                        ),
                                                      ) +
                                                        replaceNaNWithZero(
                                                          props?.addValues[
                                                            item?.month?.slice(
                                                              0,
                                                              3,
                                                            )
                                                          ]?.rev,
                                                        ),
                                                    )
                                                  : props?.pageID ===
                                                        "dashboard" &&
                                                      (props?.query === "AI" ||
                                                        props?.query === "A" ||
                                                        props?.query ===
                                                          "US A") &&
                                                      props?.game1 === "MTN" &&
                                                      item?.month === "June"
                                                    ? CommaSeparated(
                                                        replaceNaNWithZero(
                                                          Math?.round(
                                                            item?.AdRev,
                                                          ),
                                                        ) +
                                                          (item.year === "23" &&
                                                            props?.value4),
                                                      )
                                                    : props?.pageID ===
                                                          "dashboard" &&
                                                        (props?.query ===
                                                          "AI" ||
                                                          props?.query ===
                                                            "A" ||
                                                          props?.query ===
                                                            "US A") &&
                                                        props?.game1 ===
                                                          "MTN" &&
                                                        item?.month === "July"
                                                      ? CommaSeparated(
                                                          replaceNaNWithZero(
                                                            Math?.round(
                                                              item?.AdRev,
                                                            ),
                                                          ) +
                                                            (item.year ===
                                                              "23" &&
                                                              props?.value5),
                                                        )
                                                      : CommaSeparated(
                                                          replaceNaNWithZero(
                                                            Math?.round(
                                                              item?.AdRev,
                                                            ),
                                                          ),
                                                        )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableGreen}
                          sx={{ color: "#ff9900 !important" }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.AdDau, 2))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableGreen1}
                          sx={{ color: "#ff9900 !important" }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.Arpdau, 2))}
                        </TableCell>

                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {replaceNaNWithZero(item?.IS_)?.toFixed(1)}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {replaceNaNWithZero(item?.RV)?.toFixed(1)}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900 !important",
                          }}
                        >
                          {replaceNaNWithZero(Math?.round(item?.BR))}
                        </TableCell>

                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.Facebook_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(item?.Facebook_users),
                          )}
                        </TableCell>

                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.Facebook_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.fb_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.fb_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.facebook_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.facebook_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.googleadwords_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.googleadwords_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900 !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.googleadwords_cpi, 2),
                          )}
                        </TableCell>

                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900 !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.google_r0, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.google_r7, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.googleadwords_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.googleadwords_ret7, 0),
                          )}
                        </TableCell>

                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.ironsource_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.ironsource_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900 !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(
                              item?.ironsource_cpi,

                              2,
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900 !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(
                              item?.IS_r0,

                              2,
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.IS_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.ironsource_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.ironsource_ret7, 0),
                          )}
                        </TableCell>

                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.applovin_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.applovin_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900 !important",
                          }}
                          className={classes?.tableCell1}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.applovin_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900 !important",
                          }}
                          className={classes?.tableCell1}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.AL_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.AL_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.applovin_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.applovin_ret7, 0),
                          )}
                        </TableCell>

                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.unityads_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.unityads_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900 !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.unityads_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900 !important",
                          }}
                          className={classes?.tableCell1}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.UA_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.UA_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.unityads_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.unityads_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.tapjoy_cost)),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.tapjoy_users)),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900  !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.tapjoy_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.TJ_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.TJ_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.tapjoy_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.tapjoy_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.xiaomiglobal_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.xiaomiglobal_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900  !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.xiaomiglobal_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.X_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.X_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.xiaomi_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.xiaomi_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.swagbucks_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.swagbucks_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900  !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(
                              item?.swagbucks_cpi,

                              2,
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.SB_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.SB_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.swagbucks_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.swagbucks_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.mintegral_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.mintegral_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900 !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.mintegral_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.Mint_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.Mint_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.Mintint_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.Mintint_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900  !important" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.aura_cost)),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.aura_users)),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900  !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.aura_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.aura_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.aura_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.aura_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.aura_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.litoff_cost)),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(Math?.round(item?.litoff_users)),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            color: "#ff9900  !important",
                            // borderRight: "5px solid white !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.litoff_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.LO_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.LO_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.LiftOff_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.LiftOff_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.sponsorpay_cost),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.sponsorpay_users),
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            color: "#ff9900  !important",
                            // borderRight: "5px solid white !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.sponsorpay_cpi, 2),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.SP_r0, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(roundToDecimal(item?.SP_r7, 0))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            // borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.sponserpayretention_ret1, 0),
                          )}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900",
                          }}
                        >
                          {replaceNaNWithZero(
                            roundToDecimal(item?.sponserpayretention_ret7, 0),
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(Math?.round(item?.IS_Imp))}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(Math?.round(item?.IS_Rev))}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#ff9900  !important",
                            borderRight: "5px solid white !important",
                          }}
                          className={classes?.tableCell1}
                        >
                          {replaceNaNWithZero(
                            Number(item?.IS_cpm) < 10.0
                              ? roundToDecimal(item?.IS_cpm, 1)
                              : roundToDecimal(item?.IS_cpm, 0),
                          )}
                        </TableCell>

                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(Math?.round(item?.BR_Imp))}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#ff9900",
                          }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(Math?.round(item?.BR_Rev))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{
                            borderRight: "5px solid white !important",
                            color: "#ff9900  !important",
                          }}
                        >
                          {replaceNaNWithZero(
                            item?.BR_cpm < 10
                              ? roundToDecimal(item?.BR_cpm, 2)
                              : roundToDecimal(item?.BR_cpm, 0),
                          )}
                        </TableCell>

                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(Math?.round(item?.RV_Imp))}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#ff9900" }}
                          className={classes?.tableCellM1}
                        >
                          {CommaSeparated(Math?.round(item?.RV_Rev))}
                        </TableCell>
                        <TableCell
                          className={classes?.tableCell1}
                          sx={{ color: "#ff9900 !important" }}
                        >
                          {replaceNaNWithZero(
                            item?.RV_cpm < 10
                              ? roundToDecimal(item?.RV_cpm, 1)
                              : roundToDecimal(item?.RV_cpm, 0),
                          )}
                        </TableCell>
                      </TableRow>
                    ),
                )}
            </TableBody>
          )}

          <TableBody className={classes?.spacedBody} displayRowCheckbox={false}>
            {props?.questions1?.length > 1 &&
              props?.questions1?.map(
                (item, rowIndex) =>
                  item?.month === "Last 30 days" && (
                    <TableRow key={rowIndex} className={classes?.tableRow}>
                      <TableCell
                        sx={{ position: "sticky", left: 0 }}
                        className={classes?.tableCellM}
                      >
                        {props?.questions1?.comment}
                      </TableCell>

                      <TableCell
                        sx={{
                          color: "white",
                          position: "sticky",
                          left: props?.questions[10]?.geo
                            ? 33
                            : props?.questions[10]?.game &&
                                props?.query?.startsWith("GW")
                              ? 58
                              : 18,
                        }}
                        className={classes?.tableCellM}
                      >
                        30 Days
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {props?.questions1 &&
                          CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.total_spend, 0),
                            ),
                          )}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {replaceNaNWithZero(roundToDecimal(item?.ecpi, 2))}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.total_users, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.paid_users, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.DAU, 0)),
                        )}
                      </TableCell>

                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{ borderRight: "5px solid white !important" }}
                      >
                        {item?.org_per?.toFixed(0)}
                      </TableCell>

                      <TableCell
                        sx={{ borderLeft: "5px solid white !important" }}
                        className={classes?.tableCellM1}
                      >
                        {ret_per(
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce(
                              (acc, item) => acc + item?.Retention_Day_1,
                              0,
                            ),
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce((acc, item) => acc + item?.total_users, 0),
                          2,
                        )?.toFixed(0)}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {ret_per(
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce(
                              (acc, item) => acc + item?.Retention_Day_7,
                              0,
                            ),
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce((acc, item) => acc + item?.total_users, 0),
                          2,
                        )?.toFixed(0)}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {ret_per(
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce(
                              (acc, item) => acc + item?.Retention_Day_14,
                              0,
                            ),
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce((acc, item) => acc + item?.total_users, 0),
                          2,
                        )?.toFixed(0)}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {ret_per(
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce(
                              (acc, item) => acc + item?.Retention_Day_30,
                              0,
                            ),
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce((acc, item) => acc + item?.total_users, 0),
                          2,
                        )?.toFixed(0)}
                      </TableCell>

                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{
                          color: "#ff9900",
                          backgroundColor: "#FFFFFF !important",
                        }}
                      >
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.Profit, 0)),
                        )}
                      </TableCell>

                      <TableCell
                        className={classes?.tableGreen}
                        sx={{ color: "#ff9900 !important" }}
                      >
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.Ad_Rev, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableGreen}
                        sx={{ color: "#ff9900 !important" }}
                      >
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.IAP, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableGreen}
                        sx={{ color: "#ff9900 !important" }}
                      >
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.AdRev, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableGreen}
                        sx={{ color: "#ff9900 !important" }}
                      >
                        {replaceNaNWithZero(item?.AdDau)?.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={classes?.tableGreen}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900 !important",
                        }}
                      >
                        {item?.Arpdau?.toFixed(2)}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {replaceNaNWithZero(item?.IS_)?.toFixed(1)}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {replaceNaNWithZero(item?.RV)?.toFixed(1)}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(item?.BR)?.toFixed(0)}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.Facebook_cost)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.Facebook_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.Facebook_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.fb_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.fb_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.facebook_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.facebook_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.googleadwords_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.googleadwords_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(
                            item?.googleadwords_cpi,

                            2,
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(
                            item?.google_r0,

                            0,
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.google_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.googleadwords_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.googleadwords_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.ironsource_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.ironsource_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.ironsource_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.IS_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.IS_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.ironsource_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.ironsource_ret7, 0),
                        )}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.applovin_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.applovin_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.applovin_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.AL_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.AL_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.applovin_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.applovin_ret7, 0),
                        )}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.unityads_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.unityads_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.unityads_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900 !important",
                        }}
                        className={classes?.tableCellM1}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.UA_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.UA_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.unityads_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.unityads_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.tapjoy_cost, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.tapjoy_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.tapjoy_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.TJ_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.TJ_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.tapjoy_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.tapjoy_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.xiaomiglobal_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.xiaomiglobal_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          Math?.round(item?.xiaomiglobal_cpi, 0),
                        ) < 10
                          ? roundToDecimal(item?.xiaomiglobal_cpi, 2)
                          : roundToDecimal(item?.xiaomiglobal_cpi, 0)}
                        {/* {replaceNaNWithZero(
                      roundToDecimal(
                    (
                          Math?.round(
                            props?.questions1?.reduce(
                              (acc, item) => acc + item?.xiamiglobal_users,
                              0
                            )
                          ),
                          Math?.round(
                            props?.questions1?.reduce(
                              (acc, item) => acc + item?.xiamiglobal_cost,
                              0
                            )
                          )
                        ),
                        2
                      )
                    )} */}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.X_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.X_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.xiaomi_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.xiaomi_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.swagbucks_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.swagbucks_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.swagbucks_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.SB_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.SB_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.swagbucks_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.swagbucks_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.mintegral_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.mintegral_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.mintegral_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.Mint_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.Mint_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.Mintint_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.Mintint_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.aura_cost, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.aura_users, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(
                            item?.aura_cpi,

                            2,
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.aura_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.aura_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.aura_ret1, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.aura_ret7, 0))}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.litoff_cost, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.litoff_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(
                            item?.litoff_cpi,

                            2,
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.LO_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.LO_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.LiftOff_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.LiftOff_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.sponsorpay_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.sponsorpay_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.sponsorpay_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.SP_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.SP_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.sponserpayretention_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.sponserpayretention_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.IS_Imp, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.IS_Rev, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{ borderRight: "5px solid white !important" }}
                      >
                        {item?.IS_cpm < 10
                          ? item?.IS_cpm?.toFixed(1)
                          : item?.IS_cpm?.toFixed(0)}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.BR_Imp, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.BR_Rev, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{ borderRight: "5px solid white !important" }}
                      >
                        {item?.BR_cpm < 10
                          ? item?.BR_cpm?.toFixed(2)
                          : item?.BR_cpm?.toFixed(0)}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.RV_Imp, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.RV_Rev, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {item?.RV_cpm < 10
                          ? item?.RV_cpm?.toFixed(1)
                          : item?.RV_cpm?.toFixed(0)}
                      </TableCell>
                    </TableRow>
                  ),
              )}
            {props?.questions1?.length > 1 &&
              props?.questions1?.map(
                (item, rowIndex) =>
                  item?.month === "overall" && (
                    <TableRow key={rowIndex} className={classes?.tableRow}>
                      <TableCell
                        sx={{ position: "sticky", left: 0 }}
                        className={classes?.tableCellM}
                      >
                        {props?.questions1?.comment}
                      </TableCell>

                      <TableCell
                        sx={{
                          color: "white",

                          position: "sticky",
                          left: props?.questions[10]?.geo
                            ? 33
                            : props?.questions[10]?.game &&
                                props?.query?.startsWith("GW")
                              ? 58
                              : 18,
                        }}
                        className={classes?.tableCellM}
                      >
                        Overall
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {props?.questions1 &&
                          CommaSeparated(
                            replaceNaNWithZero(
                              Math?.round(item?.total_spend, 0),
                            ),
                          )}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {replaceNaNWithZero(roundToDecimal(item?.ecpi, 2))}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.total_users, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.paid_users, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.DAU, 0)),
                        )}
                      </TableCell>

                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{ borderRight: "5px solid white !important" }}
                      >
                        {item?.org_per?.toFixed(0)}
                      </TableCell>

                      <TableCell
                        sx={{ borderLeft: "5px solid white !important" }}
                        className={classes?.tableCellM1}
                      >
                        {ret_per(
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce(
                              (acc, item) => acc + item?.Retention_Day_1,
                              0,
                            ),
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce((acc, item) => acc + item?.total_users, 0),
                          2,
                        )?.toFixed(0)}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {ret_per(
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce(
                              (acc, item) => acc + item?.Retention_Day_7,
                              0,
                            ),
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce((acc, item) => acc + item?.total_users, 0),
                          2,
                        )?.toFixed(0)}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {ret_per(
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce(
                              (acc, item) => acc + item?.Retention_Day_14,
                              0,
                            ),
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce((acc, item) => acc + item?.total_users, 0),
                          2,
                        )?.toFixed(0)}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {ret_per(
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce(
                              (acc, item) => acc + item?.Retention_Day_30,
                              0,
                            ),
                          props?.questions
                            ?.slice(0, 1000)
                            ?.reduce((acc, item) => acc + item?.total_users, 0),
                          2,
                        )?.toFixed(0)}
                      </TableCell>

                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{
                          color: "#ff9900",
                          backgroundColor: "#FFFFFF !important",
                        }}
                      >
                        {props?.pageID === "overall" &&
                        (props?.query === "AI" || props?.query === "A")
                          ? CommaSeparated(
                              replaceNaNWithZero(Math?.round(item?.Profit, 0)) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value1,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value2,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value3,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value4,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value5,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value6,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value7,
                                ),
                            )
                          : props?.pageID === "dashboard" &&
                              (props?.query === "AI" ||
                                props?.query === "A" ||
                                props?.query === "US A") &&
                              props?.game1 === "MTN"
                            ? CommaSeparated(
                                replaceNaNWithZero(
                                  Math?.round(item?.Profit, 0),
                                ) +
                                  (item.year === "23" && props?.value4) +
                                  (item.year === "23" && props?.value5) +
                                  (item.year === "23" && props?.value6) +
                                  (item.year === "23" && props?.value7),
                              )
                            : CommaSeparated(
                                replaceNaNWithZero(
                                  Math?.round(item?.Profit, 0),
                                ),
                              )}
                      </TableCell>

                      <TableCell
                        className={classes?.tableGreen}
                        sx={{ color: "#ff9900 !important" }}
                      >
                        {props?.pageID === "overall" &&
                        (props?.query === "AI" || props?.query === "A")
                          ? CommaSeparated(
                              replaceNaNWithZero(Math?.round(item?.Ad_Rev, 0)) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value1,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value2,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value3,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value4,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value5,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value6,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value7,
                                ),
                            )
                          : props?.pageID === "dashboard" &&
                              (props?.query === "AI" ||
                                props?.query === "A" ||
                                props?.query === "US A") &&
                              props?.game1 === "MTN"
                            ? CommaSeparated(
                                replaceNaNWithZero(
                                  Math?.round(item?.Ad_Rev, 0),
                                ) +
                                  (item.year === "23" && props?.value4) +
                                  (item.year === "23" && props?.value5) +
                                  (item.year === "23" && props?.value6) +
                                  (item.year === "23" && props?.value7),
                              )
                            : CommaSeparated(
                                replaceNaNWithZero(
                                  Math?.round(item?.Ad_Rev, 0),
                                ),
                              )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableGreen}
                        sx={{ color: "#ff9900  !important" }}
                      >
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.IAP, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableGreen}
                        sx={{ color: "#ff9900  !important" }}
                      >
                        {props?.pageID === "overall" &&
                        (props?.query === "AI" || props?.query === "A")
                          ? CommaSeparated(
                              replaceNaNWithZero(Math?.round(item?.AdRev, 0)) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value1,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value2,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value3,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value4,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value5,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value6,
                                ) +
                                replaceNaNWithZero(
                                  item.year === "23" && props?.value7,
                                ),
                            )
                          : props?.pageID === "dashboard" &&
                              (props?.query === "AI" ||
                                props?.query === "A" ||
                                props?.query === "US A") &&
                              props?.game1 === "MTN"
                            ? CommaSeparated(
                                replaceNaNWithZero(
                                  Math?.round(item?.AdRev, 0),
                                ) +
                                  (item.year === "23" && props?.value4) +
                                  (item.year === "23" && props?.value5) +
                                  (item.year === "23" && props?.value6) +
                                  props?.value,
                              )
                            : CommaSeparated(
                                replaceNaNWithZero(Math?.round(item?.AdRev, 0)),
                              )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableGreen}
                        sx={{ color: "#ff9900  !important" }}
                      >
                        {replaceNaNWithZero(item?.AdDau)?.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={classes?.tableGreen}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900  !important",
                        }}
                      >
                        {item?.Arpdau?.toFixed(2)}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {replaceNaNWithZero(item?.IS_)?.toFixed(1)}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {replaceNaNWithZero(item?.RV)?.toFixed(1)}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(item?.BR)?.toFixed(0)}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.Facebook_cost)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.Facebook_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.Facebook_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.fb_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.fb_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.facebook_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.facebook_ret7, 0),
                        )}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.googleadwords_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.googleadwords_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.googleadwords_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.google_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.google_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.googleadwords_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.googleadwords_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.ironsource_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.ironsource_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.ironsource_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.IS_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.IS_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.ironsource_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.ironsource_ret7, 0),
                        )}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.applovin_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.applovin_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.applovin_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.AL_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.AL_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.applovin_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.applovin_ret7, 0),
                        )}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.unityads_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.unityads_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(
                            item?.unityads_cpi,

                            2,
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900 !important",
                        }}
                        className={classes?.tableCell1}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.UA_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.UA_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.unityads_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.unityads_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.tapjoy_cost, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.tapjoy_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.tapjoy_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.TJ_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.TJ_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.tapjoy_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.tapjoy_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.xiaomiglobal_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.xiaomiglobal_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          Math?.round(item?.xiaomiglobal_cpi, 0),
                        ) < 10
                          ? roundToDecimal(item?.xiaomiglobal_cpi, 2)
                          : roundToDecimal(
                              item?.xiaomiglobal_cpi,

                              0,
                            )}
                        {/* {replaceNaNWithZero(
                      roundToDecimal(
                        cpi_calculate(
                          Math?.round(
                            props?.questions1?.reduce(
                              (acc, item) => acc + item?.xiamiglobal_users,
                              0
                            )
                          ),
                          Math?.round(
                            props?.questions1?.reduce(
                              (acc, item) => acc + item?.xiamiglobal_cost,
                              0
                            )
                          )
                        ),
                        2
                      )
                    )} */}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.X_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.X_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.xiaomi_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.xiaomi_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.swagbucks_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.swagbucks_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(
                            item?.swagbucks_cpi,

                            2,
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.SB_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.SB_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.swagbucks_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.swagbucks_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.mintegral_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.mintegral_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(
                            item?.mintegral_cpi,

                            2,
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.Mint_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.Mint_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.Mintint_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.Mintint_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.aura_cost, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.aura_users, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(
                            item?.aura_cpi,

                            2,
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.aura_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.aura_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.aura_ret1, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.aura_ret7, 0))}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.litoff_cost, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.litoff_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(
                            item?.litoff_cpi,

                            2,
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.LO_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.LO_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.LiftOff_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.LiftOff_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.sponsorpay_cost, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(
                            Math?.round(item?.sponsorpay_users, 0),
                          ),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.sponsorpay_cpi, 2),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.SP_r0, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(roundToDecimal(item?.SP_r7, 0))}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          // borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.sponserpayretention_ret1, 0),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCell1}
                        sx={{
                          borderRight: "5px solid white !important",
                          color: "#ff9900",
                        }}
                      >
                        {replaceNaNWithZero(
                          roundToDecimal(item?.sponserpayretention_ret7, 0),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.IS_Imp, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.IS_Rev, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{ borderRight: "5px solid white !important" }}
                      >
                        {item?.IS_cpm < 10
                          ? item?.IS_cpm?.toFixed(1)
                          : item?.IS_cpm?.toFixed(0)}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.BR_Imp, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.BR_Rev, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        sx={{ borderRight: "5px solid white !important" }}
                      >
                        {item?.BR_cpm < 10
                          ? item?.BR_cpm?.toFixed(2)
                          : item?.BR_cpm?.toFixed(0)}
                      </TableCell>

                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.RV_Imp, 0)),
                        )}
                      </TableCell>
                      <TableCell className={classes?.tableCellM1}>
                        {CommaSeparated(
                          replaceNaNWithZero(Math?.round(item?.RV_Rev, 0)),
                        )}
                      </TableCell>
                      <TableCell
                        className={classes?.tableCellM1}
                        // sx={{ borderRight: "5px solid white !important" }}
                      >
                        {item?.RV_cpm < 10
                          ? item?.RV_cpm?.toFixed(1)
                          : item?.RV_cpm?.toFixed(0)}
                      </TableCell>
                    </TableRow>
                  ),
              )}
          </TableBody>
          {!props?.showFull ? (
            <TableBody
              className={classes?.spacedBody}
              displayRowCheckbox={false}
            >
              {props?.questions &&
                props?.questions?.slice(0, 90)?.map((item, rowIndex) => (
                  <TableRow key={rowIndex} className={classes?.tableRow}>
                    <TableCell
                      sx={{ position: "sticky", left: 0 }}
                      onClick={() => {
                        item?.geo &&
                          item?.platform &&
                          handleOptionClick(
                            `${item?.geo} ${
                              item?.platform === "and"
                                ? "A"
                                : item?.platform === "ios"
                                  ? "I"
                                  : ""
                            }`,
                          );
                      }}
                      className={
                        item?.geo !== "" &&
                        item?.geo &&
                        item?.platform !== "" &&
                        item?.platform
                          ? classes?.tableCellGeo
                          : classes?.tableCell
                      }
                    >
                      {item?.game && item?.geo && item?.Install_time
                        ? item?.geo
                        : !item?.game && item?.geo && item?.Install_time
                          ? item?.geo
                          : item?.game && !item?.geo && !props?.game1
                            ? item?.game
                            : null}
                    </TableCell>
                    <TableCellDate
                      sx={{
                        position: "sticky",
                        left: props?.questions[10]?.geo
                          ? 33
                          : props?.questions[10]?.game &&
                              props?.query?.startsWith("GW")
                            ? 58
                            : 18,
                      }}
                      className={classes?.tableCell}
                    >
                      {item?.Install_time
                        ? `${moment(item.Install_time).format("ddd")[0]} ${item.Install_time}`
                        : // item?.Install_time
                          // ? `${moment(item.Install_time)
                          //     .format("ddd")
                          //     .slice(
                          //       0,
                          //       [0, 2, 4, 6].includes(
                          //         moment(item.Install_time).day(),
                          //       )
                          //         ? 2
                          //         : 1,
                          //     )} ${item.Install_time}`
                          item?.geo}
                    </TableCellDate>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        replaceNaNWithZero(Math?.round(item?.total_spend)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          ecpi(item?.total_spend, item?.total_users),
                          2,
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(replaceNaNWithZero(item?.total_users))}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(replaceNaNWithZero(item?.paid_users))}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(replaceNaNWithZero(item?.DAU))}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.org_per, 0))}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          ret_per(item?.Retention_Day_1, item?.total_users),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          ret_per(item?.Retention_Day_7, item?.total_users),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          ret_per(item?.Retention_Day_14, item?.total_users),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCellL}
                      sx={{ borderRight: "1px solid #c3c3c3" }}
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(
                          ret_per(item?.Retention_Day_30, item?.total_users),
                          0,
                        ),
                      )}
                    </TableCell>

                    <TableCell
                      className={classes?.tableCell1}
                      sx={{
                        backgroundColor: "#FFFFFF !important",
                        borderRight: "1px solid #c3c3c3",
                      }}
                    >
                      {CommaSeparated(
                        replaceNaNWithZero(Math?.round(item?.Profit)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableGreen}>
                      {CommaSeparated(
                        replaceNaNWithZero(Math?.round(item?.Ad_Rev)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableGreen}>
                      {CommaSeparated(
                        replaceNaNWithZero(Math?.round(item?.IAP)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableGreen}>
                      {CommaSeparated(
                        replaceNaNWithZero(Math?.round(item?.AdRev)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableGreen}>
                      {replaceNaNWithZero(roundToDecimal(item?.AdDau, 2))}
                    </TableCell>
                    <TableCell className={classes?.tableGreen1}>
                      {replaceNaNWithZero(roundToDecimal(item?.Arpdau, 2))}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {replaceNaNWithZero(roundToDecimal(item?.IS_, 1))}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {replaceNaNWithZero(roundToDecimal(item?.RV, 1))}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.BR, 0))}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(replaceNaNWithZero(item?.Facebook_cost, 0)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(item?.Facebook_users, 0),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {item?.Facebook_users !== 0
                        ? replaceNaNWithZero(
                            roundToDecimal(item?.Facebook_cpi, 2),
                          )
                        : 0}
                    </TableCell>

                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.fb_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.fb_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.facebook_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.facebook_ret7, 0),
                      )}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.googleadwords_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.googleadwords_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          item?.googleadwords_cpi,

                          2,
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          item?.google_r0,

                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.google_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.googleadwords_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.googleadwords_ret7, 0),
                      )}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.ironsource_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.ironsource_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.ironsource_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.IS_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.IS_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.ironsource_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.ironsource_ret7, 0),
                      )}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.applovin_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.applovin_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.applovin_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.AL_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.AL_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.applovin_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.applovin_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.unityads_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.unityads_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.unityads_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900 !important",
                        }
                      }
                      className={classes?.tableCell1}
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.UA_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.UA_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.unityads_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.unityads_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.tapjoy_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.tapjoy_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.tapjoy_cpi, 2))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.TJ_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.TJ_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.tapjoy_ret1, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.tapjoy_ret7, 0))}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.xiaomiglobal_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.xiaomiglobal_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.xiaomiglobal_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.X_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.X_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.xiaomi_ret1, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.xiaomi_ret7, 0))}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.swagbucks_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.swagbucks_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.swagbucks_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.SB_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.SB_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.swagbucks_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.swagbucks_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.mintegral_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.mintegral_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.mintegral_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.Mint_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.Mint_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.Mintint_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.Mintint_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.aura_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.aura_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.aura_cpi, 2))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.aura_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.aura_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.aura_ret1, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.aura_ret7, 0))}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.litoff_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.litoff_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.litoff_cpi, 2))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.LO_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.LO_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.LiftOff_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.LiftOff_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.sponsorpay_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.sponsorpay_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.sponsorpay_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.SP_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.SP_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.sponserpayretention_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.sponserpayretention_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(item?.IS_Imp)}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(Math?.round(item?.IS_Rev, 0))}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        item?.IS_cpm < 10
                          ? roundToDecimal(item?.IS_cpm, 1)
                          : roundToDecimal(item?.IS_cpm, 0),
                      )}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(item?.BR_Imp)}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(Math?.round(item?.BR_Rev, 0))}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        item?.BR_cpm < 10
                          ? roundToDecimal(item?.BR_cpm, 2)
                          : roundToDecimal(item?.BR_cpm, 0),
                      )}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(item?.RV_Imp)}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(Math?.round(item?.RV_Rev, 0))}
                    </TableCell>

                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        item?.RV_cpm < 10
                          ? roundToDecimal(item?.RV_cpm, 1)
                          : roundToDecimal(item?.RV_cpm, 0),
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          ) : (
            <TableBody
              className={classes?.spacedBody}
              displayRowCheckbox={false}
            >
              {props?.questions &&
                props?.questions?.slice(0, 90)?.map((item, rowIndex) => (
                  <TableRow key={rowIndex} className={classes?.tableRow}>
                    <TableCell
                      sx={{ position: "sticky", left: 0 }}
                      onClick={() => {
                        item?.geo &&
                          item?.platform &&
                          handleOptionClick(
                            `${item?.geo} ${
                              item?.platform === "and"
                                ? "A"
                                : item?.platform === "ios"
                                  ? "I"
                                  : ""
                            }`,
                          );
                      }}
                      className={
                        item?.geo !== "" &&
                        item?.geo &&
                        item?.platform !== "" &&
                        item?.platform
                          ? classes?.tableCellGeo
                          : classes?.tableCell
                      }
                    >
                      {item?.game && item?.geo && item?.Install_time
                        ? item?.geo
                        : !item?.game && item?.geo && item?.Install_time
                          ? item?.geo
                          : item?.game && !item?.geo && !props?.game1
                            ? item?.game
                            : null}
                    </TableCell>
                    <TableCellDate
                      sx={{
                        position: "sticky",
                        left: props?.questions[10]?.geo
                          ? 33
                          : props?.questions[10]?.game &&
                              props?.query?.startsWith("GW")
                            ? 58
                            : 18,
                      }}
                      className={classes?.tableCell}
                    >
                      {item?.Install_time
                        ? `${moment(item.Install_time).format("ddd")[0]} ${item.Install_time}`
                        : // item?.Install_time
                          // ? `${moment(item.Install_time)
                          //     .format("ddd")
                          //     .slice(
                          //       0,
                          //       [0, 2, 4, 6].includes(
                          //         moment(item.Install_time).day(),
                          //       )
                          //         ? 2
                          //         : 1,
                          //     )} ${item.Install_time}`
                          item?.geo}
                    </TableCellDate>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        replaceNaNWithZero(Math?.round(item?.total_spend)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          ecpi(item?.total_spend, item?.total_users),
                          2,
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(replaceNaNWithZero(item?.total_users))}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(replaceNaNWithZero(item?.paid_users))}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(replaceNaNWithZero(item?.DAU))}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.org_per, 0))}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          ret_per(item?.Retention_Day_1, item?.total_users),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          ret_per(item?.Retention_Day_7, item?.total_users),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          ret_per(item?.Retention_Day_14, item?.total_users),
                          0,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCellL}
                      sx={{ borderRight: "1px solid #c3c3c3" }}
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(
                          ret_per(item?.Retention_Day_30, item?.total_users),
                          0,
                        ),
                      )}
                    </TableCell>

                    <TableCell
                      className={classes?.tableCell1}
                      sx={{
                        backgroundColor: "#FFFFFF !important",
                        borderRight: "1px solid #c3c3c3",
                      }}
                    >
                      {CommaSeparated(
                        replaceNaNWithZero(Math?.round(item?.Profit)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableGreen}>
                      {CommaSeparated(
                        replaceNaNWithZero(Math?.round(item?.Ad_Rev)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableGreen}>
                      {CommaSeparated(
                        replaceNaNWithZero(Math?.round(item?.IAP)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableGreen}>
                      {CommaSeparated(
                        replaceNaNWithZero(Math?.round(item?.AdRev)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableGreen}>
                      {replaceNaNWithZero(roundToDecimal(item?.AdDau, 2))}
                    </TableCell>
                    <TableCell className={classes?.tableGreen1}>
                      {replaceNaNWithZero(roundToDecimal(item?.Arpdau, 2))}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {replaceNaNWithZero(roundToDecimal(item?.IS_, 1))}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {replaceNaNWithZero(roundToDecimal(item?.RV, 1))}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.BR, 0))}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(replaceNaNWithZero(item?.Facebook_cost, 0)),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(item?.Facebook_users, 0),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {item?.Facebook_users !== 0
                        ? replaceNaNWithZero(
                            roundToDecimal(item?.Facebook_cpi, 2),
                          )
                        : 0}
                    </TableCell>

                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.fb_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.fb_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.facebook_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.facebook_ret7, 0),
                      )}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.googleadwords_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.googleadwords_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          item?.googleadwords_cpi,

                          2,
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(
                          item?.google_r0,

                          2,
                        ),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.google_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.googleadwords_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.googleadwords_ret7, 0),
                      )}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.ironsource_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.ironsource_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.ironsource_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.IS_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.IS_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.ironsource_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.ironsource_ret7, 0),
                      )}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.applovin_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.applovin_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.applovin_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.AL_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.AL_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.applovin_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.applovin_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.unityads_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.unityads_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.unityads_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900 !important",
                        }
                      }
                      className={classes?.tableCell1}
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.UA_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.UA_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.unityads_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.unityads_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.tapjoy_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.tapjoy_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.tapjoy_cpi, 2))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.TJ_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.TJ_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.tapjoy_ret1, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.tapjoy_ret7, 0))}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.xiaomiglobal_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.xiaomiglobal_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.xiaomiglobal_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.X_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.X_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.xiaomi_ret1, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.xiaomi_ret7, 0))}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.swagbucks_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.swagbucks_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.swagbucks_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.SB_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.SB_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.swagbucks_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.swagbucks_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.mintegral_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.mintegral_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.mintegral_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.Mint_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.Mint_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.Mintint_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.Mintint_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.aura_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.aura_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.aura_cpi, 2))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.aura_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.aura_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.aura_ret1, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.aura_ret7, 0))}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.litoff_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.litoff_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(roundToDecimal(item?.litoff_cpi, 2))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.LO_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.LO_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.LiftOff_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.LiftOff_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.sponsorpay_cost, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCellL}>
                      {CommaSeparated(
                        Math?.round(
                          replaceNaNWithZero(
                            roundToDecimal(item?.sponsorpay_users, 0),
                          ),
                        ),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        roundToDecimal(item?.sponsorpay_cpi, 2),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.SP_r0, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(roundToDecimal(item?.SP_r7, 0))}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.sponserpayretention_ret1, 0),
                      )}
                    </TableCell>
                    <TableCell
                      className={classes?.tableCell1}
                      sx={
                        {
                          // borderRight: "5px solid white !important",
                          // color: "#ff9900",
                        }
                      }
                    >
                      {replaceNaNWithZero(
                        roundToDecimal(item?.sponserpayretention_ret7, 0),
                      )}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(item?.IS_Imp)}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(Math?.round(item?.IS_Rev, 0))}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        item?.IS_cpm < 10
                          ? roundToDecimal(item?.IS_cpm, 1)
                          : roundToDecimal(item?.IS_cpm, 0),
                      )}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(item?.BR_Imp)}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(Math?.round(item?.BR_Rev, 0))}
                    </TableCell>
                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        item?.BR_cpm < 10
                          ? roundToDecimal(item?.BR_cpm, 2)
                          : roundToDecimal(item?.BR_cpm, 0),
                      )}
                    </TableCell>

                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(item?.RV_Imp)}
                    </TableCell>
                    <TableCell className={classes?.tableCell}>
                      {CommaSeparated(Math?.round(item?.RV_Rev, 0))}
                    </TableCell>

                    <TableCell className={classes?.tableCell1}>
                      {replaceNaNWithZero(
                        item?.RV_cpm < 10
                          ? roundToDecimal(item?.RV_cpm, 1)
                          : roundToDecimal(item?.RV_cpm, 0),
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}

export default QuestionsTable;

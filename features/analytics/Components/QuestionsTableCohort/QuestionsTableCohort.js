import React, { useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import styled from "styled-components";

import { Button } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import classes from "./QuestionsTable.module.css";

import "react-toastify/dist/ReactToastify.css";
import Popover from "@mui/material/Popover";
import { toast, ToastContainer } from "react-toastify";
let limit = 0;
const Styles = styled.div`
padding: 0.5rem 1rem 3rem 1rem;
table {
  border-spacing: 0;
  border: '1px solid #cccccc';
  width: 100%;
 
  overflow-y: scroll;
  overflow-x: scroll;
}
tr {
  height: 1rem;
}
}`;

function QuestionsTable(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const [selected, setSelected] = React.useState("Roas_D7");

  const [drop, setDrop] = React.useState(false);

  const handleOptionClick = (a, b, c, d, e) => {
    props.onQueryChange(a, b, c, d, e);
  };
  function CommaSeparated(number) {
    if (typeof number === "number") {
      return number.toLocaleString();
    }
  }

  useEffect(() => {
    const display = props.questions.length > 0 && props?.questions[0] !== "empty";

    if ((props?.questions[0] === "empty") & (limit === 0)) {
      
      toast.error("Data was not found for this request!");
      limit = 1;
      props.setLoading(false);
      // handleOptionClick(
      //   props.start,
      //   props.end,
      //   props.campID,
      //   "campwisedate",
      //   ""
      // );
    }
    
    
    setTimeout(() => {
      display && props.setLoading(false);
    }, 1000);
  }, [props.questions]);

  const sortingQuestions = (a1, d) => {
    let tempArr = [];
    
    

    if (d) {
      tempArr = props.backupQ?.sort(function (a, b) {
        
        return (
          Number(b[a1.includes("Retention") ? a1 : a1.toLowerCase()]) -
          Number(a[a1.includes("Retention") ? a1 : a1.toLowerCase()])
        );
      });
    } else {
      tempArr = props.backupQ?.sort(function (a, b) {
        
        return (
          Number(a[a1.includes("Retention") ? a1 : a1.toLowerCase()]) -
          Number(b[a1.includes("Retention") ? a1 : a1.toLowerCase()])
        );
      });
    }

    props.setQuestions(tempArr);
    props.setQuestions((prevState) => prevState);
  };
  return (
    <div>
      <Styles id="slider">
        <ToastContainer />
        <Table>
          <TableHead
            sx={{ position: "sticky", top: 128, "z-index": 10 }}
            className={classes.Thead}
          >
            <TableRow>
              <TableCell
                style={{ whiteSpace: "nowrap" }}
                className={classes.group1}
              >
                {props.GW ? "Geo" : props.DW ? "Date" : ""}
              </TableCell>

              <TableCell
                sx={{
                  cursor: "auto",
                  whiteSpace: "nowrap",
                }}
                className={classes.group1}
                colSpan={1}
              >
                Campaign
              </TableCell>
              <TableCell
                sx={{ cursor: "auto" }}
                className={classes.group1}
                colSpan={1}
              >
                Network
              </TableCell>
              <TableCell
                sx={{ cursor: "auto" }}
                className={classes.group1}
                colSpan={1}
              >
                Game
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Cost") {
                    setSelected("Cost");
                    setDrop(true);
                    sortingQuestions("Cost", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Cost", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{
                  borderRight: "5px solid white",
                  borderLeft: "5px solid white",
                }}
              >
                Cost{" "}
                {selected === "Cost" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "50px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "50px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "ecpi") {
                    setSelected("ecpi");
                    setDrop(true);
                    sortingQuestions("ecpi", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("ecpi", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{
                  borderRight: "5px solid white !important",
                  borderLeft: "5px solid white",
                }}
              >
                Cpi{" "}
                {selected === "ecpi" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "50px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "50px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Users") {
                    setSelected("Users");
                    setDrop(true);
                    sortingQuestions("Users", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Users", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white !important" }}
              >
                Users{" "}
                {selected === "Users" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "50px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "50px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Roas_D0") {
                    setSelected("Roas_D0");
                    setDrop(true);
                    sortingQuestions("Roas_D0", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roas_D0", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roas D0{" "}
                {selected === "Roas_D0" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Roas_D1") {
                    setSelected("Roas_D1");
                    sortingQuestions("Roas_D1", true);
                    setDrop(true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roas_D1", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roas D1{" "}
                {selected === "Roas_D1" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roas_D3") {
                    setSelected("Roas_D3");
                    setDrop(true);
                    sortingQuestions("Roas_D3", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roas_D3", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roas D3{" "}
                {selected === "Roas_D3" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roas_D7") {
                    setSelected("Roas_D7");
                    setDrop(true);
                    sortingQuestions("Roas_D7", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roas_D7", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roas D7{" "}
                {selected === "Roas_D7" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roas_D14") {
                    setSelected("Roas_D14");
                    setDrop(true);
                    sortingQuestions("Roas_D14", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roas_D14", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roas D14{" "}
                {selected === "Roas_D14" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roas_D21") {
                    setSelected("Roas_D21");
                    setDrop(true);
                    sortingQuestions("Roas_D21", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roas_D21", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roas D21{" "}
                {selected === "Roas_D21" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roas_D30") {
                    setSelected("Roas_D30");
                    setDrop(true);
                    sortingQuestions("Roas_D30", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roas_D30", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roas D30{" "}
                {selected === "Roas_D30" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roas_D60") {
                    setSelected("Roas_D60");
                    setDrop(true);
                    sortingQuestions("Roas_D60", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roas_D60", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roas D60{" "}
                {selected === "Roas_D60" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Roas_D90") {
                    setSelected("Roas_D90");
                    setDrop(true);
                    sortingQuestions("Roas_D90", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roas_D90", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roas D90{" "}
                {selected === "Roas_D90" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Roas_D180") {
                    setSelected("Roas_D180");
                    setDrop(true);
                    sortingQuestions("Roas_D180", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roas_D180", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roas D180{" "}
                {selected === "Roas_D180" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Retention_Day_1") {
                    setSelected("Retention_Day_1");
                    sortingQuestions("Retention_Day_1", true);
                    setDrop(true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Retention_Day_1", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderLeft: "5px solid white !important" }}
              >
                Retention D1{" "}
                {selected === "Retention_Day_1" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Retention_Day_3") {
                    setSelected("Retention_Day_3");
                    setDrop(true);
                    sortingQuestions("Retention_Day_3", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Retention_Day_3", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Retention D3{" "}
                {selected === "Retention_Day_3" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Retention_Day_7") {
                    setSelected("Retention_Day_7");
                    setDrop(true);
                    sortingQuestions("Retention_Day_7", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Retention_Day_7", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Retention D7{" "}
                {selected === "Retention_Day_7" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Retention_Day_14") {
                    setSelected("Retention_Day_14");
                    setDrop(true);
                    sortingQuestions("Retention_Day_14", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Retention_Day_14", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Retention D14{" "}
                {selected === "Retention_Day_14" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Retention_Day_30") {
                    setSelected("Retention_Day_30");
                    setDrop(true);
                    sortingQuestions("Retention_Day_30", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Retention_Day_30", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Retention D30{" "}
                {selected === "Retention_Day_30" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Roi_D0") {
                    setSelected("Roi_D0");
                    setDrop(true);
                    sortingQuestions("Roi_D0", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roi_D0", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderLeft: "5px solid white !important" }}
              >
                Roi D0{" "}
                {selected === "Roi_D0" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Roi_D1") {
                    setSelected("Roi_D1");
                    sortingQuestions("Roi_D1", true);
                    setDrop(true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roi_D1", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roi D1{" "}
                {selected === "Roi_D1" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roi_D3") {
                    setSelected("Roi_D3");
                    setDrop(true);
                    sortingQuestions("Roi_D3", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roi_D3", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roi D3{" "}
                {selected === "Roi_D3" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roi_D7") {
                    setSelected("Roi_D7");
                    setDrop(true);
                    sortingQuestions("Roi_D7", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roi_D7", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roi D7{" "}
                {selected === "Roi_D7" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roi_D14") {
                    setSelected("Roi_D14");
                    setDrop(true);
                    sortingQuestions("Roi_D14", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roi_D14", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roi D14{" "}
                {selected === "Roi_D14" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roi_D21") {
                    setSelected("Roi_D21");
                    setDrop(true);
                    sortingQuestions("Roi_D21", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roi_D21", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roi D21{" "}
                {selected === "Roi_D21" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roi_D30") {
                    setSelected("Roi_D30");
                    setDrop(true);
                    sortingQuestions("Roi_D30", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roi_D30", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roi D30{" "}
                {selected === "Roi_D30" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Roi_D60") {
                    setSelected("Roi_D60");
                    setDrop(true);
                    sortingQuestions("Roi_D60", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roi_D60", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roi D60{" "}
                {selected === "Roi_D60" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Roi_D90") {
                    setSelected("Roi_D90");
                    setDrop(true);
                    sortingQuestions("Roi_D90", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roi_D90", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roi D90{" "}
                {selected === "Roi_D90" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Roi_D180") {
                    setSelected("Roi_D180");
                    setDrop(true);
                    sortingQuestions("Roi_D180", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Roi_D180", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Roi D180{" "}
                {selected === "Roi_D180" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Sessions_D0") {
                    setSelected("Sessions_D0");
                    setDrop(true);
                    sortingQuestions("Sessions_D0", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Sessions_D0", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderLeft: "5px solid white !important" }}
              >
                Sessions D0{" "}
                {selected === "Sessions_D0" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Sessions_D1") {
                    setSelected("Sessions_D1");
                    sortingQuestions("Sessions_D1", true);
                    setDrop(true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Sessions_D1", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Sessions D1{" "}
                {selected === "Sessions_D1" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Sessions_D3") {
                    setSelected("Sessions_D3");
                    setDrop(true);
                    sortingQuestions("Sessions_D3", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Sessions_D3", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Sessions D3{" "}
                {selected === "Sessions_D3" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Sessions_D7") {
                    setSelected("Sessions_D7");
                    setDrop(true);
                    sortingQuestions("Sessions_D7", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Sessions_D7", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Sessions D7{" "}
                {selected === "Sessions_D7" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Sessions_D14") {
                    setSelected("Sessions_D14");
                    setDrop(true);
                    sortingQuestions("Sessions_D14", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Sessions_D14", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Sessions D14{" "}
                {selected === "Sessions_D14" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Sessions_D21") {
                    setSelected("Sessions_D21");
                    setDrop(true);
                    sortingQuestions("Sessions_D21", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Sessions_D21", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Sessions D21{" "}
                {selected === "Sessions_D21" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Sessions_D30") {
                    setSelected("Sessions_D30");
                    setDrop(true);
                    sortingQuestions("Sessions_D30", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Sessions_D30", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Sessions D30{" "}
                {selected === "Sessions_D30" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>

              <TableCell
                onClick={() => {
                  if (selected !== "Sessions_D60") {
                    setSelected("Sessions_D60");
                    setDrop(true);
                    sortingQuestions("Sessions_D60", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Sessions_D60", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Sessions D60{" "}
                {selected === "Sessions_D60" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Sessions_D90") {
                    setSelected("Sessions_D90");
                    setDrop(true);
                    sortingQuestions("Sessions_D90", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Sessions_D90", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Sessions D90{" "}
                {selected === "Sessions_D90" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
              <TableCell
                onClick={() => {
                  if (selected !== "Sessions_D180") {
                    setSelected("Sessions_D180");
                    setDrop(true);
                    sortingQuestions("Sessions_D180", true);
                  } else {
                    setDrop(!drop);
                    sortingQuestions("Sessions_D180", !drop);
                  }
                }}
                className={classes.group2}
                colSpan={1}
                sx={{ borderRight: "5px solid white" }}
              >
                Sessions D180{" "}
                {selected === "Sessions_D180" &&
                  (drop === true ? (
                    <ArrowDropUpIcon sx={{ marginLeft: "10px" }} />
                  ) : (
                    <ArrowDropDownIcon sx={{ marginLeft: "10px" }} />
                  ))}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody className={classes.spacedBody} displayRowCheckbox={false}>
            {props?.questions &&
              props?.questions?.slice(0, 1000).map((item) => {
                return (
                  item?.camp &&
                  item?.camp !== "" && (
                    <TableRow className={classes.tableRow}>
                      <TableCell
                        sx={{ whiteSpace: "nowrap" }}
                        className={classes.tableCell}
                      >
                        {props.GW ? item.geo : props.DW ? item?.date : ""}
                      </TableCell>

                      <TableCell
                        onClick={(e) => {
                          handleClick(e);

                          props.setCampID(item.camp);
                          props.setNetID(item.nw);
                          props.setGID(item.game);
                        }}
                        sx={{
                          textAlign: "left !important",

                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                        className={classes.tableCell1}
                      >
                        {item?.camp?.slice(0, 23)}
                        <div
                          style={{ display: "flex", flexDirection: "row" }}
                        ></div>
                      </TableCell>
                      <TableCell
                        sx={{
                          paddingLeft: "5px",
                          textAlign: "left !important",
                        }}
                        className={classes.tableCell}
                      >
                        {item?.nw?.slice(0, -4)?.slice(0, 13)}
                      </TableCell>

                      <TableCell
                        sx={{ textAlign: "left !important" }}
                        className={classes.tableCell}
                      >
                        {item?.game}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderLeft: "5px solid white",
                        }}
                        className={classes.tableCellCost}
                      >
                        {CommaSeparated(Math.round(item?.cost))}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderLeft: "5px solid white",
                        }}
                        className={classes.tableCellCost}
                      >
                        {Number(item?.ecpi)?.toFixed(2)}
                      </TableCell>
                      <TableCell className={classes.tableCellCost}>
                        {CommaSeparated(item?.users)}
                      </TableCell>

                      <TableCell className={classes.tableGreen}>
                        {Number(item?.roas_d0).toFixed(0)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roas_d1).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roas_d3).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roas_d7).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roas_d14).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roas_d21).toFixed(2)}
                      </TableCell>

                      <TableCell
                        className={classes.tableCell}
                        // sx={{ borderLeft: "5px solid white" }}
                      >
                        {Number(item?.roas_d30).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roas_d60).toFixed(2)}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {Number(item?.roas_d90).toFixed(2)}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {Number(item?.roas_d180).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableGreen}>
                        {Number(item?.Retention_Day_1).toFixed(2)}
                      </TableCell>

                      <TableCell
                        className={classes.tableCell}
                        // sx={{ borderLeft: "5px solid white" }}
                      >
                        {Number(item?.Retention_Day_3).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.Retention_Day_7).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.Retention_Day_14).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.Retention_Day_30).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableGreen}>
                        {Number(item?.roi_d0).toFixed(0)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roi_d1).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roi_d3).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roi_d7).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roi_d14).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roi_d21).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roi_d30).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.roi_d60).toFixed(2)}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {Number(item?.roi_d90).toFixed(2)}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {Number(item?.roi_d180).toFixed(2)}
                      </TableCell>
                      <TableCell className={classes.tableGreen}>
                        {Number(item?.sessions_d0).toFixed(0)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.sessions_d1).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.sessions_d3).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.sessions_d7).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.sessions_d14).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.sessions_d21).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.sessions_d30).toFixed(2)}
                      </TableCell>

                      <TableCell className={classes.tableCell}>
                        {Number(item?.sessions_d60).toFixed(2)}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {Number(item?.sessions_d90).toFixed(2)}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {Number(item?.sessions_d180).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )
                );
              })}
          </TableBody>
        </Table>
        {!(props.DW || props.GW) && (
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
            <>
              <Button
                onClick={() => {
                  props.setDW(true);

                  handleOptionClick(
                    props.start,
                    props.end,
                    props.campID,
                    "campwisedate",
                    ""
                  );
                }}
              >
                DW
              </Button>
              <Button
                onClick={() => {
                  props.setGW(true);

                  
                  handleOptionClick(
                    props.start,
                    props.end,
                    props.campID,
                    "campwisegeo",
                    ""
                  );
                }}
              >
                GW
              </Button>
            </>
          </Popover>
        )}
      </Styles>
    </div>
  );
}

export default QuestionsTable;

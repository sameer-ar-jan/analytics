import React, { useState, useEffect } from "react";
import { Box, Toolbar } from "@mui/material";
import { styled } from "@mui/system";
import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import "./Selector.css";
import { usePathname } from "next/navigation";

const BottomButton = styled(Button)`
  && {
    font-size: 12pt;
    padding: 4px 14px;
    background-color: ${(props) =>
      props.selected ? "#faf9f6" : "#f3f3f3"} !important;
    color: black;
    border-radius: 5px;
    border: 2px solid #e0e0e0 !important;
    font-weight: 500;
    margin: 0;
    min-width: fit-content;
    white-space: nowrap;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      background-color: #faf9f6 !important;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
`;

const ActionButton = styled(Button)`
  && {
    min-width: 40px;
    background: #f3f3f3;
    color: black;
    padding: 0;
    width: 32px !important;
    height: 32px;
    margin-left: 8px;
    border: 2px solid #e0e0e0;
    border-radius: 5px;
    transition: all 0.2s ease;

    &:hover {
      background: #faf9f6 !important;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
`;

// ---------- Default button arrays ----------
const namesArray = [
  "AI",
  "A",
  "I",
  "CWA",
  "CWI",
  "US A",
  "US I",
  "UK A",
  "UK I",
  "RU A",
  "RU I",
];

const namesArrayCampWise = [
  "AI",
  "A",
  "I",
  "US A",
  "US I",
  "UK A",
  "UK I",
  "RU A",
  "RU I",
];

const namesArrayCountry = ["AI", "A", "I"];

const namesArrayOverall = [
  "AI",
  "A",
  "I",
  "GWA",
  "GWI",
  "GWO",
  "CWP_7",
  "CWP_30",
  "US A",
  "US I",
  "UK A",
  "UK I",
  "RU A",
  "RU I",
];

// ✅ New array for Roas2y
const namesArrayRoas2y = ["AI", "A", "I"];

function Selector(props) {
  const pathname = usePathname();

  // ---------- Route helpers ----------
  const isDashboard = pathname.startsWith("/dashboard");
  const isCampwise = pathname.startsWith("/campwise");
  const isRoas2y = pathname.startsWith("/roas2y"); // ✅ New route

  const handleOptionClick = (query) => {
    setSelected(query);
    props.onQueryChange(query, props.game1);
    props.loader?.(true);
  };

  const [selected, setSelected] = useState("");
  const [newName, setNewName] = useState("");
  const [action] = useState("add");
  const [showButtons, setShowButtons] = useState(true);

  // ---------- Local state for each array ----------
  const [names, setNames] = useState(namesArray);
  const [namesCampWise, setNamesCampWise] = useState(namesArrayCampWise);
  const [namesRoas2y, setNamesRoas2y] = useState(namesArrayRoas2y); // ✅

  // Initial buttonLabels based on route
  const [buttonLabels, setButtonLabels] = useState(
    isCampwise ? namesArrayCampWise : isRoas2y ? namesArrayRoas2y : namesArray
  );

  const handleAddName = () => {
    if (newName.trim().length > 0 && !buttonLabels.includes(newName)) {
      let updatedArray;

      if (isDashboard) {
        updatedArray = [...names, newName];
        setNames(updatedArray);
        localStorage.setItem(`${props?.game1}1`, JSON.stringify(updatedArray));
      } else if (isCampwise) {
        updatedArray = [...namesCampWise, newName];
        setNamesCampWise(updatedArray);
        localStorage.setItem("array3", JSON.stringify(updatedArray));
      } else if (isRoas2y) {
        updatedArray = [...namesRoas2y, newName];
        setNamesRoas2y(updatedArray);
        localStorage.setItem("array4", JSON.stringify(updatedArray));
      } else {
        updatedArray = [...names, newName];
        setNames(updatedArray);
        localStorage.setItem("array2", JSON.stringify(updatedArray));
      }

      setButtonLabels(updatedArray);

      if (isDashboard) {
        localStorage.setItem("gamename", props?.game1);
      }

      setNewName("");
    }
  };

  const handleRemoveName = () => {
    if (newName.trim().length > 0) {
      if (newName === "All") {
        const resetNames = isDashboard
          ? props?.game1?.toLowerCase().includes("china")
            ? namesArrayCountry
            : namesArray
          : isCampwise
          ? namesArrayCampWise
          : isRoas2y
          ? namesArrayRoas2y
          : namesArrayOverall;

        if (isDashboard) {
          localStorage.setItem(`${props?.game1}1`, JSON.stringify(resetNames));
        } else if (isCampwise) {
          localStorage.setItem("array3", JSON.stringify(resetNames));
        } else if (isRoas2y) {
          localStorage.setItem("array4", JSON.stringify(resetNames));
        } else {
          localStorage.setItem("array2", JSON.stringify(resetNames));
        }
        setNames(resetNames);
        setNamesCampWise(resetNames);
        setNamesRoas2y(resetNames);
        setButtonLabels(resetNames);
      } else if (
        buttonLabels.includes(newName) &&
        !namesArray.includes(newName)
      ) {
        const updatedNames = names.filter((n) => n !== newName);
        const updatedNamesCampWise = namesCampWise.filter((n) => n !== newName);
        const updatedNamesRoas2y = namesRoas2y.filter((n) => n !== newName);
        const updatedButtonLabels = buttonLabels.filter(
          (label) => label !== newName
        );

        if (isDashboard) {
          localStorage.setItem(
            `${props?.game1}1`,
            JSON.stringify(updatedNames)
          );
        } else if (isCampwise) {
          localStorage.setItem("array3", JSON.stringify(updatedNamesCampWise));
        } else if (isRoas2y) {
          localStorage.setItem("array4", JSON.stringify(updatedNamesRoas2y));
        } else {
          localStorage.setItem("array2", JSON.stringify(updatedNames));
        }

        setNames(updatedNames);
        setNamesCampWise(updatedNamesCampWise);
        setNamesRoas2y(updatedNamesRoas2y);
        setButtonLabels(updatedButtonLabels);
      }
      setNewName("");
    }
  };

  useEffect(() => {
    if (props?.game1 === "x2" && props?.showGraph) {
      setShowButtons(false);
    } else if (props?.game1 === "2248" && props?.showGraph) {
      setShowButtons(false);
    } else setShowButtons(true);

    const dashList = JSON.parse(localStorage.getItem(`${props?.game1}1`));
    const campList = JSON.parse(localStorage.getItem("array3"));
    const roas2yList = JSON.parse(localStorage.getItem("array4")); // ✅

    const defaultDashboard = namesArray;
    const defaultCampWise = namesArrayCampWise;
    const defaultRoas2y = namesArrayRoas2y;

    if (isCampwise) {
      if (Array.isArray(campList) && campList.length > 0) {
        setNamesCampWise(campList);
        setButtonLabels(campList);
      } else {
        setNamesCampWise(defaultCampWise);
        setButtonLabels(defaultCampWise);
      }
    } else if (isRoas2y) {
      if (Array.isArray(roas2yList) && roas2yList.length > 0) {
        setNamesRoas2y(roas2yList);
        setButtonLabels(roas2yList);
      } else {
        setNamesRoas2y(defaultRoas2y);
        setButtonLabels(defaultRoas2y);
      }
    } else {
      if (Array.isArray(dashList) && dashList.length > 0) {
        setNames(dashList);
        setButtonLabels(dashList);
      } else {
        setNames(defaultDashboard);
        setButtonLabels(defaultDashboard);
      }
    }
  }, [props.game1, props.showGraph, pathname]);

  useEffect(() => {
    if (props.count) {
      if (props.temp?.length > 0) {
        setSelected(props.temp[1]);
        props.onQueryChange(props.temp[1], props.temp[0]);
      } else {
        setSelected("AI");
        props.onQueryChange("AI", props.game1);
      }
    } else setSelected("AI");
    props?.setCount(1);
  }, [props.signal]);

  useEffect(() => {
    localStorage.setItem("buttonLabels", JSON.stringify(buttonLabels));
  }, [buttonLabels]);

  // ---- Drag & Drop reordering ----
  const [draggedButtonIndex, setDraggedButtonIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedButtonIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    const newButtonLabels = [...buttonLabels];
    const [draggedButtonLabel] = newButtonLabels.splice(draggedButtonIndex, 1);
    newButtonLabels.splice(index, 0, draggedButtonLabel);
    setButtonLabels(newButtonLabels);
    setDraggedButtonIndex(null);

    if (isCampwise) {
      localStorage.setItem("array3", JSON.stringify(newButtonLabels));
    } else if (isDashboard) {
      localStorage.setItem(`${props?.game1}1`, JSON.stringify(newButtonLabels));
    } else if (isRoas2y) {
      localStorage.setItem("array4", JSON.stringify(newButtonLabels));
    } else {
      localStorage.setItem("array2", JSON.stringify(newButtonLabels));
    }
  };

  return (
    <>
      {showButtons && (
        <Toolbar
          sx={{
            "@media (min-width: 600px)": {
              "& .MuiToolbar-root": {
                "min-height": "57px !important",
              },
            },
            "min-height": "57px !important",
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            "z-index": 1,
            backgroundColor: "#faf9f6",
            boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
            display: "flex",
            "flex-direction": "row",
            "justify-content": "space-between",
            alignItems: "center",
            padding: "0 16px",
            gap: "16px",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <div className="buttons-container" style={{ padding: "8px 0" }}>
              <div className="buttons-scroll-container">
                {buttonLabels.map((label, index) => (
                  <BottomButton
                    key={label}
                    selected={selected === label}
                    onClick={() => handleOptionClick(label)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e)}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {label}
                  </BottomButton>
                ))}
              </div>
            </div>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <TextField
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  action === "add" ? handleAddName() : handleRemoveName();
                }
              }}
              placeholder="Insert Button"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "32px",
                  backgroundColor: "#fff",
                },
                width: { xs: "120px", sm: "150px" },
              }}
            />
            <ActionButton onClick={handleAddName}>✔</ActionButton>
            <ActionButton onClick={handleRemoveName}>✖</ActionButton>
          </Box>
        </Toolbar>
      )}
    </>
  );
}

export default Selector;

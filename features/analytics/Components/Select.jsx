import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function SelectLabels(props) {
  const [itemsExp, setItemsExp] = React.useState([]);
  const [itemsGeo, setItemsGeo] = React.useState([]);
  // const [item, setItem] = React.useState("");

  const handleChangeExp = (event) => {
    props.setItemExp(event.target.value);
  };
  const handleChangeGeo = (event) => {
    props.setItemGeo(event.target.value);
  };
  React.useEffect(() => {
    setItemsExp(props?.experiments);
    setItemsGeo(props?.geo);
    
  }, [props.experiments, props.geo]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <FormControl
        variant="standard"
        sx={{
          m: 1,
          // marginRight: "-40px",
          minWidth: 120,
          display: "flex",
          flexDirection: "row",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <InputLabel id="demo-simple-select-standard-label">Geo</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={props.itemGeo}
            label="Geo"
            onChange={handleChangeGeo}
          >
            {itemsGeo?.map((item, rowIndex) => (
              <MenuItem key={rowIndex} value={item}>{item}</MenuItem>
            ))}
          </Select>
        </div>
      </FormControl>
      <FormControl
        variant="standard"
        sx={{ m: 1, minWidth: 120, display: "flex", flexDirection: "row" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <InputLabel id="demo-simple-select-standard-label">
            Experiments
          </InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={props.itemExp}
            label="Experiments"
            onChange={handleChangeExp}
          >
            {itemsExp?.map((item, rowIndex) => (
              <MenuItem key={rowIndex} value={item}>{item}</MenuItem>
            ))}
          </Select>
        </div>
      </FormControl>
    </div>
  );
}

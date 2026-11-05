import React from "react";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import "./select.css";
const classes = {"formControl": "formControl"};

export default function SimpleSelect(props) {
  const handleChange = (event) => {
    
    props.setValue(event.target.value);
  };

  return (
    <div>
      <FormControl
        sx={{ marginLeft: "10px", marginTop: "10px" }}
        className={classes.formControl}
      >
        <InputLabel
          sx={{ background: "white" }}
          id="demo-simple-select-helper-label"
        >
          {props.label}
        </InputLabel>
        <Select
          sx={{
            "& .MuiOutlinedInput-input": {
              width: "150px",
            },
          }}
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={props.value}
          onChange={handleChange}
        >
          <MenuItem value="All">
            <em>All</em>
          </MenuItem>
          {props.list.length < 3
            ? props?.list?.map((item, i) => (
                <MenuItem key={i} value={item}>{item}</MenuItem>
              ))
            : props?.list?.map((item, i) => (
                <MenuItem key={i} value={item}>{item}</MenuItem>
              ))}
        </Select>
        {/* <FormHelperText>Some important helper text</FormHelperText> */}
      </FormControl>
    </div>
  );
}

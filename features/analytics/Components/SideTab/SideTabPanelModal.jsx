import React from "react";
import PropTypes from "prop-types";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import DualMultiLineChart from "../Charts/DualMultiLineChart";
import classes from "./sideTab.module.css";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      style={{ width: "100%", minWidth: 0 }}
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div" sx={{ width: "100%", minWidth: 0, height: "650px" }}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabsModal(props) {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      {props.add ? (
        <>
          <Box
            sx={{
              flexGrow: 1,
              bgcolor: "background.paper",
              display: "flex",
              width: "100%",
              minWidth: 0,
              height: 224,
            }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={handleChange}
              aria-label="Vertical tabs example"
              sx={{ borderRight: 1, borderColor: "divider" }}
              className={classes.tabs}
            >
              {" "}
              <Tab label="Cpi" {...a11yProps(0)} />
              <Tab label="Users" {...a11yProps(1)} />
              <Tab label="Cost" {...a11yProps(2)} />
            </Tabs>
            <TabPanel className={classes.tab} value={value} index={0}>
              <DualMultiLineChart data={props.data[`data${props.tab.cpi}`]} />
            </TabPanel>
            <TabPanel className={classes.tab} value={value} index={1}>
              <DualMultiLineChart data={props.data[`data${props.tab.users}`]} />
            </TabPanel>
            <TabPanel className={classes.tab} value={value} index={2}>
              <DualMultiLineChart data={props.data[`data${props.tab.cost}`]} />
            </TabPanel>
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              // flexGrow: 1,
              bgcolor: "background.paper",
              display: "flex",
              width: "100%",
              minWidth: 0,
              height: 224,
            }}
          >
            {/* <Tabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={handleChange}
              aria-label="Vertical tabs example"
              className={classes.tabs}
            >
              {" "}
              {props.tab.cpm && <Tab label="Cpm" {...a11yProps(0)} />}
              {props.tab.rev && <Tab label="Rev" {...a11yProps(0)} />}
              {props.tab.imp && <Tab label="Imp" {...a11yProps(0)} />}
            </Tabs> */}
            {props.tab.cpm && (
              <TabPanel className={classes.tab} value={value} index={0}>
                <DualMultiLineChart data={props.data[`data${props.tab.cpm}`]} />
              </TabPanel>
            )}
            {props.tab.rev && (
              <TabPanel className={classes.tab} value={value} index={0}>
                <DualMultiLineChart data={props.data[`data${props.tab.rev}`]} />
              </TabPanel>
            )}
            {props.tab.imp && (
              <TabPanel className={classes.tab} value={value} index={0}>
                <DualMultiLineChart data={props.data[`data${props.tab.imp}`]} />
              </TabPanel>
            )}
          </Box>
        </>
      )}
    </div>
  );
}

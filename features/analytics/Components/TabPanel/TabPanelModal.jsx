import React from "react";
import PropTypes from "prop-types";
import classes from "./tabpanel.module.css";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import DualMultiLineChart from "../Charts/DualMultiLineChart";
import VerticalTabsModal from "../SideTab/SideTabPanelModal";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component="div" sx={{ width: "100%", minWidth: 0, height: "650px" }}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function SimpleTabsModal(props) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    
  }, [props]);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  React.useEffect(() => {
    props.setLoading(false);
  }, [props.query]);
  return (
    <div className={classes.root}>
      {props.iap ? (
        <>
          {props.events ? (
            <>
              <AppBar
                sx={{ background: "#f3f3f3", width: "100%" }}
                position="static"
              >
                <div className={classes.eventControls}>
                  <Tabs
                    className={classes.tabpanel1}
                    value={value}
                    onChange={handleChange}
                    aria-label="simple tabs example"
                  >
                    {props.allData.map((item, i) => (
                      <Tab key={i}
                        sx={{
                          top: "10px",
                          minWidth: "49px !important",
                          width:
                            item.name === "purchase"
                              ? "100px !important"
                              : item.name === "Ad Impression"
                              ? "150px !important"
                              : "60px !important",
                        }}
                        className={props.shrink ? classes.root2 : classes.root1}
                        label={item.name}
                        {...a11yProps(i)}
                      />
                    ))}
                  </Tabs>
                  {props.select}
                </div>
              </AppBar>
              {props.allData.map((item, i) => (
                <TabPanel key={i} className={classes.tabpanel1} value={value} index={i}>
                  <DualMultiLineChart data={item.value} />
                </TabPanel>
              ))}
            </>
          ) : (
            <>
              <AppBar
                sx={{ background: "#f3f3f3", width: "100%" }}
                position="static"
              >
                <Tabs
                  className={classes.tabpanel1}
                  value={value}
                  onChange={handleChange}
                  aria-label="simple tabs example"
                >
                  {props.allData.map((item, i) => (
                    <Tab key={i}
                      sx={{
                        minWidth: "49px !important",
                        width: "60px !important",
                      }}
                      className={props.shrink ? classes.root2 : classes.root1}
                      label={item.name}
                      {...a11yProps(i)}
                    />
                  ))}
                </Tabs>
              </AppBar>
              {props.allData.map((item, i) => (
                <TabPanel key={i} className={classes.tabpanel1} value={value} index={i}>
                  <DualMultiLineChart data={props.data[`data${item.value}`]} />
                </TabPanel>
              ))}
            </>
          )}
        </>
      ) : (
        <>
          <AppBar position="static">
            <Tabs
              className={classes.tabpanel1}
              value={value}
              onChange={handleChange}
              aria-label="simple tabs example"
            >
              {props.allData.map((item, i) => (
                <Tab key={i}
                  sx={{ minWidth: "49px !important", width: "50px !important" }}
                  className={props.shrink ? classes.root2 : classes.root1}
                  label={item.name}
                  {...a11yProps(i)}
                />
              ))}
            </Tabs>
          </AppBar>
          {props.allData.map((item, i) => (
            <TabPanel key={i} className={classes.tabpanel1} value={value} index={i}>
              <VerticalTabsModal
                add={props.add}
                data={props.data}
                head={props.head2}
                tab={item}
              />
            </TabPanel>
          ))}
        </>
      )}
    </div>
  );
}

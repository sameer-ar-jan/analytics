import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import Modal from "@mui/material/Modal";

import moment from "moment";
import "./modal.css";
const classes = { btn: "btn" };
const style = {
  position: "absolute",
  overflowX: "scroll",

  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1200,
  height: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function BasicModal(props) {
  const handleOpen = () => {
    props.setShowGraph(true);
  };

  let data = [];
  let data1 = [];
  React.useEffect(() => {
    props.questions?.map((row) => {
      data.push({
        date: moment(row?.Install_time?.value).format("DD MMM"),
        value: Math.round(row?.total_spend, 0),
        category: row?.game,
      });
    });
    props.questions?.map((row) => {
      data1.push({
        date: moment(row?.Install_time?.value).format("DD MMM"),
        value: Math.round(row?.total_users, 0),
        category: row?.game,
      });
    });
  });
  return (
    <div>
      {props?.open !== null && props?.open !== undefined ? (
        <Modal
          open={props.open[props.bool]}
          onClose={props.handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>{props.children}</Box>
        </Modal>
      ) : (
        <Button
          className={classes.btn}
          sx={{
            padding: "0px 5px !important",

            "margin-left": "0px !important",

            "border-radius": "5px !important",
            color: "black !important",
            display: "block !important",
            background: "#f3f3f3 !important",
            textTransform: "none ",
            fontWeight: "0px !important",
          }}
          onClick={() => {
            // props?.setData({ ...props.dataSets, loader: true });
            handleOpen();
            // props?.showGraph &&
            //   props?.setData({ ...props.dataSets, loader: false });
          }}
        >
          Graphs
        </Button>
      )}
    </div>
  );
}

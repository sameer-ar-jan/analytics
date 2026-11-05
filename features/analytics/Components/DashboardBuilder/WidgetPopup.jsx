"use client";

import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WidgetRenderer from "./WidgetRenderer";
import styles from "./dashboard.module.css";

export default function WidgetPopup({ widget, rows, onClose }) {
  return (
    <Dialog
      open={Boolean(widget)}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: "82vh" } }}
    >
      <DialogTitle className={styles.popupTitle}>
        <span>{widget?.title}</span>
        <IconButton aria-label="Close widget" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: 0 }}>
        <div className={styles.popupContent}>
          <WidgetRenderer widget={widget} rows={rows} days={widget?.days || 30} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

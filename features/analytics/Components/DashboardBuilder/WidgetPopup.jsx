"use client";

import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import WidgetRenderer from "./WidgetRenderer";
import styles from "./dashboard.module.css";

export default function WidgetPopup({ widget, rows, days, dateRange, periodLabel, loading, onDateFilterClick, onClose }) {
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
        <div>
        <IconButton aria-label="Date filter" title="Date filter" onClick={onDateFilterClick}>
          <CalendarMonthIcon />
        </IconButton>
        <IconButton aria-label="Close widget" onClick={onClose}>
          <CloseIcon />
        </IconButton>
        </div>
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: 0 }}>
        <div className={styles.popupContent}>
          <WidgetRenderer
            widget={widget}
            rows={rows}
            days={days}
            dateRange={dateRange}
            periodLabel={periodLabel}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import WidgetRenderer from "./WidgetRenderer";

export default function WidgetPopup({ widget, onClose }) {
  return (
    <Dialog
      open={Boolean(widget)}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {widget.title}

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          minHeight: 0,
        }}
      >
        <div style={{ height: "100%" }}>
          <WidgetRenderer widget={widget} days={widget.days || 30} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

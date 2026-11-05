import React, { useRef, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import SimpleTabsModal from "../../Components/TabPanel/TabPanelModal";

const MIN_SIZE = { width: 360, height: 320 };
const RESIZE_HANDLES = [
  { corner: "top-left", cursor: "nwse-resize", style: { top: -2, left: -2 } },
  { corner: "top-right", cursor: "nesw-resize", style: { top: -2, right: -2 } },
  {
    corner: "bottom-left",
    cursor: "nesw-resize",
    style: { bottom: -2, left: -2 },
  },
  {
    corner: "bottom-right",
    cursor: "nwse-resize",
    style: { bottom: -2, right: -2 },
  },
];

const getPointer = (event) => event.touches?.[0] || event;

export default function NewDauPopup({
  open,
  onClose,
  onDateFilterClick,
  data,
  query,
  setLoading,
}) {
  const [position, setPosition] = useState({ x: 280, y: 130 });
  const [size, setSize] = useState({ width: 760, height: 520 });
  const dialogRef = useRef(null);
  const interactionRef = useRef(null);

  const handleDragStart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const point = getPointer(event);
    if (!point) return;

    interactionRef.current = {
      type: "drag",
      startX: point.clientX,
      startY: point.clientY,
      originX: position.x,
      originY: position.y,
    };

    const handleMove = (moveEvent) => {
      const movePoint = getPointer(moveEvent);
      const interaction = interactionRef.current;
      if (!movePoint || !interaction || interaction.type !== "drag") return;
      moveEvent.preventDefault();
      setPosition({
        x: Math.max(
          8,
          Math.min(
            interaction.originX + movePoint.clientX - interaction.startX,
            window.innerWidth - size.width - 8,
          ),
        ),
        y: Math.max(
          8,
          Math.min(
            interaction.originY + movePoint.clientY - interaction.startY,
            window.innerHeight - size.height - 8,
          ),
        ),
      });
    };

    const stop = () => {
      interactionRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", stop);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", stop);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", stop);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", stop);
  };

  const handleResizeStart = (corner) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    const point = getPointer(event);
    const dialog = dialogRef.current;
    if (!point || !dialog) return;

    const rect = dialog.getBoundingClientRect();
    const startsAtLeft = corner.includes("left");
    const startsAtTop = corner.includes("top");
    interactionRef.current = {
      type: "resize",
      startX: point.clientX,
      startY: point.clientY,
      originX: rect.left,
      originY: rect.top,
      originWidth: rect.width,
      originHeight: rect.height,
      startsAtLeft,
      startsAtTop,
    };

    const handleMove = (moveEvent) => {
      const movePoint = getPointer(moveEvent);
      const interaction = interactionRef.current;
      if (!movePoint || !interaction || interaction.type !== "resize") return;
      moveEvent.preventDefault();
      const deltaX = movePoint.clientX - interaction.startX;
      const deltaY = movePoint.clientY - interaction.startY;
      const nextWidth = Math.max(
        MIN_SIZE.width,
        interaction.originWidth + (interaction.startsAtLeft ? -deltaX : deltaX),
      );
      const nextHeight = Math.max(
        MIN_SIZE.height,
        interaction.originHeight + (interaction.startsAtTop ? -deltaY : deltaY),
      );

      setSize({ width: nextWidth, height: nextHeight });
      setPosition({
        x: interaction.startsAtLeft
          ? Math.max(
              8,
              interaction.originX + interaction.originWidth - nextWidth,
            )
          : interaction.originX,
        y: interaction.startsAtTop
          ? Math.max(
              8,
              interaction.originY + interaction.originHeight - nextHeight,
            )
          : interaction.originY,
      });
    };

    const stop = () => {
      interactionRef.current = null;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", stop);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", stop);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", stop);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", stop);
  };

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        minWidth: MIN_SIZE.width,
        minHeight: MIN_SIZE.height,
        maxWidth: "calc(100vw - 16px)",
        maxHeight: "calc(100vh - 16px)",
        background: "#ffffff",
        border: "1px solid #d3d3d3",
        borderRadius: 6,
        boxShadow: "0 16px 42px rgba(0, 0, 0, 0.24)",
        zIndex: 1500,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          height: 44,
          padding: "0 10px 0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#f3f3f3",
          borderBottom: "1px solid #d3d3d3",
          cursor: "move",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>
          New and DAU
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Tooltip title="Date filter">
            <IconButton
              size="small"
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onDateFilterClick(event);
              }}
            >
              <CalendarMonthIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
      <div
        style={{
          padding: "12px 16px 16px",
          flex: 1,
          minHeight: 0,
          overflow: "auto",
        }}
      >
        <SimpleTabsModal
          query={query}
          setLoading={setLoading}
          data={data}
          iap={true}
          allData={[
            { name: "New", value: 81 },
            { name: "DAU", value: 1 },
          ]}
        />
      </div>
      {RESIZE_HANDLES.map((handle) => (
        <div
          key={handle.corner}
          onMouseDown={handleResizeStart(handle.corner)}
          onTouchStart={handleResizeStart(handle.corner)}
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            zIndex: 3,
            cursor: handle.cursor,
            touchAction: "none",
            ...handle.style,
          }}
        />
      ))}
    </div>
  );
}

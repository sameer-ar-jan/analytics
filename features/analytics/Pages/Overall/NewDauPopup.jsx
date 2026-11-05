import React, { useRef, useState } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import DualMultiLineChart from "../../Components/Charts/DualMultiLineChart";

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
  dialogRef,
  closeDateFilterFromDialog,
  onDateFilterClick,
  onClose,
  showGameWise,
  onToggleGameWise,
  gameLoading,
  gameError,
  games = [],
  selectedGame,
  onSelectedGameChange,
  selectedGameData,
  graphData = [],
  xAxisRange,
}) {
  const [position, setPosition] = useState({ x: 320, y: 170 });
  const [size, setSize] = useState({ width: 760, height: 520 });
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  const handleDragStart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const point = getPointer(event);
    if (!point) return;

    dragRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      originX: position.x,
      originY: position.y,
    };

    const handleMove = (moveEvent) => {
      const movePoint = getPointer(moveEvent);
      const drag = dragRef.current;
      if (!movePoint || !drag) return;
      moveEvent.preventDefault();
      setPosition({
        x: Math.max(
          8,
          Math.min(
            drag.originX + movePoint.clientX - drag.startX,
            window.innerWidth - size.width - 8,
          ),
        ),
        y: Math.max(
          8,
          Math.min(
            drag.originY + movePoint.clientY - drag.startY,
            window.innerHeight - size.height - 8,
          ),
        ),
      });
    };

    const stop = () => {
      dragRef.current = null;
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
    resizeRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      originX: rect.left,
      originY: rect.top,
      originWidth: rect.width,
      originHeight: rect.height,
      startsAtLeft: corner.includes("left"),
      startsAtTop: corner.includes("top"),
    };

    const handleMove = (moveEvent) => {
      const movePoint = getPointer(moveEvent);
      const resize = resizeRef.current;
      if (!movePoint || !resize) return;
      moveEvent.preventDefault();

      const deltaX = movePoint.clientX - resize.startX;
      const deltaY = movePoint.clientY - resize.startY;
      const nextWidth = Math.max(
        MIN_SIZE.width,
        resize.originWidth + (resize.startsAtLeft ? -deltaX : deltaX),
      );
      const nextHeight = Math.max(
        MIN_SIZE.height,
        resize.originHeight + (resize.startsAtTop ? -deltaY : deltaY),
      );

      setSize({ width: nextWidth, height: nextHeight });
      setPosition({
        x: resize.startsAtLeft
          ? Math.max(8, resize.originX + resize.originWidth - nextWidth)
          : resize.originX,
        y: resize.startsAtTop
          ? Math.max(8, resize.originY + resize.originHeight - nextHeight)
          : resize.originY,
      });
    };

    const stop = () => {
      resizeRef.current = null;
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

  const chartHeight = Math.max(220, size.height - (showGameWise ? 180 : 118));

  return (
    <div
      ref={dialogRef}
      onMouseDownCapture={closeDateFilterFromDialog}
      onTouchStartCapture={closeDateFilterFromDialog}
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
        <h3 style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>New vs DAU</h3>
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
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 10,
          }}
        >
          <Button
            size="small"
            variant={showGameWise ? "contained" : "outlined"}
            onClick={onToggleGameWise}
          >
            Game Wise
          </Button>
        </div>
        {showGameWise ? (
          gameLoading ? (
            <div
              style={{
                height: chartHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
              }}
            >
              Loading game wise data...
            </div>
          ) : (
            <>
              {gameError && (
                <div
                  style={{ marginBottom: 10, color: "#b00020", fontSize: 13 }}
                >
                  {gameError}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <label
                  htmlFor="new-dau-game"
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  Game
                </label>
                <select
                  id="new-dau-game"
                  value={selectedGame}
                  onChange={(event) => onSelectedGameChange(event.target.value)}
                  style={{
                    minWidth: 180,
                    height: 34,
                    border: "1px solid #c8c8c8",
                    borderRadius: 4,
                    background: "#fff",
                    padding: "0 8px",
                    fontSize: 13,
                  }}
                >
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedGameData?.error ? (
                <div
                  style={{
                    height: chartHeight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                  }}
                >
                  Unable to load data
                </div>
              ) : selectedGameData?.data?.length > 0 ? (
                <div style={{ height: chartHeight }}>
                  <DualMultiLineChart
                    data={selectedGameData.data}
                    rightCategories={["DAU"]}
                    height={chartHeight}
                    xAxisRange={xAxisRange}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: chartHeight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                  }}
                >
                  No data
                </div>
              )}
            </>
          )
        ) : (
          <div style={{ height: chartHeight }}>
            {graphData.length > 0 ? (
              <DualMultiLineChart
                data={graphData}
                rightCategories={["DAU"]}
                xAxisRange={xAxisRange}
                height={chartHeight}
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                }}
              >
                No data
              </div>
            )}
          </div>
        )}
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

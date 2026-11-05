import React from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import DualMultiLineChart from "../../Components/Charts/DualMultiLineChart";
import LineChart from "../../Components/Charts/LineChart";
export default function RevenueSpendPopup({
  open,
  dialogRef,
  position,
  size,
  chartHeight,
  resizeHandles,
  closeDateFilterFromDialog,
  handleDragStart,
  handleResizeStart,
  onDateFilterClick,
  onClose,
  showGameWise,
  onToggleGameWise,
  gameLoading,
  gameError,
  games,
  selectedGame,
  onSelectedGameChange,
  selectedGameData,
  graphData = [],
  xAxisRange,
}) {
  if (!open) return null;

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
        minWidth: 360,
        minHeight: 320,
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
          Revenue vs Total Spend
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
          overflowY: "auto",
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
                  htmlFor="revenue-spend-game"
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  Game
                </label>
                <select
                  id="revenue-spend-game"
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
                    rightCategories={["Total Spend"]}
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
              <LineChart
                data={graphData}
                rightCategories={["Total Spend"]}
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
      {resizeHandles.map((handle) => (
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

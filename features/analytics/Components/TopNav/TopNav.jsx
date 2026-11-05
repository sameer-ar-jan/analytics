"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import UnfoldMoreDoubleIcon from "@mui/icons-material/UnfoldMoreDouble";
import UnfoldLessDoubleIcon from "@mui/icons-material/UnfoldLessDouble";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/system";
import LogoutIcon from "@mui/icons-material/Logout";
import DownloadIcon from "@mui/icons-material/Download";
import Typography from "@mui/material/Typography";
import "./topNav.css";
const classes = {"AppBar": "AppBar"};
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import GamepadIcon from "@mui/icons-material/Gamepad";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { signOut } from "../../api/session";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import BasicModal from "../BasicModal/BasicModal";

const pages = ["Products", "Pricing", "Blog"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

const ActionButton = styled(Button)`
  && {
    min-width: 32px;
    height: 25px;
    margin: 8px 4px;
    padding: 0px 8px;
    background: #f3f3f3 !important;
    border-radius: 5px;
    transition: all 0.2s ease;

    &:hover {
      background-color: white !important;
      transform: translateY(-1px);
    }

    .MuiSvgIcon-root {
      font-size: 18px;
      color: #333;
    }
  }
`;

const ResponsiveButton = styled(Button)`
  && {
    padding: 0px 8px !important;
    height: 25px;
    margin: 8px 4px;
    min-width: fit-content;
    white-space: nowrap;
    background: ${(props) => (props.active ? "white" : "#f3f3f3")} !important;
    text-transform: none !important;
    font-size: clamp(10px, 2vw, 11pt);
    border-radius: 5px !important;
    color: black !important;
    transition: all 0.2s ease;

    &:hover {
      background-color: white !important;
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      padding: 0px 6px !important;
      margin: 4px 2px;
      font-size: clamp(9px, 1.8vw, 10pt);
    }
  }
`;

function TopNav({
  showGraph,
  back,
  setData,
  dataSets,
  setShowGraph,
  questions,
  games,
  game,
  query,
  handleIdChange,
  handleDownload,
  handleExpand,
  handleExpandFullData,
  showFullMonthTable,
  showFullDataTable,
  signout,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageID = searchParams.get("game") || pathname.slice(1);
  const handleSignOut = () => signOut(router);

  return (
    <AppBar
      className={classes.AppBar}
      position="fixed"
      sx={{
        backgroundColor: "#faf9f6 !important",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Container maxWidth="xxl">
        <Toolbar disableGutters>
          {showGraph && <div style={{ marginTop: "-50px" }}>{back}</div>}
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              width: { xs: "200px", sm: "250px", md: "300px" },
              mr: 2,
              display: "flex",
              fontWeight: "700 !important",
              color: "black !important",
              textDecoration: "none !important",
              fontSize: {
                xs: "18px !important",
                sm: "20px !important",
                md: "22px !important",
              },
            }}
          >
            {pathname.slice(0, 10) === "/dashboard" &&
              (game === "x7"
                ? "Hexa"
                : game === "numberblast"
                ? "NumberBlast"
                : game === "xblock"
                ? "X Block"
                : game === "matchme"
                ? "MatchMe"
                : game === "pairme"
                ? "PairMe"
                : game)}{" "}
            {pathname.slice(0, 9) !== "/cohort" && query}
          </Typography>
          <Box
            sx={{
              width: "100vw",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              overflowX: "auto",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                height: "40px",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "nowrap",
              }}
            >
              <ResponsiveButton
                active={pageID === "overall"}
                component={Link}
                href="/overall"
              >
                Overall
              </ResponsiveButton>
              <ResponsiveButton
                active={pathname === "/dashboardbuilder"}
                component={Link}
                href="/dashboardbuilder"
              >
                Dashboard Builder
              </ResponsiveButton>
              {games.map((page, i) => (
                <ResponsiveButton
                  key={page.id}
                  active={pageID === page.id}
                  component={Link}
                  href={`/dashboard?${new URLSearchParams({ game: page.id, q: "AI" })}`}
                >
                  {page.name}
                </ResponsiveButton>
              ))}

              <ResponsiveButton
                active={pageID === "campwise"}
                component={Link}
                href="/campwise"
              >
                Campwise
              </ResponsiveButton>
              <ResponsiveButton
                active={pageID === "roas2y"}
                component={Link}
                href="/roas2y"
              >
                ROAS_2y
              </ResponsiveButton>

              {pathname.slice(0, 9) !== "/campwise" &&
                pathname.slice(0, 7) !== "/roas2y" && (
                  <BasicModal
                    setData={setData}
                    dataSets={dataSets}
                    setShowGraph={setShowGraph}
                    query={query}
                    questions={questions}
                    showGraph={showGraph}
                  />
                )}

              <Tooltip title="Download">
                <ActionButton data-testid="export-report" onClick={handleDownload}>
                  <DownloadIcon />
                </ActionButton>
              </Tooltip>

              {pathname.slice(0, 9) !== "/campwise" &&
                pathname.slice(0, 7) !== "/roas2y" && (
                  <Tooltip title={showFullMonthTable ? "Collapse" : "Expand"}>
                    <ActionButton onClick={handleExpand}>
                      {showFullMonthTable ? (
                        <UnfoldLessDoubleIcon />
                      ) : (
                        <UnfoldMoreDoubleIcon />
                      )}
                    </ActionButton>
                  </Tooltip>
                )}

              <Tooltip title="Logout">
                <ActionButton data-testid="sign-out" onClick={handleSignOut}>
                  <LogoutIcon />
                </ActionButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default TopNav;

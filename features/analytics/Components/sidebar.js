import React, { useState, useEffect } from "react";
import { Button, Drawer, IconButton, List, ListItemText } from "@mui/material";
import Menu from "@mui/icons-material/Menu";
import { styled } from "@mui/system";
const StyledButton = styled("Button")(({ selected }) => ({
  fontSize: "4px",
  padding: "1px 3px",
  backgroundColor: selected ? "#87CEFA" : "transparent",
  color: selected ? "black" : "black",
  borderRadius: "1px",
  "&:hover": {
    backgroundColor: "#20b2aa",
    color: "white",
  },
}));

const games = [
  { id: "x2", name: "X2" },
  { id: "2248", name: "2248" },
  { id: "knots", name: "KNOTS" },
  { id: "x7", name: "x7" },
  { id: "MTN", name: "MTN" },
];

export default function Sidebar(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleIdChange = (id) => {
    const game = games.find((g) => g.id === id);
    setSelectedValue(id);
    document.title = game ? `${game.name}` : "X2";
    props.onIdChange(id);
    handleToggle();
    window.location.hash = id; // set the ID as the URL hash
  };

  useEffect(() => {
    const idFromUrl = window.location.hash.slice(1); // get the ID from the URL hash
    const game = games.find((g) => g.id === idFromUrl);
    document.title = "X2 - React BigQuery";
    if (game) {
      setSelectedValue(game.id);
      document.title = `${game.name} - React BigQuery`;
      props.onIdChange(game.id);
    }
  }, []); // run once on component mount to check for bookmarked game ID

  return (
    <React.Fragment>
      <IconButton onClick={handleToggle}>
        <Menu />
      </IconButton>
      <Drawer open={isOpen} onClose={handleToggle} variant="temporary">
        <List style={{ display: "flex", flexDirection: "column" }}>
          {games.map((game, rowIndex) => (
            <Button key={rowIndex}
            // key={game.id}
            // selected={selectedValue === game.id}
            // onClick={() => handleIdChange(game.id)}
            >
              {/* <ListItemText primary={game.name} /> */}
            </Button>
          ))}
        </List>
      </Drawer>
    </React.Fragment>
  );
}

import React from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import clipboard from "../assets/game/copypaste.png";
import { copyToClipboard } from "./Clipboard";
import gear from "../assets/game/settings.png";
import timer from "../assets/game/timer.png";

function GameNavbar({ gameCode }) {
  return (
    <Navbar style={navbarStyle}>
      <Container className="justify-content-between">
        {/* Timer */}
        <div style={timerStyle}>
          <img
            src={timer}
            style={iconButtonStyle }
          />
          105s
        </div>

        {/* Game Code */}
        <div style={gameCodeStyle}>
          <span>GAME CODE: {gameCode}</span>
          <Button
            onClick={() => copyToClipboard(gameCode)}
            style={copyButtonStyle}
          >
            <img
              src={clipboard}
              alt="Copy to clipboard"
              style={{ width: "28px", height: "28px" }}
            />
          </Button>
        </div>

        {/* Settings */}
        <Button variant="outline-secondary" style={settingsButtonStyle}>
          <img
            src={gear}
            style={iconButtonStyle}
          />
          Settings
        </Button>
      </Container>
    </Navbar>
  );
}

// Custom styles
const navbarStyle = {
  backgroundColor: "#2a2a2a",
  color: "#ffffff",
  padding: "10px 0",
};

const timerStyle = {
  display: "flex",
  justifyContent: "space-between", // Space items evenly
  alignItems: "center",
  padding: "4px 32px",
  backgroundColor: "#f3d694", // Light yellow background color
  border: "4px solid #a36a2f", // Dark border for pixel effect
  borderRadius: "0", // No border radius to keep it square
  boxShadow: "4px 4px 0 #a36a2f", // Pixelated shadow
  fontSize: "12px",
  color: "#000",
  outline: "none",
  position: "relative", // Necessary for positioning pseudo-elements
};

const gameCodeStyle = {
  fontSize: "24px",
  display: "flex",
  alignItems: "top",
};

const copyButtonStyle = {
  background: "none",
  border: "none",
  padding: "4px",
  cursor: "pointer",
};

const iconButtonStyle = {
  width: "20px",
  height: "20px",
  margin: "0px 8px 0px 0px",
};

const settingsButtonStyle = {
    display: "flex",
    justifyContent: "space-between", // Space items evenly
    alignItems: "center",
    padding: "4px 32px",
    backgroundColor: "#C4C4C4", 
    border: "4px solid #8E8E8E", // Dark border for pixel effect
    borderRadius: "0", // No border radius to keep it square
    boxShadow: "4px 4px 0 #8E8E8E", // Pixelated shadow
    fontSize: "12px",
    color: "#000",
    outline: "none",
    position: "relative", // Necessary for positioning pseudo-elements
};

export default GameNavbar;

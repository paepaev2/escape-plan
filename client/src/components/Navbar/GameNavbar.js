import React from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import clipboard from "../../assets/game/navbar/copypaste.png";
import { copyToClipboard } from "./Clipboard";
import timer from "../../assets/game/navbar/timer.png";
import SettingsMenu from "./SettingsMenu";
import CustomButton from "../Button";
import Countdown from "react-countdown";
import BackgroundMusic from "../BackgroundMusic";
import "./GameNavbar.css";

function GameNavbar({ gameCode, turnTimeOut, handleTurnTimeout }) {
  const renderer = ({ seconds }) => {
    return (
      <span className={seconds <= 3 ? "blinking-timer" : ""}>{seconds}</span>
    );
  };

  return (
    <Navbar style={navbarStyle} fixed="top">
      <Container className="justify-content-between">
        {/* Timer */}
        <CustomButton>
          <img src={timer} style={iconButtonStyle} />
          {turnTimeOut && (
            <Countdown
              date={turnTimeOut}
              renderer={renderer}
              onComplete={handleTurnTimeout}
            />
          )}
        </CustomButton>

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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Settings */}
          <SettingsMenu />
          {/* Music */}
          <BackgroundMusic />
        </div>
      </Container>
    </Navbar>
  );
}

// Custom styles
const navbarStyle = {
  color: "#ffffff",
  padding: "24px",
  top: 0,
  left: 0,
  width: "100%",
  zIndex: "2",
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

export default GameNavbar;

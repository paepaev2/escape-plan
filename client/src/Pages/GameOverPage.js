import React from "react";
import { socket } from "../socket";
import HomepageLayout from "../components/Layout/HomepageLayout";
import { Col, Row } from "react-bootstrap";
import LobbyLayout from "../components/Layout/LobbyLayout";
import GameOver from "../assets/game/gameover.png";

function GameOverPage({ number, role, gameState, continueGame, restartGame }) {
  const score1 = gameState?.scores[0];
  const score2 = gameState?.scores[1];
  const winnerName = gameState.players[number-1].nickname;

  return (
    <LobbyLayout>
      <Col md={10} className="p-3 text-center white-text">
        <Row style={scoreSectionStyle}>
          <div style={{ flex: 1, textAlign: "left" }}>
            <h1>{gameState.players[0].nickname}</h1>
            <h1>{score1}</h1>
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <h1>{gameState.players[1].nickname}</h1>
            <h1>{score2}</h1>
          </div>
        </Row>
        <Row>
          <h3>
            {winnerName}, {role} won!
          </h3>
          </Row>
        <Row className="justify-content-center">
         <img src={GameOver} style={{ width: "60%"}}/> 
        </Row>
        <Row className="justify-content-center">
          <button onClick={continueGame} className="btn btn-success mt-2 mb-2" style={{ width: "40%"}}>
            Play Again
          </button>
          <div>OR</div>
          <button onClick={restartGame} className="btn btn-success mt-2" style={{ width: "40%"}}>
            Back to Home
          </button>
        </Row>
      </Col>
    </LobbyLayout>
  );
}

export default GameOverPage;

// Main game screen container styles
const gameScreenStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundColor: "black",
  color: "#00ff00",
  fontFamily: "'Press Start 2P', sans-serif",
};

// Score section styles
// Updated score section style to be fixed at the top and stretch across
const scoreSectionStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",      // Ensures vertical alignment
  padding: "20px",
  color: "#00ff00",          // Optional text color
  zIndex: 10,
};


// Player score styles (1P and 2P)
const playerScoreStyle = {
  textAlign: "center",
  color: "#00ff00",
};

// High score styles
const highScoreStyle = {
  textAlign: "center",
  flex: 1,
  color: "#009900",
};

// Game Over text styles
const gameOverStyle = {
  textAlign: "center",
  fontSize: "2rem",
  margin: "30px 0",
  color: "white",
  textShadow: "0px 0px 10px #00ff00",
  animation: "blink 1s infinite", // Note: This requires keyframes defined in CSS
};

// Credit text styles
const creditStyle = {
  textAlign: "center",
  marginTop: "20px",
  color: "#ffcc00",
};

// Scanline effect (if you want to create it programmatically)
const scanlineEffectStyle = {
  content: '""',
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  background:
    "repeating-linear-gradient(transparent 0px, rgba(0, 0, 0, 0.1) 2px, transparent 4px)",
  opacity: 0.1,
};

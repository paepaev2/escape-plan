import React from "react";
import { socket } from "../socket";
import HomepageLayout from "../components/Layout/HomepageLayout";
import { Col, Row } from "react-bootstrap";
import LobbyLayout from "../components/Layout/LobbyLayout";
import GameOver from "../assets/game/gameover.png";

function GameOverPage({ number, role, gameState, continueGame, restartGame }) {
  const score1 = gameState?.scores[0];
  const score2 = gameState?.scores[1];
  const winnerName = gameState.players[number - 1].nickname;

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
          <img src={GameOver} style={{ width: "60%" }} />
        </Row>
        <Row className="justify-content-center">
          <button
            onClick={continueGame}
            className="btn btn-success mt-2 mb-2"
            style={{ width: "40%", marginTop: "20px" }}
          >
            Play Again
          </button>
          <div>OR</div>
          <button
            onClick={restartGame}
            className="btn btn-success mt-2"
            style={{ width: "40%", marginTop: "20px" }}
          >
            Back to Home
          </button>
        </Row>
      </Col>
    </LobbyLayout>
  );
}

export default GameOverPage;

const scoreSectionStyle = {
  position: "sticky",
  top: 0,
  left: 0,
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px",
  color: "#00ff00",
};

import React from "react";
import { socket } from "./socket";

function GameOverPage({ number, role, gameState, continueGame, restartGame }) {
  const score1 = gameState?.scores[0];
  const score2 = gameState?.scores[1];

  return (
    <div
      className="text-center"
      style={{ backgroundColor: "#fff", padding: "20px" }}
    >
      <h1>Game Over!</h1>
      <p>
        Player {number}, {role} won!
      </p>
      <p>Player 1 score: {score1}</p>
      <p>Player 2 score: {score2}</p>
      <button onClick={continueGame} className="btn btn-success m-2">
        Play Again
      </button>
      <div>OR</div>
      <button onClick={restartGame} className="btn btn-success mt-2">
        Back to Home
      </button>
    </div>
  );
}

export default GameOverPage;

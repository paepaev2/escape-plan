import React from "react";
import { socket } from "./socket";

function GameOverPage({ number, role, gameState, continueGame, restartGame }) {
  const score1 = gameState?.scores[0];
  const score2 = gameState?.scores[1];
  const winnerName = gameState.players[number-1].nickname;

  return (
    <div
      className="text-center"
      style={{ backgroundColor: "#fff", padding: "20px" }}
    >
      <h1>Game Over!</h1>
      <p>
        {winnerName}, {role} won!
      </p>
      <p>{gameState.players[0].nickname} score: {score1}</p>
      <p>{gameState.players[1].nickname} score: {score2}</p>
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

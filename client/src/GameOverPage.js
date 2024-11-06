import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function GameOverPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { number, role, gameState } = location.state || {};

    // console.log('gameState in GameOverPage: ', gameState);

    const score1 = gameState?.scores[0];
    const score2 = gameState?.scores[1];

    const continueGame = () => {
        socket.emit('continueGame', gameState, number);
        navigate("/");
        // navigate("/", {state: {gameState, number}});
    };

    // Handler to restart the game
    const restartGame = () => {
        socket.emit('restartGame', { room: gameState.roomName }); // Specify the room to restart
        navigate("/game"); // Go back to the main game page with fresh start
    };

    return (
        <div className="text-center">
            <h1>Game Over!</h1>
            <p>Player {number}, {role} won!</p>
            <p>Player 1 score: {score1}</p>
            <p>Player 2 score: {score2}</p>
            <button onClick={continueGame} className="btn btn-success m-2">
                Play Again
            </button>
            <div>OR</div>
            <button
                onClick={restartGame}
                className="btn btn-success mt-2"
            >
                Back to Home
            </button>
        </div>
    );
}

export default GameOverPage;

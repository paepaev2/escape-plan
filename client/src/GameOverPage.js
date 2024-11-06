import React from 'react';
import { useLocation } from 'react-router-dom';

function GameOverPage() {
    const location = useLocation();
    const { number, role, gameState } = location.state || {};

    // console.log('gameState in GameOverPage: ', gameState);

    const score1 = gameState?.scores[0];
    const score2 = gameState?.scores[1];

    return (
        <div className="text-center">
            <h1>Game Over!</h1>
            <p>Player {number}, {role} won!</p>
            <p>Player 1 score: {score1}</p>
            <p>Player 2 score: {score2}</p>
        </div>
    );
}

export default GameOverPage;

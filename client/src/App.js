// App.js
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const BG_COLOUR = '#231f20';
const PRISONER_COLOUR = '#d96464'; //red
const WARDER_COLOUR = '#646dd9'; //blue
const TUNNEL_COLOUR = '#64d987'; //green
const OBSTACLE_COLOUR = '#d9cd64'; //yellow

function App() {
  const [gameCode, setGameCode] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerNumber, setPlayerNumber] = useState(null);
  const [playerRole, setPlayerRole] = useState(null);
  const [gameState, setGameState] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    socket.on('gameState', handleGameState);
    socket.on('gameOver', handleGameOver);
    socket.on('gameCode', handleGameCode);
    socket.on('unknownGame', handleUnknownGame);
    socket.on('tooManyPlayers', handleTooManyPlayers);
    socket.on('invalidMove', handleInvalidMove);
    socket.on('invalidTurn', handleInvalidTurn);

    return () => {
      socket.off('gameState');
      socket.off('gameOver');
      socket.off('gameCode');
      socket.off('unknownGame');
      socket.off('tooManyPlayers');
      socket.off('invalidMove');
      socket.off('invalidTurn');
    };
  }, []); 

  useEffect(() => {
    if (gameState && playerNumber !== null) {
      const role = gameState.players[playerNumber - 1]?.role;
      setPlayerRole(role);
    }
  }, [gameState, playerNumber]); // Run when gameState or playerNumber changes

  const createGame = () => {
    socket.emit('newGame');
    socket.on('gameCode', (code) => {
      setGameCode(code);
      setPlayerNumber(1);
      setIsGameStarted(true);
      });
  };

  const joinGame = (roomName) => {
    socket.emit('joinGame', roomName);
    socket.on('init', (playerNum) => {
      setPlayerNumber(playerNum);
      setIsGameStarted(true);
    });

    socket.on('unknownGame', handleUnknownGame);
    socket.on('tooManyPlayers', handleTooManyPlayers);
  };

  const handleGameState = (state) => {
    setGameState(state);
  };

  const handleGameOver = (data) => {
    const { winner } = data;

    let number;
    let role;
    if (winner === 1.1) {
      number = 1;
      role = 'prisoner';
    } else if (winner === 1.2) {
      number = 2;
      role = 'prisoner';
    } else if (winner === 2.1) {
      number = 1;
      role = 'warder';
    } else if (winner === 2.2) {
      number = 2;
      role = 'warder';
    } else {
      role = 'error';
    }

    alert(`Game Over! Player ${number}, ${role} wins!`);
    setIsGameStarted(false);
  };

  const handleGameCode = (code) => {
    setGameCode(code);
    setPlayerNumber(1);
    setIsGameStarted(true);
  };

  const handleUnknownGame = () => {
    alert('Unknown Game Code.');
    reset();
  };

  const handleTooManyPlayers = () => {
    alert('This game already has two players.');
    reset();
  };

  const handleInvalidMove = () => {
    alert('You cannot move to that way !-!');
  }

  const handleInvalidTurn = () => {
    alert('It\'s not your turn!, please wait for another player');
  }

  const reset = () => {
    setGameCode('');
    setPlayerNumber(null);
    setIsGameStarted(false);
    setGameState(null);
  };

  const handleKeyPress = (event) => {
    if (isGameStarted) {
      socket.emit('keydown', event.keyCode);
    }
  };

  useEffect(() => {
    if (gameState && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      paintGame(ctx, gameState);
    }
  }, [gameState]);

  const paintGame = (ctx, state) => {
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const size = canvasRef.current.width / state.gridsize;

    state.players.forEach((player) => {
      ctx.fillStyle = player.role === 'prisoner' ? PRISONER_COLOUR : WARDER_COLOUR;
      ctx.fillRect(player.x * size, player.y * size, size, size);
    });

    ctx.fillStyle = TUNNEL_COLOUR;
    ctx.fillRect(state.tunnel.x * size, state.tunnel.y * size, size, size);

    ctx.fillStyle = OBSTACLE_COLOUR;
    ctx.fillRect(state.obstacle.x * size, state.obstacle.y * size, size, size);
  };

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      {!isGameStarted ? (
        <div className="text-center">
          <h1>Escape Plan</h1>
          <button onClick={createGame} className="btn btn-success m-2">
            Create New Game
          </button>
          <div>OR</div>
          <input
            type="text"
            placeholder="Enter Game Code"
            onChange={(e) => setGameCode(e.target.value)}
            className="form-control mt-2"
          />
          <button
            onClick={() => joinGame(gameCode)}
            className="btn btn-success mt-2"
          >
            Join Game
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h1>Your game code is: {gameCode}</h1>
          <h2>You are Player {playerNumber}, {playerRole}</h2>
          <canvas
            ref={canvasRef}
            onKeyDown={handleKeyPress}
            tabIndex="0"
            width="600"
            height="600"
            style={{ border: '1px solid black' }}
          ></canvas>
        </div>
      )}
    </div>
  );
}

export default App;
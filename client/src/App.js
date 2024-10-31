// App.js
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const BG_COLOUR = '#231f20';
const PRISONER_COLOUR = '#d96464';
const WARDER_COLOUR = '#646dd9';
const OBSTACLE_COLOUR = '#d9cd64';

function App() {
  const [gameCode, setGameCode] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerNumber, setPlayerNumber] = useState(null);
  const [gameState, setGameState] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    socket.on('gameState', handleGameState);
    socket.on('gameOver', handleGameOver);
    socket.on('gameCode', handleGameCode);
    socket.on('unknownGame', handleUnknownGame);
    socket.on('tooManyPlayers', handleTooManyPlayers);

    return () => {
      socket.off('gameState');
      socket.off('gameOver');
      socket.off('gameCode');
      socket.off('unknownGame');
      socket.off('tooManyPlayers');
    };
  });

  const createGame = () => {
    socket.emit('newGame');
    // socket.on('gameCode', (code) => {
    //   console.log('pass here plssssss');
    //   console.log('gameCode from socket: ', code);
    //   setGameCode(code);
    //   setPlayerNumber(1);
    //   setIsGameStarted(true);
    // });
  };

  const joinGame = (code) => {
    socket.emit('joinGame', code);
    socket.on('init', (playerNum) => {
      setPlayerNumber(playerNum);
      setIsGameStarted(true);
    });

    socket.on('unknownGame', handleUnknownGame);
    socket.on('tooManyPlayers', handleTooManyPlayers);
  };

  const handleGameState = (state) => {
    setGameState(JSON.parse(state));
  };

  const handleGameOver = (data) => {
    const { winner } = JSON.parse(data);
    alert(`Game Over! Player ${winner} wins!`);
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
          <h2>You are Player {playerNumber}</h2>
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


// import React, { useState, useEffect, useRef } from 'react';
// import { io } from 'socket.io-client';

// // Connect to the Socket.IO server
// const socket = io('http://localhost:5000');

// function App() {
//   const [gameCode, setGameCode] = useState('');
//   const [isGameStarted, setIsGameStarted] = useState(false);
//   const [playerNumber, setPlayerNumber] = useState(null);
//   const [gameState, setGameState] = useState(null);
//   const canvasRef = useRef(null); // Use useRef to reference the canvas

//   useEffect(() => {
//     socket.on('gameState', (state) => {
//       setGameState(JSON.parse(state));
//     });

//     socket.on('gameOver', (data) => {
//       const { winner } = JSON.parse(data);
//       alert(`Game Over! Player ${winner} wins!`);
//       setIsGameStarted(false);
//     });

//     return () => {
//       socket.off('gameState');
//       socket.off('gameOver');
//     };
//   }, []);

//   useEffect(() => {
//     if (gameState && canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       // Call your painting function here
//       paintGame(ctx, gameState);
//     }
//   }, [gameState]); // Run this effect whenever gameState changes

//   const createGame = () => {
//     socket.emit('newGame');
//     socket.on('gameCode', (code) => {
//       console.log('passssss');
//       setGameCode(code);
//       setPlayerNumber(1);
//       setIsGameStarted(true);
//     });
//   };

//   const joinGame = (code) => {
//     socket.emit('joinGame', code);
//     socket.on('init', (playerNum) => {
//       setPlayerNumber(playerNum);
//       setIsGameStarted(true);
//     });

//     socket.on('unknownGame', () => alert('Unknown Game Code.'));
//     socket.on('tooManyPlayers', () => alert('This game already has two players.'));
//   };

//   const handleKeyPress = (event) => {
//     if (isGameStarted) {
//       socket.emit('keydown', event.keyCode);
//     }
//   };

//   // Function to paint the game state on the canvas
//   const paintGame = (ctx, state) => {
//     const BG_COLOUR = '#231f20';
//     const PRISONER_COLOUR = '#d96464';
//     const WARDER_COLOUR = '#646dd9';
//     const OBSTACLE_COLOUR = '#d9cd64';

//     ctx.fillStyle = BG_COLOUR;
//     ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

//     const gridsize = state.gridsize;
//     const size = canvasRef.current.width / gridsize;

//     let prisoner, warder;
//     if (state.players[0].role === 'prisoner') {
//       prisoner = state.players[0];
//       warder = state.players[1];
//     } else {
//       prisoner = state.players[1];
//       warder = state.players[0];
//     }
//     ctx.fillStyle = PRISONER_COLOUR;
//     ctx.fillRect(prisoner.x * size, prisoner.y * size, size, size);
//     ctx.fillStyle = WARDER_COLOUR;
//     ctx.fillRect(warder.x * size, warder.y * size, size, size);

//     const obstacle = state.obstacle;
//     ctx.fillStyle = OBSTACLE_COLOUR;
//     ctx.fillRect(obstacle.x * size, obstacle.y * size, size, size);
//   };

//   return (
//     <div className="container vh-100 d-flex align-items-center justify-content-center">
//       {!isGameStarted ? (
//         <div className="text-center">
//           <h1>Escape Plan</h1>
//           <button onClick={createGame} className="btn btn-success m-2" id="newGameButton">
//             Create New Game
//           </button>
//           <div>OR</div>
//           <input
//             type="text"
//             placeholder="Enter Game Code"
//             onChange={(e) => setGameCode(e.target.value)}
//             className="form-control mt-2"
//           />
//           <button
//             onClick={() => joinGame(gameCode)}
//             className="btn btn-success mt-2"
//             id="joinGameButton"
//           >
//             Join Game
//           </button>
//         </div>
//       ) : (
//         <div className="text-center">
//           <h1>Your game code is: {gameCode}</h1>
//           <h2>You are Player {playerNumber}</h2>
//           <canvas
//             ref={canvasRef}
//             onKeyDown={handleKeyPress}
//             tabIndex="0"
//             width="500"
//             height="500"
//             style={{ border: '1px solid black' }}
//           ></canvas>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

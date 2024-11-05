import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // If you're using Bootstrap for styling
import './App.css'; // Ensure global CSS is imported

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



// // import React from 'react';
// // import ReactDOM from 'react-dom/client';
// // import './index.css';
// // import App from './App';
// // import reportWebVitals from './reportWebVitals';
// import io from 'socket.io-client';

// const BG_COLOUR = '#231f20';
// const PRISONER_COLOUR = '#d96464';
// const WARDER_COLOUR = '#646dd9';
// const OBSTACLE_COLOUR = '#d9cd64';

// const socket = io('http://localhost:3000');
// socket.on('init', handleInit);
// socket.on('gameState', handleGameState);
// socket.on('gameOver', handleGameOver);
// socket.on('gameCode', handleGameCode);
// socket.on('unknownGame', handleUnknownGame);
// socket.on('tooManyPlayers', handleTooManyPlayers);

// const gameScreen = document.getElementById('gameScreen');
// const initialScreen = document.getElementById('initialScreen');
// const newGameBtn = document.getElementById('newGameButton');
// const joinGameBtn = document.getElementById('joinGameButton');
// const gameCodeInput = document.getElementById('gameCodeInput');
// const gameCodeDisplay = document.getElementById('gameCodeDisplay');

// newGameBtn.addEventListener('click', newGame);
// joinGameBtn.addEventListener('click', joinGame);

// function newGame() {
//   socket.emit('newGame');
//   init();
// }

// function joinGame() {
//   const code = gameCodeInput.value;
//   socket.emit('joinGame', code);
//   init();
// }

// let canvas, ctx;
// let playerNumber;
// let gameActive = false;

// function init() {
//   initialScreen.style.display = 'none';
//   gameScreen.style.display = 'block';

//   canvas = document.getElementById('canvas');
//   ctx = canvas.getContext('2d');

//   canvas.width = canvas.height = 600;

//   ctx.fillStyle = BG_COLOUR;
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   document.addEventListener('keydown', keydown);
//   gameActive = true;
// }

// function keydown(e) {
//   console.log(e.keyCode);
//   socket.emit('keydown', e.keyCode);
// }


// function paintGame(state) {
//   ctx.fillStyle = BG_COLOUR;
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   const gridsize = state.gridsize;
//   const size = canvas.width / gridsize;

//   let prisoner, warder;
//   if (state.players[0].role === 'prisoner') {
//     prisoner = state.players[0];
//     warder = state.players[1];
//   } else {
//     prisoner = state.players[1];
//     warder = state.players[0];
//   }
//   ctx.fillStyle = PRISONER_COLOUR;
//   ctx.fillRect(prisoner.x * size, prisoner.y * size, size, size);
//   ctx.fillStyle = WARDER_COLOUR;
//   ctx.fillRect(warder.x * size, warder.y * size, size, size);

//   const obstacle = state.obstacle;
//   ctx.fillStyle = OBSTACLE_COLOUR;
//   ctx.fillRect(obstacle.x * size, obstacle.y * size, size, size);
// }

// function handleInit(number) {
//   playerNumber = number;
// }

// function handleGameState(gameState) {
//   if (!gameActive) return;

//   gameState = JSON.parse(gameState);
//   paintGame(gameState);
// }

// function handleGameOver(data) {
//   if (!gameActive) return;

//   data  = JSON.parse(data);

//   if (data.winner === playerNumber) {
//     alert("You win!");
//   } else {
//     alert("You lose.");
//   }

//   gameActive = false;
// }

// function handleGameCode(gameCode) {
//   gameCodeDisplay.innerText = gameCode;
// }

// function handleUnknownGame() {
//   reset();
//   alert("Unknown Game Code");
// }

// function handleTooManyPlayers() {
//   reset();
//   alert("This game is already in progess");
// }

// function reset() {
//   playerNumber = null;
//   gameCodeInput.value = "";
//   gameCodeDisplay.innerText = "";
//   initialScreen.style.display = "block";
//   gameScreen.style.display = "none";
// }
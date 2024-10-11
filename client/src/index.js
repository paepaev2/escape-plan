// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
import io from 'socket.io-client';

const BG_COLOUR = '#231f20';
const PRISONER_COLOUR = '#c2c2c2';
const OBSTACLE_COLOUR = '#e66916';

let canvas, ctx;

const socket = io('http://localhost:3000');
socket.on('init', handleInit);
socket.on('gameState', handleGameState);

function init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  document.addEventListener('keydown', keydown);
}

function keydown(e) {
  console.log(e.keyCode);
  socket.emit('keydown', e.keyCode);
}

init();

function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  const prisoner = state.prisoner;
  ctx.fillStyle = PRISONER_COLOUR;
  ctx.fillRect(prisoner.x * size, prisoner.y * size, size, size);

  const obstacle = state.obstacle;
  ctx.fillStyle = OBSTACLE_COLOUR;
  ctx.fillRect(obstacle.x * size, obstacle.y * size, size, size);
}

function handleInit(msg) {
  console.log(msg);
}

function handleGameState(gameState) {
  gameState = JSON.parse(gameState);
  paintGame(gameState);
  // requestAnimationFrame(() => paintGame(gameState));
}
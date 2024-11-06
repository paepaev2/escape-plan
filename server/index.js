// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { gameLoop, validMove, getUpdatedPos, initGame } = require("./game");
const { makeid } = require("./utils");

// Set up the Express app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // React frontend
    methods: ["GET", "POST"],
  },
});

const state = {};
const clientRooms = {};
let scoreUpdated = false;
let connectedClients = 0;

// Socket.IO connection handling

io.on("connection", (client) => {
  console.log("A user connected:", client.id);
  connectedClients++;
  console.log("Connected clients:", connectedClients);

  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);
  client.on('keydown', handleKeydown);
  client.on('timeout' , handleTimeout);
  client.on('setScore', handleSetScore);
  client.on('disconnect', () => {
    console.log('Client disconnected:', client.id);
    connectedClients--;
    console.log("Connected clients:", connectedClients);
  });

  function handleTimeout(lostNum) {
    let winner;
    const roomName = clientRooms[client.id];
    if (state[roomName].state.players[lostNum-1].role === 'prisoner') {
      winner = lostNum === 1 ? 2.2 : 2.1;
    } else {
      winner = lostNum === 1 ? 1.2 : 1.1;
    }
    
    io.sockets.in(roomName).emit('gameOver', { winner });
  }

  function handleSetScore(lostNum) {
    if (!scoreUpdated) {
      const roomName = clientRooms[client.id];
      state[roomName].scores[lostNum-1] += 1;

      const finalGameState = state[roomName];
      console.log(finalGameState); 
      io.sockets.in(roomName).emit('gameState', finalGameState);
      // io.sockets.in(roomName).emit('result', finalGameState);
    }

    scoreUpdated = true;
  }

  function handleNewGame() {
    const roomName = makeid(5);
    // console.log(`New game created: ${roomName}`);

    clientRooms[client.id] = roomName;
    state[roomName] = initGame();

    // console.log(state[roomName]);

    client.join(roomName);
    client.number = 1;
    client.emit("gameCode", roomName);
    client.emit("gameState", state[roomName]);
    client.emit("init", 1);

    const room = io.sockets.adapter.rooms.get(roomName);

    // console.log(`${client.id} joined room: ${roomName}, Current clients: ${room ? room.size : 0}`);
  }

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    const numClients = room ? room.size : 0;

    // console.log(`Trying to join room: ${roomName}, Current clients: ${numClients}`);

    if (numClients === 0) {
      client.emit("unknownGame");
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
    } else {
      clientRooms[client.id] = roomName;
      client.join(roomName);
      client.number = 2;
      client.emit('init', 2); // Player 2
      client.to(roomName).emit('bothPlayersJoined');
      startGameInterval(roomName);
    }
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) return;

    const player = state[roomName].players[client.number - 1];
    const move = getUpdatedPos(parseInt(keyCode));
    const turn = state[roomName].turn;

    if (move) {
      if (turn === client.number) {
        if (validMove(state[roomName], client.number, move)) {
          player.x += move.x;
          player.y += move.y;
          if (turn === 1) state[roomName].turn = 2;
          else state[roomName].turn = 1;

          client.to(roomName).emit('turnCompleted');
        } else {
          io.to(client.id).emit("invalidMove");
        }
      } else {
        io.to(client.id).emit("invalidTurn");
      }
    }
  }
});

function startGameInterval(roomName) {
  scoreUpdated = false;
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if (winner) {
      io.sockets.in(roomName).emit("gameOver", { winner });
      clearInterval(intervalId);
      // delete state[roomName];
    } else {
      io.sockets.in(roomName).emit("gameState", state[roomName]);
    }
  }, 1000 / 60);
}

const PORT = 8000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

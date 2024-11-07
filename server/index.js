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


// Serve the admin panel page
const path = require("path");
app.use(express.static(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
// let adminClientId = null;


let clients = {};
function updateAdminClientCount() {
  io.emit('clientCount', {
      count: connectedClients,
      clients: Object.keys(clients)
  });
}

// Socket.IO connection handling
io.on("connection", (client) => {
  // // Assign the first connected client as admin
  // if (!adminClientId) {
  //   adminClientId = client.id;
  //   client.emit("isAdmin", true); // Notify the client they are admin
  // } else {
  //   client.emit("isAdmin", false); // Notify others they are not admin
  // }

  if (client.handshake.headers.origin === "http://localhost:3000") {
    // console.log("A user connected:", client.id);
    connectedClients++;
    clients[client.id] = client; // Store the client's socket ID
    console.log('Client connected: ', client.id);
    console.log("Connected clients:", connectedClients);

    // Emit updated client count and online clients to the admin
    updateAdminClientCount();

    // Send the list of online clients to the new client
    client.emit('onlineClients', Object.keys(clients));

    // // Emit current connected client count to the admin
    // io.to(adminClientId).emit("clientCount", connectedClients);
  }

  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);
  client.on("keydown", handleKeydown);
  client.on("timeout", handleTimeout);
  client.on("setScore", handleSetScore);
  client.on("continueGame", handleContinueGame);
  client.on("nickname", handleNickname);
  client.on("disconnect", () => {
    if (client.handshake.headers.origin === "http://localhost:3000") {
      // console.log("Client disconnected:", client.id);
      connectedClients--;
      delete clients[client.id]; // Remove the client from the list
      console.log('Client disconnected: ', client.id);
      console.log("Connected clients:", connectedClients);
      // io.to(adminClientId).emit("clientCount", connectedClients);

      // Update the client count and list of online clients
      updateAdminClientCount();

      // // Reset admin if the current admin disconnects
      // if (client.id === adminClientId) {
      //   adminClientId = null;
      // }
    }
  });
  client.on("adminResetGame", () => {
    console.log('Resetting game and scores');
    io.emit('gameReset'); // Broadcast a reset event to all clients

    // console.log('reset button works, admin is ', adminClientId);
    // console.log('client is ', client.id);
    // if (client.id === adminClientId) { // Ensure only admin can reset
    //   Object.keys(state).forEach(roomName => {
    //     state[roomName] = initGame(); // Reset game state
    //   });
    //   io.emit("resetGame"); // Notify all clients
    //   console.log("Game reset by admin.");
    // }
  });

  function handleNickname(name, number) {
    const roomName = clientRooms[client.id];
    // console.log("state nick: ", state[roomName].players, name, number);
    state[roomName].players[number-1].nickname = name;
    // console.log('test nickname= ', state[roomName].players[number-1]);

    io.sockets.in(roomName).emit("gameState", state[roomName]);
  }

  function handleTimeout(lostNum) {
    let winner;
    const roomName = clientRooms[client.id];
    if (!roomName) return;

    if (state[roomName].players[lostNum - 1].role === "prisoner") {
      winner = lostNum === 1 ? 2.2 : 2.1;
    } else {
      winner = lostNum === 1 ? 1.2 : 1.1;
    }

    io.sockets.in(roomName).emit("gameOver", { winner, win_type: "timeout" });
  }

  function handleSetScore(lostNum) {
    if (!scoreUpdated) {
      const roomName = clientRooms[client.id];
      state[roomName].scores[lostNum - 1] += 1;

      const finalGameState = state[roomName];
      console.log(finalGameState);
      io.sockets.in(roomName).emit("gameState", finalGameState);
    }

    scoreUpdated = true;
  }

  function handleNewGame() {
    const roomName = makeid(5);

    clientRooms[client.id] = roomName;
    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit("gameCode", roomName);
    client.emit("gameState", state[roomName]);
    client.emit("init", 1);
  }

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    const numClients = room ? room.size : 0;

    if (numClients === 0) {
      client.emit("unknownGame");
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
    } else {
      clientRooms[client.id] = roomName;
      client.join(roomName);
      client.number = 2;
      client.emit("init", 2); // Player 2
      client.to(roomName).emit("bothPlayersJoined");
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
          state[roomName].turnStartTime = Date.now();

          client.to(roomName).emit("turnCompleted");
        } else {
          io.to(client.id).emit("invalidMove");
        }
      } else {
        io.to(client.id).emit("invalidTurn");
      }
    }
  }

  function handleContinueGame(gameState, winner) {
    const roomName = clientRooms[client.id];
    if (!roomName) return;

    // Reset the game state while keeping the scores
    const newGameState = initGame();
    newGameState.players[0].nickname = gameState.players[0].nickname;
    newGameState.players[1].nickname = gameState.players[1].nickname;
    newGameState.scores = gameState.scores; // Keep the same scores
    state[roomName] = newGameState;
    state[roomName].turn = winner;
    state[roomName].turnStartTime = Date.now();
    state[roomName].timeRemaining = 10000; // Reset timeRemaining
    io.sockets.in(roomName).emit("gameState", state[roomName]);
    startGameInterval(roomName);
  }
});

function startGameInterval(roomName) {
  state[roomName].turnStartTime = Date.now();
  scoreUpdated = false;
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if (winner) {
      io.sockets.in(roomName).emit("gameOver", { winner });
      clearInterval(intervalId);
    } else {
      const timeElapsed = Date.now() - state[roomName].turnStartTime;
      const timeRemaining = 10000 - timeElapsed;
      if (timeRemaining <= 0) {
        // Current player has timed out
        const lostNum = state[roomName].turn; // Current player's number
        let winner;
        if (state[roomName].players[lostNum - 1].role === "prisoner") {
          winner = lostNum === 1 ? 2.2 : 2.1;
        } else {
          winner = lostNum === 1 ? 1.2 : 1.1;
        }
        io.sockets
          .in(roomName)
          .emit("gameOver", { winner, win_type: "timeout" });
        clearInterval(intervalId);
      } else {
        // Update timeRemaining in state
        state[roomName].timeRemaining = timeRemaining;
        io.sockets.in(roomName).emit("gameState", state[roomName]);
      }
    }
  }, 1000 / 60);
}

const PORT = 8000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

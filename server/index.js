const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const { gameLoop, validMove, getUpdatedPos, initGame } = require("./game");
const { makeid } = require("./utils");
require("dotenv").config();

// Set up the Express app and server
const app = express();
const server = http.createServer(app);
// const server = app.listen(8000, '0.0.0.0', () => {
//   console.log('Server is running on port 8000');
// });

// Use environment variables for IP and PORT
const PORT = process.env.SERVER_PORT || 8000;
const IP = process.env.SERVER_IP || "0.0.0.0";

// const server = app.listen(PORT, IP, () => {
//   console.log(`Server is running on ${IP}:${PORT}`);
// });

app.get("/config", (req, res) => {
  res.json({
    serverIp: process.env.SERVER_IP || "0.0.0.0",
    serverPort: process.env.SERVER_PORT,
  });
});

// const io = socketIo(server, {
//   cors: {
//     // origin: "http://localhost:3000", // React frontend
//     origin: "http://192.168.56.1:3000",
//     methods: ["GET", "POST"],
//   },
// });
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
  },
});

server.listen(PORT, IP, () => {
  console.log(`Server is running on port ${PORT} ${IP}`);
});

const state = {};
const clientRooms = {};
let scoreUpdated = false;
app.use(express.static(path.join(__dirname, "public")));

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Client tracking
let clients = {}; // key: socket id, value: client type ('game' or 'admin')

function updateAdminClientCount() {
  const gameClientIds = Object.keys(clients).filter(
    (id) => clients[id] === "game"
  );
  const adminClients = Object.keys(clients).filter(
    (id) => clients[id] === "admin"
  );

  adminClients.forEach((adminId) => {
    io.to(adminId).emit("clientCount", {
      count: gameClientIds.length,
      clients: gameClientIds,
    });
  });
}

// Socket.IO connection handling
io.on("connection", (client) => {
  client.on("registerClient", (data) => {
    const clientType = data.type;
    clients[client.id] = clientType;
    console.log("Client registered:", client.id, "Type:", clientType);

    if (clientType === "game") {
      updateAdminClientCount();
    } else if (clientType === "admin") {
      // Send the current client count to the new admin client
      const gameClientIds = Object.keys(clients).filter(
        (id) => clients[id] === "game"
      );
      client.emit("clientCount", {
        count: gameClientIds.length,
        clients: gameClientIds,
      });
    }
  });

  client.on("disconnect", () => {
    const clientType = clients[client.id];
    delete clients[client.id]; // Remove the client from the list
    console.log("Client disconnected:", client.id, "Type:", clientType);

    if (clientType === "game") {
      updateAdminClientCount();
    }
  });

  // Game event handlers
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);
  client.on("keydown", handleKeydown);
  client.on("timeout", handleTimeout);
  client.on("setScore", handleSetScore);
  client.on("continueGame", handleContinueGame);
  client.on("restartGame", handleRestartGame);
  client.on("nickname", handleNickname);

  // Admin event handler
  client.on("adminResetGame", () => {
    console.log("Resetting game and scores");
    io.emit("gameReset"); // Broadcast a reset event to all clients
  });

  function handleRestartGame() {
    const roomName = clientRooms[client.id];
    io.sockets.in(roomName).emit("gameReset");
    delete clientRooms[roomName];
  }

  function handleNickname(name, number) {
    const roomName = clientRooms[client.id];
    if (!state[roomName]) return;
    state[roomName].players[number - 1].nickname = name;
    io.sockets.in(roomName).emit("gameState", state[roomName]);
  }

  function handleTimeout(lostNum) {
    const roomName = clientRooms[client.id];
    if (!roomName) return;

    let winner;
    if (state[roomName].players[lostNum - 1].role === "prisoner") {
      winner = lostNum === 1 ? 2.2 : 2.1;
    } else {
      winner = lostNum === 1 ? 1.2 : 1.1;
    }

    io.sockets.in(roomName).emit("gameOver", { winner, win_type: "timeout" });
  }

  function handleSetScore(winnerNum) {
    if (!scoreUpdated) {
      const roomName = clientRooms[client.id];
      if (!state[roomName]) return;
      state[roomName].scores[winnerNum - 1] += 1;
      io.sockets.in(roomName).emit("gameState", state[roomName]);
    }
    scoreUpdated = true;
  }

  function handleNewGame() {
    const roomName = makeid(5);
    console.log(roomName);
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

          // Check for win condition immediately after updating position
          const winner = gameLoop(state[roomName]);
          if (winner) {
            console.log("Game over! Winner:", winner);
            io.sockets.in(roomName).emit("gameOver", { winner });
            return; // Exit the function to prevent further execution
          }

          state[roomName].turn = turn === 1 ? 2 : 1;
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
      console.log("Game over! Winner:", winner);
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

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { createGameState, gameLoop, validMove, randomPos, getUpdatedPos } = require('./game');

//***
// Set up the Express app and HTTP server
const app = express();
const server = http.createServer(app);

app.use(cors());

// Initialize Socket.IO with the HTTP server
const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",  // The address of your React app
      methods: ["GET", "POST"],
    },
});

io.on('connection', client => {
    const state = createGameState();
    randomPos(state);

    client.on('keydown', handleKeydown);

    function handleKeydown(keyCode) {
        try {
            keyCode = parseInt(keyCode);
        } catch (e) {
            console.error(e);
            return;
        }

        const move = getUpdatedPos(keyCode);
        if (move && validMove(state, move)) {
            state.prisoner.x += move.x;
            state.prisoner.y += move.y;
            console.log(state);
        }
    }

    startGameInterval(client, state);
})

function startGameInterval(client, state) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state);

        if (!winner) {
            client.emit('gameState', JSON.stringify(state));
        } else {
            client.emit('gameOver');
            clearInterval(intervalId);
        }
    });
}


// Listen for new connections
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.emit('init', {data: 'hello world'});
  
  // Send a message from server to client
  socket.emit('welcome', 'Hello from the server!');

  // Handle messages from client
  socket.on('message', (msg) => {
    console.log('Message from client:', msg);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server on port 5000
server.listen(5000, () => {
  console.log('Socket.IO server running on port 5000');
});


io.listen(3000);
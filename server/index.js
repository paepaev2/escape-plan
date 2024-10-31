// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { createGameState, gameLoop, validMove, getUpdatedPos, initGame } = require('./game');
const { makeid } = require('./utils');

// Set up the Express app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // React frontend
    methods: ['GET', 'POST'],
  },
});

const state = {};
const clientRooms = {};

// Socket.IO connection handling
io.on('connection', (client) => {
  console.log('A user connected:', client.id);

  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);
  client.on('keydown', handleKeydown);
  client.on('disconnect', () => {
    console.log('Client disconnected:', client.id);
  });

  function handleNewGame() {
    const roomName = makeid(5);
    console.log(`New game created: ${roomName}`);

    clientRooms[client.id] = roomName;
    state[roomName] = initGame();

    client.emit('gameCode', roomName);
    
    console.log(state[roomName]);

    // client.join(roomName, (err) => { // Callback after joining
    //   if (err) {
    //     console.error('Error joining room:', err);
    //     return;
    //   }

    //   const room = io.sockets.adapter.rooms[roomName];
    //   console.log(`${client.id} joined room: ${roomName}, Current clients: ${room ? room.size : 0}`);

    //   client.emit('gameCode', roomName);
    //   client.emit('init', 1); // Player 1
    // });
    
    client.join(roomName);
    client.number = 1;

    // Check if the client is already in the room
    const room = io.sockets.adapter.rooms[roomName];
    const isAlreadyInRoom = room && room.sockets[client.id];

    if (isAlreadyInRoom) {
        console.log('player 1 joined');
    } else {
      console.log('player 1 where');
    }

    client.emit('init', 1); // Player 1
    
    console.log(`${client.id} joined room: ${roomName}, Current clients: ${room ? room.size : 0}`);
  }

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];
    const numClients = room ? room.size : 0;

    console.log(`Trying to join room: ${roomName}, Current clients: ${numClients}`);

    if (numClients === 0) {
      client.emit('unknownGame');
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
    } else {
      clientRooms[client.id] = roomName;
      client.join(roomName);
      client.emit('init', 2); // Player 2
      startGameInterval(roomName);
    }
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) return;

    const player = state[roomName].players[client.number - 1];
    const move = getUpdatedPos(parseInt(keyCode));

    if (move && validMove(player, move)) {
      player.x += move.x;
      player.y += move.y;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if (winner) {
      io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }));
      clearInterval(intervalId);
      delete state[roomName];
    } else {
      io.sockets.in(roomName).emit('gameState', JSON.stringify(state[roomName]));
    }
  }, 1000 / 60);
}

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));




// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');
// const { createGameState, gameLoop, validMove, getUpdatedPos, initGame } = require('./game');
// const { makeid } = require('./utils');

// // Create an Express app and HTTP server
// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: 'http://localhost:3000', // React client
//     methods: ['GET', 'POST'],
//   },
// });

// const state = {};
// const clientRooms = {};
// let connectedClients = {}; // Track online clients

// // Listen for connections
// io.on('connection', (socket) => {
//   console.log(`Client connected: ${socket.id}`);

//   // Store the connected client
//   connectedClients[socket.id] = { id: socket.id };
  
//   // Notify the new client about other connected clients
//   socket.emit('existingClients', connectedClients);

//   // Broadcast the new client to others
//   socket.broadcast.emit('newClient', { id: socket.id });

//   // Handle client disconnection
//   socket.on('disconnect', () => {
//     console.log(`Client disconnected: ${socket.id}`);
//     delete connectedClients[socket.id];
//     socket.broadcast.emit('clientDisconnected', { id: socket.id });
//   });

//   // Handle new game creation
//   socket.on('newGame', handleNewGame);

//   // Handle joining an existing game
//   socket.on('joinGame', handleJoinGame);

//   // Handle player movements
//   socket.on('keydown', handleKeydown);

//   function handleNewGame() {
//     let roomName = makeid(5);
//     clientRooms[socket.id] = roomName;
//     state[roomName] = initGame();

//     socket.join(roomName);
//     socket.emit('gameCode', roomName);
//     socket.number = 1; // Assign player number 1
//     socket.emit('init', 1);
//   }

//   function handleJoinGame(roomName) {
//     const room = io.sockets.adapter.rooms[roomName];

//     if (!room || room.length === 0) {
//       socket.emit('unknownGame');
//       return;
//     } else if (room.length > 1) {
//       socket.emit('tooManyPlayers');
//       return;
//     }

//     clientRooms[socket.id] = roomName;
//     socket.join(roomName);
//     socket.number = 2; // Assign player number 2
//     socket.emit('init', 2);

//     startGameInterval(roomName);
//   }

//   function handleKeydown(keyCode) {
//     const roomName = clientRooms[socket.id];

//     if (!roomName) return;

//     try {
//       keyCode = parseInt(keyCode);
//     } catch (e) {
//       console.error(e);
//       return;
//     }

//     const move = getUpdatedPos(keyCode);
//     if (move && validMove(state[roomName].players[socket.number - 1], move)) {
//       state[roomName].players[socket.number - 1].x += move.x;
//       state[roomName].players[socket.number - 1].y += move.y;
//       console.log(state[roomName].players[socket.number - 1]);
//     }
//   }
// });

// function startGameInterval(roomName) {
//   const intervalId = setInterval(() => {
//     if (!state[roomName]) {
//       clearInterval(intervalId);
//       return;
//     }

//     const winner = gameLoop(state[roomName]);
//     if (!winner) {
//       emitGameState(roomName, state[roomName]);
//     } else {
//       emitGameOver(roomName, winner);
//       state[roomName] = null;
//       clearInterval(intervalId);
//     }
//   }, 1000 / 60);
// }

// function emitGameState(roomName, state) {
//   io.sockets.in(roomName).emit('gameState', JSON.stringify(state));
// }

// function emitGameOver(roomName, winner) {
//   io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }));
// }

// // Start the server on port 5000
// const PORT = 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');
// const { createGameState, gameLoop, validMove, randomPos, getUpdatedPos, initGame } = require('./game');
// const { makeid } = require('./utils');

// //***
// // Set up the Express app and HTTP server
// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: 'http://localhost:3000', // React client
//     methods: ['GET', 'POST'],
//   },
// });

// const state = {};
// const clientRooms = {}; 

// io.on('connection', client => {

//     client.on('keydown', handleKeydown);
//     client.on('newGame', handleNewGame);
//     client.on('joinGame', handleJoinGame);

//     function handleJoinGame(roomName) {
//       const room = io.sockets.adapter.rooms[roomName];

//       let allUsers;
//       if (room) {
//         allUsers = room.sockets;
//       }

//       let numClients = 0;
//       if (allUsers) {
//         numClients = Object.keys(allUsers).length;
//       }

//       if (numClients === 0) {
//         client.emit('unknownGame');
//         return;
//       } else if (numClients > 1) {
//         client.emit('tooManyPlayers');
//         return;
//       }

//       clientRooms[client.id] = roomName;

//       client.join(roomName);
//       client.number = 2;
//       client.emit('init', 2);

//       startGameInterval(roomName);
//     }

//     function handleNewGame() {
//       let roomName = makeid(5);
//       clientRooms[client.id] = roomName;
//       client.emit('gameCode', roomName);

//       state[roomName] = initGame();

//       client.join(roomName);
//       client.number = 1;
//       client.emit('init', 1);
//     }

//     function handleKeydown(keyCode) {
//       const roomName = clientRooms[client.id];

//       if (!roomName) {
//         return;
//       }

//         try {
//             keyCode = parseInt(keyCode);
//         } catch (e) {
//             console.error(e);
//             return;
//         }

//         const move = getUpdatedPos(keyCode);
//         if (move && validMove(state[roomName].players[client.number - 1], move)) {
//             state[roomName].players[client.number - 1].x += move.x;
//             state[roomName].players[client.number - 1].y += move.y;
//             console.log(state[roomName].players[client.number - 1]);
//         }
//     }
// })

// function startGameInterval(roomName) {
//     const intervalId = setInterval(() => {
//       if (!state[roomName]) {
//         clearInterval(intervalId);
//         return;
//       }

//       const winner = gameLoop(state[roomName]);
//       if (!winner) {
//         emitGameState(roomName, state[roomName]);
//       } else {
//           emitGameOver(roomName, winner);
//           state[roomName] = null;
//           clearInterval(intervalId);
//       }
//     }, 1000 / 60);
// }

// function emitGameState(roomName, state) {
//   io.sockets.in(roomName)
//     .emit('gameState', JSON.stringify(state));
// }

// function emitGameOver(roomName, winner) {
//   io.sockets.in(roomName)
//     .emit('gameOver', JSON.stringify({ winner }));
// }

// //***
// let connectedClients = {};
// // Listen for new connections
// io.on('connection', (socket) => {
//   console.log('A user connected');
  
//   // Add the new client to the list
//   connectedClients[socket.id] = { id: socket.id };
  
//   // Notify the new client about the existing clients
//   socket.emit('existingClients', connectedClients);

//   // Notify other clients about the new client
//   socket.broadcast.emit('newClient', { id: socket.id });

//   // Handle client disconnect
//   socket.on('disconnect', () => {
//     console.log(`Client disconnected: ${socket.id}`);
//     delete connectedClients[socket.id];

//     // Notify remaining clients about the disconnection
//     socket.broadcast.emit('clientDisconnected', { id: socket.id });
//   });
// });

// // // Start server on port 5000
// // server.listen(5000, () => {
// //   console.log('Socket.IO server running on port 5000');
// // });

// // io.listen(3000);

// // Server listens on port 3000
// const PORT = 3000;
// server.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// io.listen(process.env.PORT || 3000);



// // copied code ***
// const io = require('socket.io')();
// const { initGame, gameLoop, getUpdatedPos, validMove } = require('./game');
// const { makeid } = require('./utils');

// const state = {};
// const clientRooms = {};

// io.on('connection', client => {

//   client.on('keydown', handleKeydown);
//   client.on('newGame', handleNewGame);
//   client.on('joinGame', handleJoinGame);

//   function handleJoinGame(roomName) {
//     const room = io.sockets.adapter.rooms[roomName];

//     let allUsers;
//     if (room) {
//       allUsers = room.sockets;
//     }

//     let numClients = 0;
//     if (allUsers) {
//       numClients = Object.keys(allUsers).length;
//     }

//     if (numClients === 0) {
//       client.emit('unknownCode');
//       return;
//     } else if (numClients > 1) {
//       client.emit('tooManyPlayers');
//       return;
//     }

//     clientRooms[client.id] = roomName;

//     client.join(roomName);
//     client.number = 2;
//     client.emit('init', 2);
    
//     startGameInterval(roomName);
//   }

//   function handleNewGame() {
//     let roomName = makeid(5);
//     clientRooms[client.id] = roomName;
//     client.emit('gameCode', roomName);

//     state[roomName] = initGame();

//     client.join(roomName);
//     client.number = 1;
//     client.emit('init', 1);
//   }

//   function handleKeydown(keyCode) {
//     const roomName = clientRooms[client.id];
//     if (!roomName) {
//       return;
//     }
//     try {
//       keyCode = parseInt(keyCode);
//     } catch(e) {
//       console.error(e);
//       return;
//     }

//     const move = getUpdatedPos(keyCode);
        
//     if (move && validMove(state[roomName].players[client.number - 1], move)) {
//       state[roomName].players[client.number - 1].x += move.x;
//       state[roomName].players[client.number - 1].y += move.y;
//       console.log(state[roomName].players[client.number - 1]);
//     }
//   }
// });

// function startGameInterval(roomName) {
//   const intervalId = setInterval(() => {
//     const winner = gameLoop(state[roomName]);
    
//     if (!winner) {
//       emitGameState(roomName, state[roomName])
//     } else {
//       emitGameOver(roomName, winner);
//       state[roomName] = null;
//       clearInterval(intervalId);
//     }
//   });
// }

// function emitGameState(room, gameState) {
//   // Send this event to everyone in the room.
//   io.sockets.in(room)
//     .emit('gameState', JSON.stringify(gameState));
// }

// function emitGameOver(room, winner) {
//   io.sockets.in(room)
//     .emit('gameOver', JSON.stringify({ winner }));
// }

// io.listen(process.env.PORT || 3000);



// // chat gpt****
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');
// const { createGameState, gameLoop, validMove, randomPos, getUpdatedPos, initGame } = require('./game');
// const { makeid } = require('./utils');

// const state = {};
// const clientRooms = {};
// const connectedClients = {};

// const app = express();
// const server = http.createServer(app);

// // CORS configuration
// app.use(cors({
//   origin: 'http://localhost:3000',
// }));

// const io = socketIo(server, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   },
// });

// io.on('connection', (client) => {
//   console.log(`A user connected: ${client.id}`);
//   connectedClients[client.id] = { id: client.id };

//   client.on('keydown', handleKeydown);
//   client.on('newGame', handleNewGame);
//   client.on('joinGame', handleJoinGame);

//   client.emit('existingClients', connectedClients);
//   client.broadcast.emit('newClient', { id: client.id });

//   client.on('disconnect', () => {
//     console.log(`Client disconnected: ${client.id}`);
//     const roomName = clientRooms[client.id];
//     if (roomName) delete state[roomName]; 
//     delete clientRooms[client.id];
//     delete connectedClients[client.id];
//     client.broadcast.emit('clientDisconnected', { id: client.id });
//   });

//   function handleJoinGame(roomName) {
//     const room = io.sockets.adapter.rooms.get(roomName);
//     const numClients = room ? room.size : 0;

//     if (numClients === 0) {
//       client.emit('unknownGame');
//       return;
//     } else if (numClients > 1) {
//       client.emit('tooManyPlayers');
//       return;
//     }

//     clientRooms[client.id] = roomName;
//     client.join(roomName);
//     client.number = 2;
//     client.emit('init', 2);

//     startGameInterval(roomName);
//   }

//   function handleNewGame() {
//     let roomName = makeid(5);
//     clientRooms[client.id] = roomName;
//     client.emit('gameCode', roomName);

//     state[roomName] = initGame();
//     client.join(roomName);
//     client.number = 1;
//     client.emit('init', 1);
//   }

//   function handleKeydown(keyCode) {
//     const roomName = clientRooms[client.id];
//     if (!roomName) return;

//     try {
//       keyCode = parseInt(keyCode);
//     } catch (e) {
//       console.error(e);
//       return;
//     }

//     const move = getUpdatedPos(keyCode);
//     if (move && validMove(state[roomName].players[client.number - 1], move)) {
//       state[roomName].players[client.number - 1].x += move.x;
//       state[roomName].players[client.number - 1].y += move.y;
//       console.log(state[roomName].players[client.number - 1]);
//     }
//   }
// });

// function startGameInterval(roomName) {
//   const intervalId = setInterval(() => {
//     if (!state[roomName]) {
//       clearInterval(intervalId);
//       return;
//     }

//     const winner = gameLoop(state[roomName]);
//     if (!winner) {
//       emitGameState(roomName, state[roomName]);
//     } else {
//       emitGameOver(roomName, winner);
//       state[roomName] = null;
//       clearInterval(intervalId);
//     }
//   }, 1000 / 60); // 60 FPS
// }

// function emitGameState(roomName, state) {
//   io.sockets.in(roomName).emit('gameState', JSON.stringify(state));
// }

// function emitGameOver(roomName, winner) {
//   io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }));
// }

// // Start the server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

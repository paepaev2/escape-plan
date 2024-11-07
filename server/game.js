const { GRID_SIZE } = require("./constant");

module.exports = {
  // createGameState,
  initGame,
  gameLoop,
  validMove,
  randomPos,
  getUpdatedPos,
};

function initGame() {
  const state = createGameState();
  randomPos(state);
  const prisonerImages = [
    "/images/prisoner.png",
    "/images/prisoner1.png",
    "/images/prisoner2.png",
    "/images/prisoner3.png",
    "/images/prisoner4.png",
  ];
  const randomPrisonerIndex = Math.floor(Math.random() * prisonerImages.length);
  state.prisonerImagePath = prisonerImages[randomPrisonerIndex];
  const warderImages = [
    "/images/warder.png",
    "/images/warder1.png",
    "/images/warder2.png",
  ];
  const randomWarderIndex = Math.floor(Math.random() * warderImages.length);
  state.warderImagePath = warderImages[randomWarderIndex];

  const tileSets = [
    { base: "/images/base-tile.png", obstacle: "/images/obstacle-tile.png" },
    { base: "/images/base-tile1.png", obstacle: "/images/obstacle-tile1.png" },
    { base: "/images/base-tile2.png", obstacle: "/images/obstacle-tile2.png" },
    { base: "/images/base-tile3.png", obstacle: "/images/obstacle-tile3.png" },
  ];

  const randomTileSetIndex = Math.floor(Math.random() * tileSets.length);
  const selectedTileSet = tileSets[randomTileSetIndex];

  state.baseTileImagePath = selectedTileSet.base;
  state.obstacleTileImagePath = selectedTileSet.obstacle;
  return state;
}

function createGameState() {
  return {
    players: [{}, {}],
    tunnel: {},
    obstacle: {},
    turn: {},
    scores: [0, 0],

    gridsize: GRID_SIZE,
  };
}

function gameLoop(state) {
  if (!state) return;

  let prisoner;
  let warder;

  if (state.players[0].role === "prisoner") {
    prisoner = state.players[0];
    warder = state.players[1];
  } else {
    prisoner = state.players[1];
    warder = state.players[0];
  }

  if (prisoner.x == state.tunnel.x && prisoner.y == state.tunnel.y) {
    if (state.players[0].role === "prisoner")
      return 1.1; //player1, prisoner wins
    else return 1.2; //player2, prisoner wins
  }

  if (prisoner.x == warder.x && prisoner.y == warder.y) {
    if (state.players[0].role === "warder") return 2.1; //player1, warder wins
    else return 2.2; //player2, warder wins
  }

  return false;
}

function validMove(state, index, move) {
  // console.log(state);
  const player = state.players[index - 1];
  const tunnel = state.tunnel;
  const obstacles = state.obstacles;
  const gridsize = state.gridsize;

  let x = player.x + move.x;
  let y = player.y + move.y;

  // Check boundaries
  if (x < 0 || x >= gridsize || y < 0 || y >= gridsize) {
    return false;
  }

  // Check for obstacles
  let isObstacle = false;
  if (obstacles && obstacles.length > 0) {
    isObstacle = obstacles.some(
      (obstacle) => obstacle.x === x && obstacle.y === y
    );
  } else if (state.obstacle) {
    isObstacle = state.obstacle.x === x && state.obstacle.y === y;
  }

  if (isObstacle) {
    return false;
  }

  // Warden cannot move into the tunnel
  if (player.role === "warder" && tunnel.x === x && tunnel.y === y) {
    return false;
  }

  return true;
}

function randomPos(state) {
  const maps = [
    [
      [0, 0, 0, 0, "h"],
      ["p", 1, 0, 0, 0],
      [1, 1, 1, 0, 0],
      [0, 0, 1, 0, "w"],
      [0, 0, 0, 0, 0],
    ],
    [
      [1, 1, 0, 0, "w"],
      [0, 0, 0, 1, 0],
      ["p", 1, 0, 0, 0],
      [0, 1, 0, "h", 0],
      [0, 0, 0, 0, 0],
    ],
    [
      [0, "p", 0, 1, 0],
      [1, 0, 0, 0, 0],
      [0, 0, 1, 1, 0],
      ["h", 0, 0, 1, 0],
      [0, 0, 0, "w", 0],
    ],
    [
      ["w", 0, 0, 1, 0],
      [0, 1, 0, 0, 0],
      [0, 0, "h", 0, 0],
      [0, 0, 0, 1, 0],
      [1, 1, 0, 0, "p"],
    ],
    [
      [0, 1, 0, 0, 0],
      ["p", 0, 0, 1, 0],
      [0, 1, 1, 0, 0],
      [0, 0, "h", 1, "w"],
      [0, 0, 0, 0, 0],
    ],
    [
      [1, 0, 0, 0, 0],
      [1, 0, 0, "h", 0],
      [0, 0, 0, 0, 1],
      ["p", 1, 1, 0, 0],
      [0, 0, 0, 0, "w"],
    ],
    [
      ["w", 0, 1, 0, 0],
      [0, 0, 0, 0, 1],
      [0, 0, 1, 0, "p"],
      [0, 0, 1, 0, 0],
      ["h", 0, 0, 0, 1],
    ],
    [
      [1, 0, 0, 0, 0],
      [1, 0, "h", 0, 0],
      [0, 0, 0, 1, "w"],
      [0, 0, 0, 1, 0],
      ["p", 1, 0, 0, 0],
    ],
    [
      ["p", 0, 0, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, "h", 0, 0],
      [0, 1, 1, 1, 0],
      ["w", 0, 0, 0, 0],
    ],
    [
      [1, 0, "h", 0, 0],
      [0, 0, 0, 1, 0],
      [0, 1, 0, 0, "w"],
      ["p", 0, 0, 0, 0],
      [0, 0, 1, 1, 0],
    ],
    [
      [1, 0, 0, 0, 0],
      [0, "w", 0, 1, 0],
      [0, "h", 0, 0, 1],
      [0, 0, 0, 0, 0],
      [0, 1, 0, "p", 1],
    ],
  ];

  const selectedMap = maps[Math.floor(Math.random() * maps.length)];

  const players = [];
  const obstacles = [];
  let tunnel = {};

  selectedMap.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === "p") {
        players.push({ x, y, role: "prisoner", nickname: "" });
      } else if (cell === "w") {
        players.push({ x, y, role: "warder", nickname: "" });
      } else if (cell === 1) {
        obstacles.push({ x, y });
      } else if (cell === "h") {
        tunnel = { x, y };
      }
    });
  });

  state.tunnel = tunnel;
  state.obstacles = obstacles;

  const randomRole = Math.round(Math.random());
  if (randomRole === 0) {
    state.players[0] = players.find((player) => player.role === "prisoner");
    state.players[1] = players.find((player) => player.role === "warder");
    state.turn = 2;
  } else {
    state.players[0] = players.find((player) => player.role === "warder");
    state.players[1] = players.find((player) => player.role === "prisoner");
    state.turn = 1;
  }
}

function getUpdatedPos(keyCode) {
  switch (keyCode) {
    case 37: {
      // left
      return { x: -1, y: 0 };
    }
    case 38: {
      // down
      return { x: 0, y: -1 };
    }
    case 39: {
      // right
      return { x: 1, y: 0 };
    }
    case 40: {
      // up
      return { x: 0, y: 1 };
    }
  }
}

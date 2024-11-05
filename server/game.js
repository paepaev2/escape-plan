const { GRID_SIZE } = require('./constant');

module.exports = {
    // createGameState,
    initGame,
    gameLoop,
    validMove,
    randomPos,
    getUpdatedPos,
}

function initGame() {
    const state = createGameState();
    randomPos(state);
    return state;
}

function createGameState() {
    return {
        players: [],
        tunnel: {},
        obstacle: {},
        turn: {},
      
        gridsize: GRID_SIZE
      }
}

function gameLoop(state) {
    if (!state) return;

    let prisoner;
    let warder;

    if (state.players[0].role === 'prisoner') {
        prisoner = state.players[0];
        warder = state.players[1];
    } else {
        prisoner = state.players[1];
        warder = state.players[0];
    }

    if (prisoner.x == state.tunnel.x && prisoner.y == state.tunnel.y) {
        if (state.players[0].role === 'prisoner') return 1.1 //player1, prisoner wins
        else return 1.2; //player2, prisoner wins
    }

    if (prisoner.x == warder.x && prisoner.y == warder.y) {
        if (state.players[0].role === 'warder') return 2.1 //player1, warder wins
        else return 2.2; //player2, warder wins
    }

    return false;
}

function validMove(state, index, move) {
    // console.log(state);
    const player = state.players[index - 1];
    const tunnel = state.tunnel;
    const obstacle = state.obstacle;

    let x = player.x;
    let y = player.y;
    x += move.x;
    y += move.y;

    if (x < 0 || x > GRID_SIZE-1 || y < 0 || y > GRID_SIZE-1) {
        // console.log('OUT!');
        return false;
    }

    if (obstacle.x === x && obstacle.y === y) {
        // console.log('BUMP!');
        return false;
    }

    if (player.role === 'warder' && tunnel.x === x && tunnel.y === y) {
        // console.log('WARDER CANNOT WALK THROUGH THE TUNNEL');
        return false;
    }

    return true;
}

function randomPos(state) {
    const blocks = [];

    const prisoner = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        role: 'prisoner',
    };
    blocks.push([prisoner.x, prisoner.y]);

    const warder = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        role: 'warder',
    };
    blocks.push([warder.x, warder.y]);

    const tunnel = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    };
    blocks.push([tunnel.x, tunnel.y]);

    const obstacle = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    };
    blocks.push([obstacle.x, obstacle.y]);

    const uniquePositions = blocks.length === new Set(blocks.map(JSON.stringify)).size;
    if (!uniquePositions) return randomPos(state);

    state.tunnel = tunnel;
    state.obstacle = obstacle;

    const randomRole = Math.round(Math.random());
    if (randomRole === 0) {
        state.players[0] = prisoner;
        state.players[1] = warder;
        state.turn = 2;
    } else {
        state.players[0] = warder;
        state.players[1] = prisoner;
        state.turn = 1;
    }
}

function getUpdatedPos(keyCode) {
    switch (keyCode) {
        case 37: { // left
          return { x: -1, y: 0 };
        }
        case 38: { // down
          return { x: 0, y: -1 };
        }
        case 39: { // right
          return { x: 1, y: 0 };
        }
        case 40: { // up
          return { x: 0, y: 1 };
        }
      }
}
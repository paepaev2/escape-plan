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
        players: [{}, {}],
        // tunnel: {},
        obstacle: {},
      
        gridsize: GRID_SIZE
      }
}

function gameLoop(state) {
    if (!state) return;

    let prisoner;
    let warder;

    if (state.players[0].role === prisoner) {
        prisoner = state.players[0];
        warder = state.players[1];
    } else {
        prisoner = state.players[1];
        warder = state.players[0];
    }

    if (prisoner.x == warder.x && prisoner.y == warder.y) {
        alert("warder wins");
        return 2;
    }

    return false;
}

function validMove(state, move) {
    const prisoner = state.prisoner;
    const obstacle = state.obstacle;

    let x = prisoner.x;
    let y = prisoner.y;
    x += move.x;
    y += move.y;

    if (x < 0 || x > GRID_SIZE-1 || y < 0 || y > GRID_SIZE-1) {
        console.log('OUT!');
        return false;
    }

    if (obstacle.x === x && obstacle.y === y) {
        console.log('BUMP!');
        return false;
    }

    return true;
}

function randomPos(state) {
    const prisoner = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        role: 'prisoner'
    };

    const warder = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        role: 'warder'
    };

    const obstacle = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    };

    if ((prisoner.x === obstacle.x && prisoner.y === obstacle.y) || 
        (prisoner.x === warder.x && prisoner.y === warder.y) ||
        (warder.x === obstacle.x && warder.y === obstacle.y)
    ) {
        return randomPos(state);
    }

    state.obstacle = obstacle;

    const randomRole = Math.floor(Math.random());
    if (randomRole === 0) {
        state.players[0] = prisoner;
        state.players[1] = warder;
    } else {
        state.players[0] = warder;
        state.players[1] = prisoner;
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
const { GRID_SIZE } = require('./constant');

module.exports = {
    createGameState,
    gameLoop,
    validMove,
    randomPos,
    getUpdatedPos,
}

function createGameState() {
    return {
        prisoner: {},
        obstacle: {},
      
        gridsize: GRID_SIZE
      }
}

function gameLoop(state) {
    if (!state) return;

    // const prisoner = state.prisoner;

    // if (prisoner.x < 0 || prisoner.x > GRID_SIZE-1 || prisoner.y < 0 || prisoner.y > GRID_SIZE-1) {
    //     console.log('OUT!');
    //     return 2;
    // }

    // if (state.obstacle.x === prisoner.x && state.obstacle.y === prisoner.y) {
    //     console.log('BUMP!');
    //     return 2;
    // }

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
    prisoner = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    }

    obstacle = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    }

    if (prisoner.x === obstacle.x && prisoner.y === obstacle.y) {
        return randomPos(state);
    }

    state.prisoner = prisoner;
    state.obstacle = obstacle;
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
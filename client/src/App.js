// App.js
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

function App() {
  const [gameCode, setGameCode] = useState("");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerNumber, setPlayerNumber] = useState(null);
  const [playerRole, setPlayerRole] = useState(null);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    socket.on("gameState", handleGameState);
    socket.on("gameOver", handleGameOver);
    socket.on("gameCode", handleGameCode);
    socket.on("unknownGame", handleUnknownGame);
    socket.on("tooManyPlayers", handleTooManyPlayers);

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("gameOver", handleGameOver);
      socket.off("gameCode", handleGameCode);
      socket.off("unknownGame", handleUnknownGame);
      socket.off("tooManyPlayers", handleTooManyPlayers);
    };
  }, []);

  useEffect(() => {
    if (gameState && playerNumber !== null) {
      const role = gameState.players[playerNumber - 1]?.role;
      setPlayerRole(role);
    }
  }, [gameState, playerNumber]);

  const createGame = () => {
    socket.emit("newGame");
    socket.on("gameCode", (code) => {
      setGameCode(code);
      setPlayerNumber(1);
      setIsGameStarted(true);
    });
  };

  const joinGame = (roomName) => {
    socket.emit("joinGame", roomName);
    socket.on("init", (playerNum) => {
      setPlayerNumber(playerNum);
      setIsGameStarted(true);
    });

    socket.on("unknownGame", handleUnknownGame);
    socket.on("tooManyPlayers", handleTooManyPlayers);
  };

  const generateMap = (state) => {
    const size = state.gridsize;
    const map = Array(size)
      .fill(null)
      .map(() => Array(size).fill(0)); // Initialize with 0 (base tile)

    // Place obstacles
    if (state.obstacles) {
      state.obstacles.forEach((obstacle) => {
        map[obstacle.y][obstacle.x] = 1; // 1 represents obstacle tile
      });
    } else if (state.obstacle) {
      // If single obstacle
      map[state.obstacle.y][state.obstacle.x] = 1;
    }

    // Place tunnel
    const tunnel = state.tunnel;
    if (tunnel) {
      map[tunnel.y][tunnel.x] = "h"; // 'h' represents the tunnel
    }

    // Place players
    state.players.forEach((player) => {
      const symbol = player.role === "prisoner" ? "p" : "w";
      map[player.y][player.x] = symbol;
    });

    return map;
  };

  const handleGameState = (state) => {
    const map = generateMap(state);
    setGameState({ ...state, map });
  };

  const handleGameOver = (data) => {
    const { winner } = data;

    let number;
    let role;
    if (winner === 1.1) {
      number = 1;
      role = "prisoner";
    } else if (winner === 1.2) {
      number = 2;
      role = "prisoner";
    } else if (winner === 2.1) {
      number = 1;
      role = "warden";
    } else if (winner === 2.2) {
      number = 2;
      role = "warden";
    } else {
      role = "error";
    }

    alert(`Game Over! Player ${number}, ${role} wins!`);
    setIsGameStarted(false);
  };

  const handleGameCode = (code) => {
    setGameCode(code);
    setPlayerNumber(1);
    setIsGameStarted(true);
  };

  const handleUnknownGame = () => {
    alert("Unknown Game Code.");
    reset();
  };

  const handleTooManyPlayers = () => {
    alert("This game already has two players.");
    reset();
  };

  const reset = () => {
    setGameCode("");
    setPlayerNumber(null);
    setIsGameStarted(false);
    setGameState(null);
  };

  // Handle key presses globally
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isGameStarted) {
        socket.emit("keydown", event.keyCode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameStarted]);

  // Function to get the cell content based on the cell type
  const getCellContent = (cell) => {
    const wardenImage = "/images/warden.png";
    const prisonerImage = "/images/prisoner.png";
    const baseTileImage = "/images/base-tile.png";
    const obstacleTileImage = "/images/obstacle-tile.png";
    const tunnelImage = "/images/tunnel-tile.png"; // Ensure this image exists

    const imageStyle = {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    };

    const characterStyle = {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "contain",
    };

    switch (cell) {
      case 0:
        return <img src={baseTileImage} alt="base-tile" style={imageStyle} />;
      case 1:
        return (
          <img src={obstacleTileImage} alt="Obstacle" style={imageStyle} />
        );
      case "w":
        return (
          <>
            <img src={baseTileImage} alt="base-tile" style={imageStyle} />
            <img src={wardenImage} alt="Warden" style={characterStyle} />
          </>
        );
      case "p":
        return (
          <>
            <img src={baseTileImage} alt="base-tile" style={imageStyle} />
            <img src={prisonerImage} alt="Prisoner" style={characterStyle} />
          </>
        );
      case "h":
        return <img src={tunnelImage} alt="Tunnel" style={imageStyle} />;
      default:
        return <img src={baseTileImage} alt="base-tile" style={imageStyle} />;
    }
  };

  // Grid component to render the game map
  const Grid = ({ map, getCellContent }) => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${map[0].length}, 1fr)`,
          gap: "1px",
          width: "500px",
          height: "500px",
          margin: "0 auto",
        }}
      >
        {map.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <Cell
              key={`c${columnIndex}${rowIndex}`}
              cell={cell}
              getCellContent={getCellContent}
            />
          ))
        )}
      </div>
    );
  };

  // Cell component for each grid cell
  const Cell = ({ cell, getCellContent }) => {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {getCellContent(cell)}
      </div>
    );
  };

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      {!isGameStarted ? (
        <div className="text-center">
          <h1>Escape Plan</h1>
          <button onClick={createGame} className="btn btn-success m-2">
            Create New Game
          </button>
          <div>OR</div>
          <input
            type="text"
            placeholder="Enter Game Code"
            onChange={(e) => setGameCode(e.target.value)}
            className="form-control mt-2"
          />
          <button
            onClick={() => joinGame(gameCode)}
            className="btn btn-success mt-2"
          >
            Join Game
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h1>Your game code is: {gameCode}</h1>
          <h2>
            You are Player {playerNumber}, {playerRole}
          </h2>
          {gameState && gameState.map && (
            <Grid map={gameState.map} getCellContent={getCellContent} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;

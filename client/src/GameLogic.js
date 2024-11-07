import React, { useState, useEffect, useRef } from "react";
import Countdown from "react-countdown";
import { io } from "socket.io-client";
import GameNavbar from "./components/Navbar/GameNavbar";
import RandomBackgroundComponent from "./components/GameBackgrounds";
import EscapePlanLogo from "./assets/fonts/escapeplan.png";
import { Col, Row } from "react-bootstrap";
import PlayerInfo from "./components/PlayerInfo";
import { useNavigate } from "react-router-dom";
import LoadingPage from "./LoadingPage";
import { toast } from "react-toastify";
import CustomToastContainer from "./components/Toast/CustomToastContainer";
import { socket } from "./socket";
import GameOverPage from "./GameOverPage";

function GameLogic() {
  const navigate = useNavigate();

  const [gameCode, setGameCode] = useState("");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [playerNumber, setPlayerNumber] = useState(null);
  const [playerRole, setPlayerRole] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [bothPlayersJoined, setBothPlayersJoined] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [nickname, setNickname] = useState("");

  const [currentTurn, setCurrentTurn] = useState(null);
  const [turnTimeOut, setTurnTimeOut] = useState(null);
  const [keyPressDone, setKeyPressDone] = useState(false);

  useEffect(() => {
    socket.on("gameState", handleGameState);
    socket.on("gameOver", handleGameOver);
    socket.on("gameCode", handleGameCode);
    socket.on("unknownGame", handleUnknownGame);
    socket.on("tooManyPlayers", handleTooManyPlayers);
    socket.on("invalidMove", handleInvalidMove);
    socket.on("bothPlayersJoined", () => {
      setBothPlayersJoined(true);
    });

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("gameOver", handleGameOver);
      socket.off("gameCode", handleGameCode);
      socket.off("unknownGame", handleUnknownGame);
      socket.off("tooManyPlayers", handleTooManyPlayers);
      socket.off("invalidMove", handleInvalidMove);
      socket.off("bothPlayersJoined");
    };
  }, []);

  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) {
      setNickname(savedNickname);
    }
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
      setBothPlayersJoined(true);
      setKeyPressDone(false);
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
    setCurrentTurn(state.turn);

    if (state.timeRemaining) {
      setTurnTimeOut(Date.now() + state.timeRemaining);
      setKeyPressDone(false);
    }
  };

  const handleGameOver = (data) => {
    const { winner } = data;
    const { win_type } = data;

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

    socket.emit("setScore", number);
    toast.error(`Game Over! Player ${number}, ${role} won!`);

    setWinner({ number, role });
    setIsGameOver(true);
  };

  const handleGameCode = (code) => {
    setGameCode(code);
  };

  const handleUnknownGame = () => {
    toast.error("Unknown Game Code.");
    reset();
  };

  const handleTooManyPlayers = () => {
    toast.error("This game already has two players.");
    reset();
  };

  const handleInvalidMove = () => {
    toast.error("You cannot move to that way !-!");
  };

  const reset = () => {
    setGameCode("");
    setPlayerNumber(null);
    setIsGameStarted(false);
    setBothPlayersJoined(false);
    setGameState(null);
    setCurrentTurn(null);
    setTurnTimeOut(null);
    setKeyPressDone(false);
    setWinner(null);
    setIsGameOver(false);
  };

  const handleKeyDown = (event) => {
    console.log("Key pressed:", event.keyCode);
    const arrowKeys = [37, 38, 39, 40]; // Left, Up, Right, Down arrow keys

    // Check if the game is started and it's the current player's turn
    if (isGameStarted && playerNumber === currentTurn) {
      console.log("Player number:", playerNumber);
      let newGameState = { ...gameState };
      console.log("Game state players:", newGameState.players);

      // Use playerNumber - 1 as the index to find the player
      const player = newGameState.players[playerNumber - 1];
      console.log("Player:", player);

      socket.emit("keydown", event.keyCode);
      setKeyPressDone(true);

      let validMove = false;

      if (player) {
        // Handle movement based on the key pressed
        switch (event.keyCode) {
          case 38: // Up arrow
            if (
              player.y > 0 &&
              newGameState.map[player.y - 1][player.x] !== 1 // Check if the target cell is not an obstacle
            ) {
              player.y -= 1; // Update player's y position
              validMove = true;
            }
            break;
          case 40: // Down arrow
            if (
              player.y < newGameState.map.length - 1 &&
              newGameState.map[player.y + 1][player.x] !== 1
            ) {
              player.y += 1; // Update player's y position
              validMove = true;
            }
            break;
          case 37: // Left arrow
            if (
              player.x > 0 &&
              newGameState.map[player.y][player.x - 1] !== 1
            ) {
              player.x -= 1; // Update player's x position
              validMove = true;
            }
            break;
          case 39: // Right arrow
            if (
              player.x < newGameState.map[0].length - 1 &&
              newGameState.map[player.y][player.x + 1] !== 1
            ) {
              player.x += 1; // Update player's x position
              validMove = true;
            }
            break;
          default:
            break;
        }

        if (validMove) {
          // Regenerate the map with the updated player positions
          const map = generateMap(newGameState);
          setGameState({ ...newGameState, map }); // Update the game state
          socket.emit("move", newGameState); // Emit the updated game state to the server
          setKeyPressDone(true);
          setTurnTimeOut(null);

          // Switch turns
          setCurrentTurn((prevTurn) => (prevTurn === 1 ? 2 : 1));
        }
      }
    } else if (arrowKeys.includes(event.keyCode)) {
      toast.error("It's not your turn!, please wait for another player");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameStarted, playerRole, gameState, currentTurn, playerNumber]);

  // Function to handle turn timeout
  const handleTurnTimeout = () => {
    if (playerNumber === currentTurn && !keyPressDone) {
      // It's this player's turn and they haven't made a move
      socket.emit("timeout", playerNumber);
    }
  };

  // Function to get the cell content based on the cell type
  const getCellContent = (cell) => {
    const wardenImage = "/images/warden.png";
    const prisonerImage = "/images/prisoner.png";
    const baseTileImage = "/images/base-tile.png";
    const obstacleTileImage = "/images/obstacle-tile.png";
    const tunnelImage = "/images/tunnel-tile.png";

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
          height: "100%",
          margin: "0 auto",
          width: "100%",
          border: "4px dashed #ffffff",
          aspectRatio: "1",
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

  const continueGame = () => {
    console.log("Continue game");
    socket.emit("continueGame", gameState, winner.number); // Emit the current game state to continue
    setIsGameOver(false);
    setWinner(null);
    setKeyPressDone(false);
    // Ensure both players are marked as joined
    setBothPlayersJoined(true);
  };

  // Handler to restart the game
  const restartGame = () => {
    socket.emit("restartGame", { room: gameState.roomName }); // Specify the room to restart
    reset();
    navigate("/game"); // Go back to the main game page with fresh start
  };

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <CustomToastContainer />
      <RandomBackgroundComponent />
      {!isGameStarted ? (
        <div className="text-center">
          <Row
            style={{
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <img
              src={EscapePlanLogo}
              style={{ width: "50%" }}
              alt="Escape Plan Logo"
            />
          </Row>
          <p style={{ color: "white" }}>Welcome, {nickname}</p>
          <button onClick={createGame} className="btn btn-success m-2">
            Create New Game
          </button>

          <div>
            <span style={{ color: "#ffffff" }}>OR</span>
          </div>

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
        <>
          {isGameOver ? (
            <GameOverPage
              number={winner.number}
              role={winner.role}
              gameState={gameState}
              continueGame={continueGame}
              restartGame={restartGame}
            />
          ) : (
            <div className="text-center">
              <GameNavbar
                gameCode={gameCode}
                turnTimeOut={turnTimeOut}
                handleTurnTimeout={handleTurnTimeout} // Pass the handler to GameNavbar
              />
              <Row>
                <Col>
                  {gameState && gameState.map && (
                    <Grid map={gameState.map} getCellContent={getCellContent} />
                  )}
                </Col>
                <Col
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <PlayerInfo
                    playerNumber={playerNumber}
                    playerRole={playerRole}
                  />
                </Col>
              </Row>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GameLogic;

import React, { useState, useEffect, useRef } from "react";
import Countdown from "react-countdown";
import { io } from "socket.io-client";
import GameNavbar from "../components/Navbar/GameNavbar";
import RandomBackgroundComponent from "../components/Layout/GameBackgrounds";
import EscapePlanLogo from "../assets/fonts/escapeplan.png";
import { Col, Row } from "react-bootstrap";
import PlayerInfo from "../components/Cards/PlayerInfo";
import { useNavigate } from "react-router-dom";
import LoadingPage from "./LoadingPage";
import { toast } from "react-toastify";
import CustomToastContainer from "../components/Toast/CustomToastContainer";
import { socket } from "../socket";
import GameOverPage from "./GameOverPage";
import Loading from "../assets/game/loading.gif";

const imageStyle = {
  marginTop: "20px",
  width: "auto",
  height: "20%",
  maxHeight: "200px",
};

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
  const [nickname, setNickname] = useState([]);
  const [warderImagePath, setWarderImagePath] = useState("/images/warden.png");
  const [prisonerImagePath, setPrisonerImagePath] = useState(
    "/images/prisoner.png"
  );
  const [baseTileImagePath, setBaseTileImagePath] = useState(
    "/images/base-tile.png"
  );
  const [obstacleTileImagePath, setObstacleTileImagePath] = useState(
    "/images/obstacle-tile.png"
  );

  const [currentTurn, setCurrentTurn] = useState(null);
  const [turnTimeOut, setTurnTimeOut] = useState(null);
  const [keyPressDone, setKeyPressDone] = useState(false);
  const [showGameStartMessage, setShowGameStartMessage] = useState(false);

  useEffect(() => {
    socket.on("bothPlayersJoined", () => {
      console.log("Both players have joined the game");
      setBothPlayersJoined(true);
      setShowGameStartMessage(true);
      setTimeout(() => {
        setShowGameStartMessage(false);
      }, 3000); // Show the "Game Start" message for 3 seconds
    });

    // Clean up event listeners on unmount
    return () => {
      socket.off("bothPlayersJoined");
    };
  }, []);

  useEffect(() => {
    // Event listeners
    socket.on("onlineClients", (clients) => {
      console.log("Online clients:", clients);
      // Handle the list of online clients (e.g., display them on the UI)
    });

    socket.on("clientCount", (data) => {
      console.log(`Total connected clients: ${data.count}`);
      console.log("Online clients:", data.clients);
      // Update the UI or other client-side logic with client count
    });

    socket.on("gameReset", () => {
      // Reset the game state
      reset();
      navigate("/game");
    });

    // Clean up event listeners on unmount
    return () => {
      socket.off("onlineClients");
      socket.off("clientCount");
      socket.off("gameReset");
    };
  }, []);

  useEffect(() => {
    socket.on("gameState", handleGameState);
    socket.on("gameOver", handleGameOver);
    socket.on("gameCode", handleGameCode);
    socket.on("unknownGame", handleUnknownGame);
    socket.on("tooManyPlayers", handleTooManyPlayers);
    socket.on("invalidMove", handleInvalidMove);

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("gameOver", handleGameOver);
      socket.off("gameCode", handleGameCode);
      socket.off("unknownGame", handleUnknownGame);
      socket.off("tooManyPlayers", handleTooManyPlayers);
      socket.off("invalidMove", handleInvalidMove);
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
    console.log("Create game", socket);
    socket.emit("newGame");
    socket.on("gameCode", (code) => {
      setGameCode(code);
      setPlayerNumber(1);
      setIsGameStarted(true);
    });
    socket.emit("nickname", nickname, 1);
  };

  const joinGame = (roomName) => {
    socket.emit("joinGame", roomName);
    socket.on("init", (playerNum) => {
      setPlayerNumber(playerNum);
      setIsGameStarted(true);
      // setBothPlayersJoined(true);
      setKeyPressDone(false);
    });
    socket.emit("nickname", nickname, 2);

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
    //edit
    setIsGameOver(false);
    setWinner(null);
    setKeyPressDone(false);
    // -edit

    // Ensure both players are marked as joined
    // setBothPlayersJoined(true);

    if (state.warderImagePath) {
      setWarderImagePath(state.warderImagePath);
    }

    if (state.prisonerImagePath) {
      setPrisonerImagePath(state.prisonerImagePath);
    }

    if (state.baseTileImagePath) {
      setBaseTileImagePath(state.baseTileImagePath);
    }
    if (state.obstacleTileImagePath) {
      setObstacleTileImagePath(state.obstacleTileImagePath);
    }

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
              newGameState.map[player.y - 1][player.x] !== 1 && // Check if the target cell is not an obstacle
              (player.role !== "warder"
                ? true
                : newGameState.map[player.y - 1][player.x] !== "h")
            ) {
              player.y -= 1; // Update player's y position
              validMove = true;
            }
            break;
          case 40: // Down arrow
            if (
              player.y < newGameState.map.length - 1 &&
              newGameState.map[player.y + 1][player.x] !== 1 &&
              (player.role !== "warder"
                ? true
                : newGameState.map[player.y + 1][player.x] !== "h")
            ) {
              player.y += 1; // Update player's y position
              validMove = true;
            }
            break;
          case 37: // Left arrow
            if (
              player.x > 0 &&
              newGameState.map[player.y][player.x - 1] !== 1 &&
              (player.role !== "warder"
                ? true
                : newGameState.map[player.y][player.x - 1] !== "h")
            ) {
              player.x -= 1; // Update player's x position
              validMove = true;
            }
            break;
          case 39: // Right arrow
            if (
              player.x < newGameState.map[0].length - 1 &&
              newGameState.map[player.y][player.x + 1] !== 1 &&
              (player.role !== "warder"
                ? true
                : newGameState.map[player.y][player.x + 1] !== "h")
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
        return (
          <img src={baseTileImagePath} alt="base-tile" style={imageStyle} />
        );
      case 1:
        return (
          <img src={obstacleTileImagePath} alt="Obstacle" style={imageStyle} />
        );
      case "w":
        return (
          <>
            <img src={baseTileImagePath} alt="base-tile" style={imageStyle} />
            <img src={warderImagePath} alt="Warder" style={characterStyle} />
          </>
        );
      case "p":
        return (
          <>
            <img src={baseTileImagePath} alt="base-tile" style={imageStyle} />
            <img
              src={prisonerImagePath}
              alt="Prisoner"
              style={characterStyle}
            />
          </>
        );
      case "h":
        return <img src={tunnelImage} alt="Tunnel" style={imageStyle} />;
      default:
        return (
          <img src={baseTileImagePath} alt="base-tile" style={imageStyle} />
        );
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
    // setIsGameOver(false);
    // setWinner(null);
    // setKeyPressDone(false);
    // // Ensure both players are marked as joined
    // setBothPlayersJoined(true);
  };

  // Handler to restart the game
  const restartGame = () => {
    // socket.emit("restartGame", { room: gameState.roomName }); // Specify the room to restart
    socket.emit("restartGame");
    // reset();
    // navigate("/game"); // Go back to the main game page with fresh start
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center">
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
          {!bothPlayersJoined ? (
            // Display the waiting screen
            <div className="text-center">
              <GameNavbar
                gameCode={gameCode}
                turnTimeOut={turnTimeOut}
                handleTurnTimeout={handleTurnTimeout} // Pass the handler to GameNavbar
              />
              <h2 style={{ color: "#ffffff" }}>
                Looking for other players to start...
              </h2>
              <img src={Loading} alt="Waiting" style={imageStyle} />
            </div>
          ) : isGameOver ? (
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
              <Row className="p-4">
                <Col xs={12} md={6} className="p-3">
                  <div className="responsive-padding">
                    {gameState && gameState.map && (
                      <Grid
                        map={gameState.map}
                        getCellContent={getCellContent}
                      />
                    )}
                  </div>
                </Col>
                <Col
                  className="p-3"
                  xs={12}
                  md={6}
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
                    nickname={nickname}
                    turn={currentTurn}
                    warderImage={warderImagePath}
                    prisonerImage={prisonerImagePath}
                  />
                </Col>
              </Row>
            </div>
          )}
          {showGameStartMessage && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <h1 style={{ color: "#fff", fontSize: "4rem" }}>Game Start</h1>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GameLogic;

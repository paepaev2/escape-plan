import Lobby from "../../assets/backgrounds/lobby.gif";

function LobbyLayout({ children }) {
  const containerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundImage: `url(${Lobby})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: -1, // Ensures it is behind all other elements
    display: "flex",
    justifyContent: "center" /* Horizontally centers the text */,
    alignItems: "center" /* Vertically centers the text */,
    flexDirection: "column",
  };

  return <div style={containerStyle}>{children}</div>;
}

export default LobbyLayout;

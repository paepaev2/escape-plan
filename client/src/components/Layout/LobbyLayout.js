import Lobby from "../../assets/backgrounds/lobby.gif";

function LobbyLayout({ children }) {
  const containerStyle = {
    width: "100%",
    height: "100vh",
    backgroundImage: `url(${Lobby})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  const contentStyle = {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>{children}</div>
    </div>
  );
}

export default LobbyLayout;

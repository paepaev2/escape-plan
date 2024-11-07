import React from "react";
import Loading from "../assets/game/loading.gif";
import LobbyLayout from "../components/Layout/LobbyLayout";

function WaitingScreen() {

  const imageStyle = {
    marginTop: "20px",
    width: "auto",
    height: "20%",
  };

  return (
    <LobbyLayout>
      <h2 style={{ color: "#ffffff" }}>
        Looking for other players to start...
      </h2>
      <img src={Loading} alt="Waiting" style={imageStyle} />
    </LobbyLayout>
  );
}

export default WaitingScreen;

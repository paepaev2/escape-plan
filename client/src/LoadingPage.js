import React from "react";
import Loading from "./assets/game/loading.gif"; 

function WaitingScreen() {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "black",
    color: "white",
    textAlign: "center",
  };

  const imageStyle = {
    marginTop: "20px",
    width: "100%", 
    height: "auto",
  };

  return (
    <div style={containerStyle}>
      <h1>Waiting for other players to start...</h1>
      <img src={Loading} alt="Waiting" style={imageStyle} />
    </div>
  );
}

export default WaitingScreen;

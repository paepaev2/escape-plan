import React, { useState } from "react";
import Loading from "../assets/game/loading.gif";
import LobbyLayout from "../components/Layout/LobbyLayout";
import { Row, Col, Button } from "react-bootstrap";
import CharacterCard from "../components/Cards/CharacterCard";

function WaitingScreen() {
  const imageStyle = {
    marginTop: "20px",
    width: "auto",
    height: "20%",
  };

  // dummy
  const character = {
    name: "JAMES",
    image: "images/warden.png",
    color: "#e74c3c",
  };

  const playerAvailable = true;

  const [playerJoin, setPlayerJoin] = useState(true);

  // put condition here
  //if (playerAvailable === true) {
  //  setPlayerJoin(true);
  // }

  return (
    <LobbyLayout>
      {playerJoin ? (
        <>
          <Row>
            <h2 style={{ color: "#ffffff" }}>Player found! Welcome!</h2>
          </Row>
          <Row>
            <Col>
              {/* set player 1 here */}
              <CharacterCard character={character}>
                NAME OF PLAYER 1
              </CharacterCard>
            </Col>
            <Col>
              {/* set opponent here */}
              <CharacterCard character={character}>
                NAME OF PLAYER 2
              </CharacterCard>
            </Col>
          </Row>
          <Row className="mt-3">
            <Button>Begin</Button>
          </Row>
        </>
      ) : (
        <>
          <h2 style={{ color: "#ffffff" }}>
            Looking for other players to start...
          </h2>
          <img src={Loading} alt="Waiting" style={imageStyle} />
        </>
      )}
    </LobbyLayout>
  );
}

export default WaitingScreen;

import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import CharacterCard from "../components/Cards/CharacterCard";

// dummy
const characters = [
  { name: "JAMES", image: "images/warden.png", color: "#e74c3c" },
  { name: "ALEKS", image: "images/character1.gif", color: "#2ecc71" },
  { name: "JOHNN", image: "trevor.png", color: "#3498db" },
  { name: "BRETT", image: "brett.png", color: "#f1c40f" },
];

const CharacterSelection = () => {
  return (
    <div
      className="justify-content-center"
      style={{
        backgroundColor: "#262B44",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Row>
        <h1>CHOOSE YOUR CHARACTER</h1>
      </Row>
      <Row className="justify-content-center">
        {characters.map((character, index) => (
          <Col
            key={index}
            xs={6}
            sm={4}
            md={3}
            lg={2}
            className="d-flex justify-content-center mb-4"
          >
            <CharacterCard character={character}>
              
            </CharacterCard>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CharacterSelection;

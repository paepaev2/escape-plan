import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import Rules from "../../assets/game/rules.png";
import Star from "../../assets/game/star.png";

function PlayerInfo({ playerNumber, playerRole, nickname }) {
  return (
    <Row
      className="justify-content-center"
      style={{ color: "#ffffff", textAlign: "center" }}
    >
      <Col md={10}>
        {/* Player Role Display */}
        <h3>
          You are {nickname}, {playerRole}
          <img
            src={
              playerRole === "warder"
                ? "/images/warden.png"
                : "/images/prisoner.png"
            }
            style={{ width: "40px", marginLeft: "10px" }}
            alt={playerRole}
          />
        </h3>

        {/* Conditional Rules Card */}
        <Card
          style={{
            marginTop: "20px",
            backgroundColor: "#2a2a2a",
            color: "#ffffff",
            border: "4px solid #8E8E8E",
            boxShadow: "4px 4px 0 #8e8e8e",
          }}
        >
          <Card.Body>
            <div style={{ marginTop: "12px", marginBottom: "20px" }}>
              <h4>
                <img
                  src={Rules}
                  style={{ width: "28px", marginRight: "8px" }}
                />
                {playerRole === "warder" ? "WARDEN RULES" : "PRISONER RULES"}
                <img src={Rules} style={{ width: "28px", marginLeft: "8px" }} />
              </h4>
            </div>
            <Card.Text>
              {playerRole === "warder" ? (
                <>
                  <p>
                    As the warden, your objective is to prevent the prisoners
                    from escaping.
                  </p>
                  <ul>
                    <li>Block any attempts by prisoners to reach the exit.</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>
                    As a prisoner, your goal is to find the escape route without
                    getting caught.
                  </p>
                  <ul>
                    <li>
                      Stay out of the warden's sight and reach the exit safely.
                    </li>
                  </ul>
                </>
              )}
            </Card.Text>
          </Card.Body>
        </Card>

        <Row
          className="justify-content-center"
          style={{ marginTop: "20px", alignItems: "center" }}
        >
          <img src={Star} style={{ width: "60px" }} />
          HOW TO PLAY: use arrow keys to move up, down, left or right.
          <img src={Star} style={{ width: "60px" }} />
        </Row>
      </Col>
    </Row>
  );
}

export default PlayerInfo;

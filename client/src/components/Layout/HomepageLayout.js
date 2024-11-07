import React from 'react';
import RandomBackgroundComponent from "./GameBackgrounds";
import { Col, Row } from "react-bootstrap";
import EscapePlanLogo from "../../assets/fonts/escapeplan.png";

function HomepageLayout({ children }) {
    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
            <RandomBackgroundComponent />
            <Row
                className="w-100 d-flex align-items-center justify-content-center"
                style={{
                    padding: "20px",
                }}
            >
                {/* Left column with logo */}
                <Col md={6} className="d-flex justify-content-center">
                    <img
                        src={EscapePlanLogo}
                        style={{ width: "70%" }}
                        alt="Escape Plan Logo"
                    />
                </Col>

                {/* Right column for the game-over content */}
                <Col md={6} className="d-flex flex-column align-items-center justify-content-center">
                    {children}
                </Col>
            </Row>
        </div>
    );
}

export default HomepageLayout;

import RandomBackgroundComponent from "./GameBackgrounds";
import { Col, Row } from "react-bootstrap";
import EscapePlanLogo from "../assets/fonts/escapeplan.png";

function HomepageLayout({ children }) {
  return (
    <div className="container m-0 vh-100 d-flex align-items-center justify-content-center">
      <RandomBackgroundComponent />
      <Row
        style={{
          alignItems: "center",
          justifyContent: "left",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <Col md={8}>
          <img
            src={EscapePlanLogo}
            style={{ width: "70%" }}
            alt="Escape Plan Logo"
          />
        </Col>
        {children}
      </Row>
    </div>
  );
}

export default HomepageLayout;

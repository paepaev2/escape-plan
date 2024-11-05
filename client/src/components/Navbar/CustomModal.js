import React from "react";
import { Modal, Button } from "react-bootstrap";
import resumeButton from "../../assets/game/buttons/resume.png"; // Replace with your actual paths
import pauseButton from "../../assets/game/buttons/pause.png";
import exitButton from "../../assets/game/buttons/exit.png";
import modalBg from "../../assets/modal/modalbg.png";
import { useNavigate } from "react-router-dom";

function CustomModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleExit = () => {
    window.location.reload();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={buttonContainerStyle}>
          <Button onClick={() => onClose()} style={overrideButtonStyle}>
            <img src={resumeButton} alt="Resume" style={buttonStyle} />
          </Button>

          <img src={pauseButton} alt="Pause" style={buttonStyle} />

          <Button onClick={() => handleExit()} style={overrideButtonStyle}>
            <img src={exitButton} alt="Exit" style={buttonStyle} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CustomModal;

// Inline Styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.65)", // 25% darker overlay
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000, // Ensures it’s above other content
};

const modalStyle = {
  backgroundColor: "#ffffff",
  backgroundImage: `url(${modalBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",

  padding: "100px",
  flexDirection: "column",
  alignItems: "center",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)", // Optional shadow for depth
  display: "flex",
  justifyContent: "space-between", // Space items evenly
  border: "4px solid #000000", // Use prop for border
  borderRadius: "0", // No border radius to keep it square
  boxShadow: "4px 4px 0 #000000", // Pixelated shadow
  color: "#000",
  outline: "none",
  cursor: "pointer",
  position: "relative", // Necessary for positioning pseudo-elements
};

const buttonContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const overrideButtonStyle = {
  background: "none",
  border: "none",
};

const buttonStyle = {
  background: "none",
  border: "none",
  padding: "32px",
  cursor: "pointer",
  width: "300px",
};

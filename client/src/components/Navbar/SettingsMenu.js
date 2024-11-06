import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import gear from "../../assets/game/navbar/settings.png";
import CustomButton from "../Button";
import CustomModal from "./CustomModal";

function SettingsMenu() {
  //for customModal
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <>
      {/* Settings button to open the modal */}
      {/* Settings */}
      <CustomButton
        backgroundColor="#C4C4C4"
        border="4px solid #8E8E8E"
        boxShadow="4px 4px 0 #8e8e8e"
        onClick={handleOpenModal}
      >
        <img src={gear} style={iconButtonStyle} />
        Settings
      </CustomButton>

      <CustomModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}

const iconButtonStyle = {
  width: "20px",
  height: "20px",
  margin: "0px 8px 0px 0px",
};

export default SettingsMenu;

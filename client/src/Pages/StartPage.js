import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Col, Row } from "react-bootstrap";
import HomepageLayout from "../components/Layout/HomepageLayout";
import CustomToastContainer from "../components/Toast/CustomToastContainer";

const StartPage = () => {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (nickname.trim() === "") {
      console.log("Nickname is empty, showing toast");
      toast.error("Please enter your nickname!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    localStorage.setItem("nickname", nickname);
    navigate("/game", { state: { nickname } });
  };

  return (
    <div>
      <CustomToastContainer />
      <HomepageLayout>
        <Col md={2}>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={handleNicknameChange}
              style={{
                fontSize: "48",
              }}
            />
            <button
              type="submit"
              style={{ padding: "4px 12px", marginTop: "12px" }}
            >
              Start Game
            </button>
          </form>
        </Col>
      </HomepageLayout>
    </div>
  );
};

export default StartPage;

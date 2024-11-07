import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Game from "./GameLogic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WaitingScreen from "./LoadingPage";

// import Game from "./StartPage";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/wait" element={<WaitingScreen />} />
      </Routes>
    </>
  );
}

export default App;

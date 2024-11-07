//index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css"; // If you're using Bootstrap for styling
import "./App.css"; // Ensure global CSS is imported
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StartPage from "./Pages/StartPage";
import GameOverPage from "./Pages/GameOverPage";
import WaitingScreen from "./Pages/LoadingPage";
import ChooseCharacter from "./Pages/ChooseCharacter"

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/game" element={<App />} />
        <Route path="/gameover" element={<GameOverPage />} />
        <Route path="/wait" element={<WaitingScreen />} />
        <Route path="character" element={<ChooseCharacter />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

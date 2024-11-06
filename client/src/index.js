//index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // If you're using Bootstrap for styling
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GameOverPage from './GameOverPage'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/gameover" element={<GameOverPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
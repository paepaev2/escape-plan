import React, { useState, useEffect } from "react";
import background1 from "../assets/backgrounds/bg1.png";
import background2 from "../assets/backgrounds/bg2.gif";
import background3 from "../assets/backgrounds/bg3.png";

function RandomBackgroundComponent({ children }) {
  const backgrounds = [background1, background2, background3];
  const [randomBackground, setRandomBackground] = useState(null);

  useEffect(() => {
    const randomImage =
      backgrounds[Math.floor(Math.random() * backgrounds.length)];
    setRandomBackground(randomImage);
  }, []);

  const backgroundStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundImage: `url(${randomBackground})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    zIndex: -1, // Ensures it is behind all other elements
  };

  return (
    <div style={backgroundStyle} aria-hidden="true">
      {children}
    </div>
  );
}

export default RandomBackgroundComponent;

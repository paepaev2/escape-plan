import React from 'react';
import { Button } from 'react-bootstrap';

function CustomButton({ backgroundColor = "#f3d694", border = "4px solid #a36a2f", boxShadow = "4px 4px 0 #a36a2f", onClick, children }) {
    const buttonStyle = {
        display: "flex",
        justifyContent: "space-between", // Space items evenly
        alignItems: "center",
        padding: "4px 32px",
        backgroundColor: backgroundColor, // Use prop for background color
        border: border, // Use prop for border
        borderRadius: "0", // No border radius to keep it square
        boxShadow: boxShadow, // Pixelated shadow
        fontSize: "12px",
        color: "#000",
        outline: "none",
        cursor: "pointer",
        position: "relative", // Necessary for positioning pseudo-elements
    };

    return (
        <Button style={buttonStyle} onClick={onClick}>
            {children}
        </Button>
    );
}

export default CustomButton;

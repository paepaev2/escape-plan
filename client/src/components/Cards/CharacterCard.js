import { Card } from "react-bootstrap";

function CharacterCard({ character, children }) {
  return (
    <Card
      className="text-center"
      style={{
        width: "100px",
        border: `3px solid ${character.color}`,
        backgroundColor: "#34495e",
        borderRadius: "8px",
        transition: "transform 0.3s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <Card.Body>
        <Card.Title style={{ color: character.color, fontSize: "1rem" }}>
          {character.name}
        </Card.Title>
        <Card.Img
          src={character.image}
          alt={character.name}
          style={{
            width: "200px",
            height: "auto",
            aspectRatio: "1",
            borderRadius: "4px",
          }}
        />
      </Card.Body>
      {children}
    </Card>
  );
}

export default CharacterCard;

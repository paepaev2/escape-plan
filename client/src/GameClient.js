import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Server URL (hardcoded)
const SERVER_URL = 'http://localhost:3000'; // Change this to your server's IP if needed

function GameClient() {
  const [clients, setClients] = useState({});

  useEffect(() => {
    // Connect to the server
    const socket = io(SERVER_URL);

    // Receive the list of existing clients
    socket.on('existingClients', (clientList) => {
      setClients(clientList);
    });

    // Add a new client to the list
    socket.on('newClient', (newClient) => {
      setClients((prevClients) => ({
        ...prevClients,
        [newClient.id]: newClient,
      }));
    });

    // Remove a disconnected client from the list
    socket.on('clientDisconnected', (disconnectedClient) => {
      setClients((prevClients) => {
        const updatedClients = { ...prevClients };
        delete updatedClients[disconnectedClient.id];
        return updatedClients;
      });
    });

    // Cleanup on component unmount
    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h1>Connected Clients:</h1>
      <ul>
        {Object.values(clients).map((client) => (
          <li key={client.id}>Client ID: {client.id}</li>
        ))}
      </ul>
    </div>
  );
}

export default GameClient;

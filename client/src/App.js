import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const App = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('test');
    // Connect to the Socket.IO server
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    // Listen for the "welcome" event from the server
    socket.on('welcome', (data) => {
      console.log('Received welcome message:', data);
      setMessage(data); // Set the message from the server
    });

    // Send a message to the server
    socket.emit('message', 'Hello from the React client!');

    // Clean up the connection when the component is unmounted
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Socket.IO React Test</h1>
      <p>{message}</p>
    </div>
  );
};

export default App;

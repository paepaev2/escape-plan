import { io } from "socket.io-client";

export const socket = io(process.env.REACT_APP_SERVER_URL); // Replace with the server's local IP

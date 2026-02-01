import { io } from "socket.io-client";

let socket;

export function connectSocket(token) {
  socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
    auth: { token }
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
}

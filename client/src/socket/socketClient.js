import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "";

export const socket = io(API_URL || "/", {
  path: "/socket.io",
  autoConnect: false,
});

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.emit('player_disconnect');
    socket.disconnect();
  }
};

export const emitMove = (x, y) => {
  if (socket.connected) {
    socket.emit("player:move", { x, y });
  }
};

export const emitMessage = (roomId, text) => {
  if (socket.connected) {
    socket.emit("chat:message", { roomId, text });
  }
};

export const joinRoom = (roomId) => {
  if (socket.connected) {
    socket.emit("room:join", { roomId });
  }
};

export const leaveRoom = (roomId) => {
  if (socket.connected) {
    socket.emit("room:leave", { roomId });
  }
};

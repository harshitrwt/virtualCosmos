import { io } from "socket.io-client";

export const socket = io("/", {
  path: "/socket.io",
  autoConnect: false,
});

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

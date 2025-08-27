const { Server } = require("socket.io");

const initSocket = (httpServer, { origin }) => {
  const io = new Server(httpServer, {
    cors: { origin: [origin || "http://localhost:5173"], credentials: true },
    transports: ["websocket"],
  });

  io.on("connection", (socket) => {
    socket.on("joinBoard", (boardId) => socket.join(`board:${boardId}`));
    socket.on("leaveBoard", (boardId) => socket.leave(`board:${boardId}`));
  });

  const broadcast = (boardId, event, payload, exceptSocketId) => {
    const room = `board:${boardId}`;
    return exceptSocketId
      ? io.to(room).except(exceptSocketId).emit(event, payload)
      : io.to(room).emit(event, payload);
  };

  return { io, broadcast };
};

module.exports = { initSocket };

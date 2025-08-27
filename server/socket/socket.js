const { Server } = require("socket.io");

const initSocket = (httpServer, { origin }) => {
  const io = new Server(httpServer, {
    cors: { origin, credentials: true },
    transports: ["websocket"],
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-board", ({ BoardId }) => {
      if (!BoardId) return;
      socket.join(`board:${BoardId}`);
      console.log(`User ${socket.id} joined board:${BoardId}`);
    });

    socket.on("leave-board", ({ BoardId }) => {
      if (!BoardId) return;
      socket.leave(`board:${BoardId}`);
      console.log(`User ${socket.id} left board:${BoardId}`);
    });

    socket.on("task:create", (data) => {
      if (!data?.BoardId) return;
      socket.to(`board:${data.BoardId}`).emit("task:created", data);
    });

    socket.on("task:update", (data) => {
      if (!data?.BoardId) return;
      socket.to(`board:${data.BoardId}`).emit("task:updated", data);
    });

    socket.on("task:delete", (data) => {
      if (!data?.BoardId) return;
      socket.to(`board:${data.BoardId}`).emit("task:deleted", data);
    });

    socket.on("tasks:reorder", (data) => {
      if (!data?.BoardId) return;
      socket.to(`board:${data.BoardId}`).emit("tasks:reordered", data);
    });

    socket.on("tasks:seed", (data) => {
      if (!data?.BoardId) return;
      socket.to(`board:${data.BoardId}`).emit("tasks:seeded", data);
    });

    socket.on("attachment:create", (data) => {
      if (!data?.BoardId) return;
      socket.to(`board:${data.BoardId}`).emit("attachment:created", data);
    });

    socket.on("attachment:delete", (data) => {
      if (!data?.BoardId) return;
      socket.to(`board:${data.BoardId}`).emit("attachment:deleted", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  const broadcast = {
    taskCreated: (BoardId, task) =>
      io.to(`board:${BoardId}`).emit("task:created", task),
    taskUpdated: (BoardId, task) =>
      io.to(`board:${BoardId}`).emit("task:updated", task),
    taskDeleted: (BoardId, id) =>
      io.to(`board:${BoardId}`).emit("task:deleted", { id }),
    tasksReordered: (BoardId, payload) =>
      io.to(`board:${BoardId}`).emit("tasks:reordered", payload),
    tasksSeeded: (BoardId, rows) =>
      io.to(`board:${BoardId}`).emit("tasks:seeded", rows),
    attachmentCreated: (BoardId, att) =>
      io.to(`board:${BoardId}`).emit("attachment:created", att),
    attachmentDeleted: (BoardId, id) =>
      io.to(`board:${BoardId}`).emit("attachment:deleted", { id }),
  };

  return { io, broadcast };
};

module.exports = { initSocket };

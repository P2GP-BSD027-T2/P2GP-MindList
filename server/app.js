const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const cors = require("cors");
const errorHandler = require("./middlewares/error-handler");
const router = require("./routers/route");

const PORT = 3000;
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
    socket.to(`board:${data.BoardId}`).emit("task:created", data);
  });
  socket.on("task:update", (data) => {
    socket.to(`board:${data.BoardId}`).emit("task:updated", data);
  });
  socket.on("task:delete", (data) => {
    socket.to(`board:${data.BoardId}`).emit("task:deleted", data);
  });
  socket.on("tasks:reorder", (data) => {
    socket.to(`board:${data.BoardId}`).emit("tasks:reordered", data);
  });
  socket.on("tasks:seed", (data) => {
    socket.to(`board:${data.BoardId}`).emit("tasks:seeded", data);
  });
  socket.on("attachment:create", (data) => {
    socket.to(`board:${data.BoardId}`).emit("attachment:created", data);
  });
  socket.on("attachment:delete", (data) => {
    socket.to(`board:${data.BoardId}`).emit("attachment:deleted", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(router);

app.use(errorHandler);

httpServer.listen(PORT, () => console.log("Socket server on", PORT));

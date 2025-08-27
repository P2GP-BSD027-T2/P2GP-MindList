const express = require("express");
const { createServer } = require("node:http");
const cors = require("cors");

const { initSocket } = require("./socket/socket");
const errorHandler = require("./middlewares/error-handler");
const router = require("./routers/route");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const httpServer = createServer(app);

const { broadcast } = initSocket(httpServer, {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
});

app.use((req, res, next) => {
  req.broadcast = broadcast;
  next();
});

app.use(router);
app.use(errorHandler);

module.exports = { app, httpServer };

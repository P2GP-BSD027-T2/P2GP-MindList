const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/error-handler");
const router = require("./routers/route");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.use(errorHandler);

module.exports = app;

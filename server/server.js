if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { createServer } = require("node:http");
const app = require("./app");
const { initSocket } = require("./socket/socket");

const httpServer = createServer(app);

const { io, broadcast } = initSocket(httpServer, {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
});

app.set("io", io);
app.set("broadcast", broadcast);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

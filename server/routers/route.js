const express = require("express");
const Board = require("../controllers/board-controller");
const Task = require("../controllers/task-controller");
const Attachment = require("../controllers/attachment-controller");
const User = require("../controllers/user-controller");
const Ai = require("../controllers/ai-controller");
const router = express.Router();

// Users
router.post("/register", User.register);

// Boards
router.post("/boards", Board.upload);
router.get("/boards", Board.upload);
router.post("/boards/join", Board.upload);
router.post("/boards/:id/invite", Board.upload);

// Tasks
router.get("/boards/:id/tasks", Task.Task);
router.post("/boards/:id/tasks", Task.Task);
router.patch("/boards/:id/tasks/:taskId", Task.Task);
router.delete("/boards/:id/tasks/:taskId", Task.Task);
router.put("/boards/:id/tasks/reorder", Task.Task);

// Attachments
router.post("/boards/:id/tasks/:taskId/attachments", Attachment.upload);
router.get("/boards/:id/tasks/:taskId/attachments", Attachment.upload);
router.delete(
  "/boards/:id/tasks/:taskId/attachments/:attachmentId",
  Attachment.upload
);

// AI
router.post("/boards/:id/ai/generate-tasks", Ai.generateTasks);
router.post("/boards/:id/ai/summarize", Ai.summarizeBoard);

module.exports = router;

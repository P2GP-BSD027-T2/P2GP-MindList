const express = require("express");
const UserController = require("../controllers/user-controller");
const BoardController = require("../controllers/board-controller");
const TaskController = require("../controllers/task-controller");
const AttachmentController = require("../controllers/attachment-controller");
const Ai = require("../controllers/ai-controller");

const router = express.Router();

// Users
router.post("/register", UserController.register);

// Boards
router.post("/boards", BoardController.createBoard);
router.get("/boards", BoardController.getAllBoards);
router.post("/boards/join", BoardController.joinBoard);
router.post("/boards/:id/invite", BoardController.getCode);

// Tasks
router.get("/boards/:id/tasks", TaskController.getAllTasks);
router.post("/boards/:id/tasks", TaskController.addTask);
router.patch("/boards/:id/tasks/:taskId", TaskController.editTask);
router.delete("/boards/:id/tasks/:taskId", TaskController.deleteTask);
router.put("/boards/:id/tasks/reorder", TaskController.reorderTasks);

// Attachments
router.post(
  "/boards/:id/tasks/:taskId/attachments",
  AttachmentController.upload
);
router.get(
  "/boards/:id/tasks/:taskId/attachments",
  AttachmentController.upload
);
router.delete(
  "/boards/:id/tasks/:taskId/attachments/:attachmentId",
  AttachmentController.upload
);

// AI
router.post("/boards/:id/ai/generate-tasks", Ai.generateTasks);
router.post("/boards/:id/ai/summarize", Ai.summarizeBoard);

module.exports = router;

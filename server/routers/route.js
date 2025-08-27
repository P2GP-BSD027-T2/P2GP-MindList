const express = require("express");
const UserController = require("../controllers/user-controller");
const BoardController = require("../controllers/board-controller");
const TaskController = require("../controllers/task-controller");
const AttachmentController = require("../controllers/attachment-controller");
const AiController = require("../controllers/ai-controller");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
  upload.single("attachment"),
  AttachmentController.uploadAttachment
);
router.get(
  "/boards/:id/tasks/:taskId/attachments",
  AttachmentController.getAttachment
);
router.delete(
  "/boards/:id/tasks/:taskId/attachments/:attachmentId",
  AttachmentController.deleteAttachment
);

// AI
router.post("/boards/:id/ai/generate-tasks", AiController.AiGenerateTasks);

module.exports = router;

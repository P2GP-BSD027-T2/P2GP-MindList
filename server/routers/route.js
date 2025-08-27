const express = require("express");
const UserController = require("../controllers/user-controller");
const BoardController = require("../controllers/board-controller");
const TaskController = require("../controllers/task-controller");
const AttachmentController = require("../controllers/attachment-controller");
const router = express.Router();

// Users
router.post("/register", UserController.register);

// Boards
router.post("/boards", BoardController.createBoard);
router.get("/boards", BoardController.upload);
router.post("/boards/join", BoardController.upload);
router.post("/boards/:id/invite", BoardController.upload);

// Tasks
router.get("/boards/:id/tasks", TaskController.Task);
router.post("/boards/:id/tasks", TaskController.Task);
router.patch("/boards/:id/tasks/:taskId", TaskController.Task);
router.delete("/boards/:id/tasks/:taskId", TaskController.Task);
router.put("/boards/:id/tasks/reorder", TaskController.Task);

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

module.exports = router;

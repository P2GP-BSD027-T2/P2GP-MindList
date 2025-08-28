// controllers/task-controller.js
const { Task, Attachment } = require("../models");

class TaskController {
  static async getAllTasks(req, res, next) {
    try {
      const { id: BoardId } = req.params;

      const tasks = await Task.findAll({
        where: { BoardId },
        order: [["order", "ASC"]],
        include: { model: Attachment },
      });

      res.status(200).json({ message: "Tasks retrieved successfully", tasks });
    } catch (err) {
      next(err);
    }
  }

  static async addTask(req, res, next) {
    try {
      const io = req.app.get("io");
      const { id: BoardId } = req.params;
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({ message: "EMPTY_TITLE" });
      }
      if (!description) {
        return res.status(400).json({ message: "EMPTY_DESCRIPTION" });
      }

      // DEFAULT status = "todo"
      const lastOrder = await Task.max("order", {
        where: { BoardId, status: "todo" },
      });

      const newTask = await Task.create({
        title,
        description,
        BoardId,
        status: "todo",
        order: (lastOrder || 0) + 1,
      });

      // Broadcast ke semua klien di board tsb
      io?.to(`board:${BoardId}`).emit("task:created", { task: newTask });

      res
        .status(201)
        .json({ message: "Task created successfully", task: newTask });
    } catch (err) {
      next(err);
    }
  }

  static async editTask(req, res, next) {
    try {
      const io = req.app.get("io");
      const { id: BoardId, taskId } = req.params;
      const { title, description, status } = req.body;

      const task = await Task.findOne({ where: { id: taskId, BoardId } });
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Siapkan data update dasar
      const updatedData = {
        title: title ?? task.title,
        description: description ?? task.description,
        status: status ?? task.status,
        order: task.order, // default: pertahankan order lama
      };

      // Jika status berubah, letakkan di urutan terakhir kolom barunya
      if (status && status !== task.status) {
        const lastOrder = await Task.max("order", {
          where: { BoardId, status },
        });
        updatedData.order = (lastOrder || 0) + 1;
      }

      await Task.update(updatedData, { where: { id: taskId, BoardId } });

      const updatedTasks = await Task.findAll({
        where: { BoardId },
        order: [["order", "ASC"]],
      });

      io?.to(`board:${BoardId}`).emit("task:updated", { tasks: updatedTasks });

      res.status(200).json({
        message: "Task updated successfully",
        tasks: updatedTasks,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteTask(req, res, next) {
    try {
      const io = req.app.get("io");
      const { id: BoardId, taskId } = req.params;

      await Task.destroy({ where: { id: taskId, BoardId } });

      const tasks = await Task.findAll({
        where: { BoardId },
        order: [["order", "ASC"]],
      });

      io?.to(`board:${BoardId}`).emit("task:deleted", { tasks });

      res.status(200).json({ message: "Task deleted successfully", tasks });
    } catch (err) {
      next(err);
    }
  }

  static async reorderTasks(req, res, next) {
    try {
      const io = req.app.get("io");
      const { id: BoardId } = req.params;
      const { orderedId, status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "EMPTY_STATUS" });
      }
      if (!Array.isArray(orderedId) || orderedId.length === 0) {
        return res.status(400).json({ message: "EMPTY_ORDER" });
      }

      // Update order berdasarkan urutan id yang dikirim klien (hanya untuk kolom 'status' ini)
      await Promise.all(
        orderedId.map((taskId, index) =>
          Task.update(
            { order: index + 1 },
            { where: { id: taskId, BoardId, status } }
          )
        )
      );

      // Ambil semua tasks untuk memastikan FE selalu konsisten dengan BE
      const all = await Task.findAll({
        where: { BoardId },
        order: [["order", "ASC"]],
      });

      io?.to(`board:${BoardId}`).emit("task:reordered", { tasks: all });

      res.status(200).json({
        message: "Tasks reordered successfully",
        tasks: all,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TaskController;

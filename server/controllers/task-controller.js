const { Task } = require("../models");
class TaskController {
  static async getAllTasks(req, res, next) {
    try {
      const { id: BoardId } = req.params;

      const tasks = await Task.findAll({
        where: { BoardId },
        order: [["order", "ASC"]],
      });

      res.status(200).json({ message: "Tasks retrieved successfully", tasks });
    } catch (err) {
      next(err);
    }
  }

  static async addTask(req, res, next) {
    try {
      const { title, description } = req.body;
      if (!title) {
        return res.status(400).json({ message: "EMPTY_TITLE" });
      }
      if (!description) {
        return res.status(400).json({ message: "EMPTY_DESCRIPTION" });
      }

      const { id: BoardId } = req.params;
      const lastOrder = await Task.max("order", {
        where: { BoardId, status: "todo" },
      });

      const newTask = await Task.create({
        title,
        description,
        BoardId,
        order: (lastOrder || 0) + 1,
      });

      res
        .status(201)
        .json({ message: "Task created successfully", task: newTask });
    } catch (err) {
      next(err);
    }
  }

  static async editTask(req, res, next) {
    try {
      const { id: BoardId, taskId } = req.params;
      const { title, description, status } = req.body;

      const task = await Task.findOne({ where: { id: taskId, BoardId } });
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const updatedData = {
        title: title ?? task.title,
        description: description ?? task.description,
        status: status ?? task.status,
      };

      await Task.update(updatedData, { where: { id: taskId, BoardId } });

      const updatedTasks = await Task.findAll({
        where: { BoardId },
        order: [["order", "ASC"]],
      });

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
      const { id, taskId } = req.params;

      await Task.destroy({
        where: { id: taskId, BoardId: id },
      });

      const tasks = await Task.findAll({
        where: { BoardId: id },
        order: [["order", "ASC"]],
      });

      res.status(200).json({ message: "Task deleted successfully", tasks });
    } catch (err) {
      next(err);
    }
  }

  static async reorderTasks(req, res, next) {
    try {
      const { id: BoardId } = req.params;
      const { orderedId, status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "EMPTY_STATUS" });
      }
      if (!Array.isArray(orderedId) || orderedId.length === 0) {
        return res.status(400).json({ message: "EMPTY_ORDER" });
      }

      const updates = orderedId.map((taskId, index) =>
        Task.update(
          { order: index + 1 },
          { where: { id: taskId, BoardId, status } }
        )
      );
      await Promise.all(updates);

      const updatedTasks = await Task.findAll({
        where: { BoardId, status },
        order: [["order", "ASC"]],
      });

      res.status(200).json({
        message: `Tasks in ${status} reordered successfully`,
        tasks: updatedTasks,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TaskController;

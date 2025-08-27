const { Task } = require("../models");
class TaskController {
  static async getAllTasks(req, res, next) {
    try {
      const { id: BoardId } = req.params;

      const tasks = await Task.findAll({ where: { BoardId } });

      res.status(200).json({ message: "Tasks retrieved successfully", tasks });
    } catch (err) {
      next(err);
    }
  }

  static async Task(req, res, next) {
    try {
      res.status(200).json({ message: "File uploaded successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TaskController;

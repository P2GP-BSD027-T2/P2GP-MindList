class Task {
  static async Task(req, res, next) {
    try {
      res.status(200).json({ message: "File uploaded successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = Task;

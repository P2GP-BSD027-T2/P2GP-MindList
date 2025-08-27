class User {
  static async register(req, res, next) {
    try {
      const { name } = req.body;

      res.status(200).json({ message: "File uploaded successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = User;

const { User } = require("../models/index");
class UserController {
  static async register(req, res, next) {
    try {
      const { name } = req.body;

      const user = await User.create({ name });

      res.status(201).json({ message: "User registered successfully", user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;

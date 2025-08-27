const { generateCode } = require("../helpers/code-generator");
const { User, Board } = require("../models/index");
class BoardController {
  static async createBoard(req, res, next) {
    try {
      const { name, boardName } = req.body;
      if (!name) throw new Error("EMPTY_NAME");

      const user = await User.findOne({ where: { name } });
      if (!user) throw new Error("USER_NOT_FOUND");

      const UserId = user.id;
      const code = generateCode();

      const newBoard = await Board.create({ boardName, UserId, code });

      res
        .status(201)
        .json({ message: "Board created successfully", board: newBoard });
    } catch (err) {
      next(err);
    }
  }
  static async upload(req, res, next) {
    try {
      res.status(200).json({ message: "File uploaded successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BoardController;

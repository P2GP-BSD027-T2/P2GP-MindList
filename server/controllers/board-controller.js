const { generateCode } = require("../helpers/code-generator");
const { User, Board, BoardMember } = require("../models/index");
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
      const newBoardMember = await BoardMember.create({
        BoardId: newBoard.id,
        UserId,
      });

      res
        .status(201)
        .json({ message: "Board created successfully", board: newBoard });
    } catch (err) {
      next(err);
    }
  }

  static async getAllBoards(req, res, next) {
    try {
      const boards = await Board.findAll();
      res
        .status(200)
        .json({ message: "Boards retrieved successfully", boards });
    } catch (err) {
      next(err);
    }
  }

  static async joinBoard(req, res, next) {
    try {
      const { code, name } = req.body;

      const board = await Board.findOne({ where: { code } });
      if (!board) throw new Error("BOARD_NOT_FOUND");

      const user = await User.findOne({ where: { name } });
      if (!user) throw new Error("USER_NOT_FOUND");

      await BoardMember.create({
        BoardId: board.id,
        UserId: user.id,
      });

      res.status(200).json({
        message: "User added to board",
        data: { id: user.id, name: user.name, BoardId: board.id },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCode(req, res, next) {
    try {
      const { id } = req.params;

      const board = await Board.findByPk(+id);
      if (!board) throw new Error("BOARD_NOT_FOUND");

      const code = board.code;

      res.status(200).json({ code: code });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BoardController;

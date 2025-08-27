const { aiGenerateTasks, aiSummarizeBoard } = require("./mockai-controller");
const { Task } = require("../models");

const AiGenerateTasks = async (req, res) => {
  try {
    const BoardId = Number(req.params.id);
    const { title, description } = req.body || {};
    if (!BoardId) return res.status(400).json({ message: "BoardId invalid" });

    let row;

    if (title) {
      let desc = description ?? null;
      if (!desc) {
        const tasks = await Task.findAll({ where: { BoardId }, raw: true });
        desc = await aiSummarizeBoard(BoardId, tasks);
      }
      row = { BoardId, title: String(title), description: desc };
    } else {
      row = await aiGenerateTasks({ BoardId });
    }

    try {
      req.broadcast?.tasksSeeded?.(BoardId, [{ id: Date.now(), ...row }]);
    } catch {}

    return res.status(201).json({
      BoardId: row.BoardId,
      title: row.title,
      description: row.description,
    });
  } catch (err) {
    console.error("[AI/custom] generate failed:", err);
    return res.status(500).json({ message: "AI generate failed" });
  }
};

module.exports = { AiGenerateTasks };

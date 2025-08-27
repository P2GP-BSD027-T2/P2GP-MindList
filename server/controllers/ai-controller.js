const { aiGenerateTasks, aiSummarizeBoard } = require("../controllers/mockai-controller");
const { Task } = require("../models"); // pastikan model Task ada & field-nya: { title, description, status, order, BoardId }

const generateTasks = async (req, res) => {
  try {
    const BoardId = Number(req.params.id);
    const { prompt = "" } = req.body;

    const aiRows = await aiGenerateTasks({ prompt, BoardId });

    const payload = aiRows.map(task => ({
      BoardId,
      title: task.title,
      description: task.description ?? null,
      status: task.status,
      order: task.order ?? 0,
    }));

    const created = await Task.bulkCreate(payload, { returning: true });

    req.broadcast.tasksSeeded(BoardId, created);

    res.status(201).json({ rows: created });
  } catch (err) {
    console.error("AI generate failed:", err);
    res.status(500).json({ message: "AI generate failed" });
  }
};

const summarizeBoard = async (req, res) => {
  try {
    const BoardId = Number(req.params.id);

    const rows = await Task.findAll({
      where: { BoardId },
      attributes: ["status"],
      raw: true,
    });

    const counts = {
      todo: rows.filter(r => r.status === "todo").length,
      doing: rows.filter(r => r.status === "doing").length,
      done: rows.filter(r => r.status === "done").length,
    };

    const summary = await aiSummarizeBoard({ counts, BoardId });
    res.json({ summary, counts });
  } catch (err) {
    console.error("AI summarize failed:", err);
    res.status(500).json({ message: "AI summarize failed" });
  }
};

module.exports = { generateTasks, summarizeBoard };

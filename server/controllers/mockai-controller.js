let useGemini = !!process.env.GEMINI_API_KEY;
// let GoogleGenAI, ai;

const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

try {
  if (useGemini) {
    ({ GoogleGenAI } = require("@google/genai"));
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch {
  useGemini = false;
}

const mockOne = (BoardId) => [
  {
    BoardId,
    title: "Siapkan rilis awal (auth basic, CRUD, deploy)",
    description: null,
  },
];

const aiGenerateTasks = async ({ BoardId }) => {
  if (!useGemini) return mockOne(BoardId);
  try {
    const sys = `Keluarkan PERSIS 1 item array JSON tugas:
[
  {"title":"", "description":"(optional)"}
]`;
    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: sys }] }],
    });

    const text =
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let parsed = [];
    try {
      parsed = JSON.parse(text);
    } catch {
      return mockOne(BoardId);
    }

    const t = parsed[0] || {};
    return {
      BoardId,
      title: t.title || "Task awal",
      description: t.description || null,
    };
  } catch {
    return mockOne(BoardId);
  }
};

const aiSummarizeBoard = async (BoardId, tasks) => {
  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    doing: tasks.filter((t) => t.status === "doing").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const prompt = `Buat deskripsi singkat progres Board #${BoardId}.
  - Todo: ${counts.todo}
  - Doing: ${counts.doing}
  - Done: ${counts.done}
  Ringkas dalam 1 kalimat.`;

  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  return resp.response.candidates[0].content.parts[0].text;
};

module.exports = { aiSummarizeBoard, aiGenerateTasks };

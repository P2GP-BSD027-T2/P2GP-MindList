const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const aiGenerateTasks = async ({ prompt, BoardId }) => {
  const model = "gemini-2.5-flash";
  const sys = `Keluarkan array JSON tugas:
  [
    {"title":"", "description":"(optional)", "status":"todo|doing|done"}
  ]`;

  const resp = await ai.models.generateContent({
    model,
    contents: [
      { role: "user", parts: [{ text: `${sys}\n\nPrompt: ${prompt}` }] },
    ],
  });

  const text = resp.response.candidates[0].content.parts[0].text;
  let parsed = [];
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('JSON parsing error:', error);
    parsed = [];
  }

  return parsed.map((t, i) => ({
    id: Date.now() + i + 1,
    BoardId,
    title: t.title || "Untitled",
    description: t.description || null,
    status: ["todo", "doing", "done"].includes(t.status) ? t.status : "todo",
    order: i,
  }));
};

const aiSummarizeBoard = async ({ counts, BoardId }) => {
  const prompt = `Ringkas progres board #${BoardId}: todo=${counts.todo}, doing=${counts.doing}, done=${counts.done}.`;
  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  return resp.response.candidates[0].content.parts[0].text;
};

module.exports = { aiGenerateTasks, aiSummarizeBoard };

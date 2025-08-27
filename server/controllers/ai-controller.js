const GoogleGenAI  = require("@google/genai");

const AiGenerateTasks = async () => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const response = await ai.generateContent({
    model: process.env.GEMINI_MODEL,
    messages: [
      {
        role: "user",
        content: "Buatkan saya daftar tugas untuk proyek baru",
      },
    ],
  });
  console.log(response);
};

module.exports = {
  AiGenerateTasks,
};

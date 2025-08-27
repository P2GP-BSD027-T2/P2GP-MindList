const { GoogleGenerativeAI } = require("@google/generative-ai");

const AiGenerateTasks = async (req, res) => {
  let parsedData;
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const prompt = `Generate a todo list for project: "${title}".

Create a simple task breakdown that can be used in a Trello-like board.

Return ONLY valid JSON in this format:
{
  "tasks": [
    "Task 1 - specific action item",
    "Task 2 - specific action item", 
    "Task 3 - specific action item"
    ],
    "descriptions": [
    "Task 1 - Description",
    "Task 2 - Description",
    "Task 3 - Description"
    ]
  };

Requirements:
- 1-5 simple, actionable tasks
- Each task should be one clear action
- Each task should have a description
- Organize from start to finish
- Keep tasks short and specific
- No extra formatting or explanation`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Improved JSON parsing
    try {
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/^\s*```\s*/, "")
        .replace(/\s*```\s*$/, "")
        .trim();
      
      parsedData = JSON.parse(cleanText);
      
      // Validate required fields
      if (!parsedData.tasks || !Array.isArray(parsedData.tasks)) {
        throw new Error("Invalid tasks array in response");
      }
      
      if (!parsedData.descriptions || !Array.isArray(parsedData.descriptions)) {
        throw new Error("Invalid descriptions array in response");
      }
      
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      console.error("Raw AI response:", text);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response",
        error: parseError.message,
      });
    }

    res.status(200).json({
      BoardId: id,
      title,
      tasks: parsedData.tasks,
      descriptions: parsedData.descriptions,
    });
  } catch (error) {
    console.error("Error generating tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate tasks",
      error: error.message,
    });
  }
};

module.exports = {
  AiGenerateTasks,
};
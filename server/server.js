import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// ✅ Load .env from ROOT (outside server folder)
dotenv.config({ path: "../.env" });

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Check API key (safety)
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found in .env");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

app.post("/ask", async (req, res) => {
  try {
    const input = req.body.input;

    // ✅ Validation
    if (!input) {
      return res.status(400).json({ answer: "Please provide input" });
    }

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are Jarvis AI. Give short, clean, smart answers. Never include links.",
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    res.json({
      answer: response.choices[0].message.content,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);

    res.status(500).json({
      answer: "AI error occurred",
    });
  }
});

// ✅ Use dynamic port (for deployment also)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
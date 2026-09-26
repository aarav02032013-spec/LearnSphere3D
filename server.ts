import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generateLocalLumiResponse } from './src/components/StudyBuddy/lumiKnowledgeEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

app.post('/api/study-buddy/chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      subject = 'All Subjects',
      gradeBand = 'Classes 6–12',
      studyMode = 'explain',
    } = req.body as {
      message?: string;
      history?: ChatHistoryItem[];
      subject?: string;
      gradeBand?: string;
      studyMode?: 'explain' | 'solver' | 'exam' | 'quiz';
    };

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Please enter a study question for Lumi.' });
      return;
    }

    const modeInstructions: Record<string, string> = {
      explain:
        'Mode: Explain Simply. Break down the concept clearly using vivid everyday analogies, structured bullet points, and a short "Lumi’s Memory Trick" at the end.',
      solver:
        'Mode: Step-by-Step Problem Solver. State the given values, the exact formula to use, substitute the numbers step-by-step with units, and highlight the final answer clearly.',
      exam:
        'Mode: Exam & NCERT Revision Coach. Focus on high-yield NCERT textbook definitions, key diagram labels, common exam pitfalls to avoid, and a crisp summary.',
      quiz:
        'Mode: Interactive Quiz Coach. If the student is asking to be quizzed, ask 1 engaging conceptual or numerical question at a time and give a small hint. If they are answering your previous question, warmly evaluate their answer, explain why it is right or how to fix it, and offer the next question.',
    };

    const systemInstruction = `You are Lumi, a warm, encouraging, and super-smart pocket study buddy inside "LearnSphere 3D" (an interactive STEM & NCERT 3D learning platform for Classes 6–12 covering Biology, Chemistry, Physics, Atomic Foundation, and Mathematics).

Your personality & tone:
- Friendly, curious, supportive, and scholarly—like an encouraging study owl/starlight companion who loves making tough topics click.
- Never robotic or overwhelming. Use clear headings, bullet points, and bold key terms so students can scan and revise easily.
- Current Subject Focus: ${subject}.
- Target Grade Level: ${gradeBand}.
- ${modeInstructions[studyMode] || modeInstructions.explain}

Formatting guidelines:
- Use clean Markdown (**bold** for key terms, bullet lists for steps, and \`inline code\` for formulas/equations like \`F = I * L * B\` or \`pH = -log[H+]\`).
- Include a short "Lumi's Study Tip:" or "Memory Trick:" line when helpful for retention.`;

    const ai = getGenAIClient();

    const contents = [
      ...history.slice(-10).map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: message.trim() }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm here and ready to help you study! Could you rephrase that question?";
    res.json({ reply: replyText });
  } catch (error: unknown) {
    console.warn('Gemini API unavailable in /api/study-buddy/chat, using built-in Lumi knowledge engine:', error);
    const {
      message = '',
      history = [],
      subject = 'All Subjects',
      gradeBand = 'Classes 9–10',
      studyMode = 'explain',
    } = (req.body || {}) as {
      message?: string;
      history?: ChatHistoryItem[];
      subject?: string;
      gradeBand?: string;
      studyMode?: 'explain' | 'solver' | 'exam' | 'quiz';
    };
    const fallbackReply = generateLocalLumiResponse({
      message: String(message),
      history: Array.isArray(history) ? history : [],
      subject,
      gradeBand,
      studyMode,
    });
    res.json({ reply: fallbackReply });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LearnSphere 3D server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

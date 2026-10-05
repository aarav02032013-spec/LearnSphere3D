import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function cleanTexSymbols(tex: string, preserveNewlines = false): string {
  let s = tex
    .replace(/\$\$/g, '')
    .replace(/\\tag\{[^}]*\}/g, '')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^{}]*)\}/g, '$1')
    .replace(/\\mathbf\{([^{}]*)\}/g, '$1')
    .replace(/\\left\s*([()[\]|])/g, '$1')
    .replace(/\\right\s*([()[\]|])/g, '$1')
    .replace(/\\left|\\right/g, '');

  const supMap: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', n: 'ⁿ'
  };
  const subMap: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋'
  };

  s = s
    .replace(/\^\{([0-9+-n]+)\}/g, (_m, exp: string) =>
      exp.split('').map((c) => supMap[c] || c).join('')
    )
    .replace(/\^([0-9])/g, (_m, d: string) => supMap[d] || `^${d}`)
    .replace(/\^\{([^{}]+)\}/g, '^($1)')
    .replace(/_\{([0-9+-]+)\}/g, (_m, sub: string) =>
      sub.split('').map((c) => subMap[c] || c).join('')
    )
    .replace(/_([0-9])/g, (_m, d: string) => subMap[d] || `_${d}`)
    .replace(/_\{([^{}]+)\}/g, '_$1');

  for (let i = 0; i < 4; i++) {
    s = s.replace(/\\[dt]?frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (_m, num: string, den: string) => {
      const n = num.trim();
      const d = den.trim();
      if (n === '1' && d === '2') return '½';
      if (n === '1' && d === '3') return '⅓';
      if (n === '1' && d === '4') return '¼';
      if (n === '3' && d === '4') return '¾';
      const nWrap = /[+\-*/\s]/.test(n) ? `(${n})` : n;
      const dWrap = /[+\-*/\s]/.test(d) || d.length > 1 ? `(${d})` : d;
      return `${nWrap} / ${dWrap}`;
    });
  }

  s = s
    .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\mp/g, '∓')
    .replace(/\\leq|\\le/g, '≤')
    .replace(/\\geq|\\ge/g, '≥')
    .replace(/\\neq|\\ne/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\propto/g, '∝')
    .replace(/\\infty/g, '∞')
    .replace(/\\rightarrow|\\to|\\longrightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\rightleftharpoons/g, '⇌')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\nu/g, 'ν')
    .replace(/\\pi/g, 'π')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\,/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\quad|\\qquad/g, '  ');

  if (!preserveNewlines) {
    s = s.replace(/\s+/g, ' ').trim();
  }
  return s;
}

function cleanAIMathFormatting(raw: string): string {
  if (!raw) return '';

  let out = raw
    .replace(/`\s*\$\$\s*([\s\S]*?)\s*\$\$\s*`/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``)
    .replace(/`\s*\$\s*([^$`\n]+?)\s*\$\s*`/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``)
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_m, inner) => `\n- \`${cleanTexSymbols(inner)}\`\n`)
    .replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``)
    .replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``)
    .replace(/\$([^$\n]+?)\$/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``);

  out = out.replace(/`([^`\n]+)`/g, (_m, inner) => `\`${cleanTexSymbols(inner)}\``);
  if (/\\(?:d?frac|sqrt|times|cdot|text|left|right|alpha|beta|gamma|theta|Delta|pi|Omega)/.test(out)) {
    out = cleanTexSymbols(out, true);
  }

  return out.replace(/\n{3,}/g, '\n\n').trim();
}

function buildValidGeminiContents(
  history: Array<{ role: 'user' | 'model'; text: string }>,
  currentMessage: string
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const normalized: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const turn of history.slice(-8)) {
    const cleanText = (turn.text || '').trim().slice(0, 800);
    if (!cleanText) continue;
    const role: 'user' | 'model' = turn.role === 'model' ? 'model' : 'user';

    if (normalized.length === 0) {
      if (role === 'model') continue;
      normalized.push({ role, parts: [{ text: cleanText }] });
    } else {
      const prev = normalized[normalized.length - 1];
      if (prev.role === role) {
        prev.parts[0].text = `${prev.parts[0].text}\n\n${cleanText}`.slice(0, 1000);
      } else {
        normalized.push({ role, parts: [{ text: cleanText }] });
      }
    }
  }

  if (normalized.length > 0 && normalized[normalized.length - 1].role === 'user') {
    normalized.pop();
  }

  normalized.push({
    role: 'user',
    parts: [{ text: currentMessage.trim() }]
  });

  return normalized;
}

app.use(express.json({ limit: '2mb' }));

// Allow CORS for GitHub Pages / static frontend origins
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

function getGenAIClient(apiKey: string) {
  return new GoogleGenAI({
    apiKey,
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
- Use clean Markdown (**bold** for key terms, bullet lists for steps, and \`inline code\` for formulas/equations like \`s = (v² - u²) / (2a)\` or \`pH = -log[H+]\`).
- Do NOT use raw LaTeX delimiters like $$...$$, $...$, \\(...\\), \\[...\\], or \\frac{a}{b}. Write formulas using clean Unicode symbols inside backticks.
- Include a short "Lumi's Study Tip:" or "Memory Trick:" line when helpful for retention.`;

    const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured; using built-in Lumi knowledge engine');
    }

    const ai = getGenAIClient(apiKey);
    const contents = buildValidGeminiContents(history, message.trim());
    const modelsToTry = [
      'gemini-flash-latest',
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ];
    let replyText = '';

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        if (response.text && response.text.trim()) {
          replyText = response.text.trim();
          break;
        }
      } catch (modelErr) {
        console.warn(`Model ${modelName} failed, trying next:`, modelErr);
      }
    }

    if (!replyText) {
      throw new Error('All Gemini models temporarily unavailable');
    }

    res.json({ reply: cleanAIMathFormatting(replyText) });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Gemini API temporarily unavailable';
    console.warn('/api/study-buddy/chat service message:', errorMsg);
    res.status(503).json({
      error: errorMsg,
    });
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

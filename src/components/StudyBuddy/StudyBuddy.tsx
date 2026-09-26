import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  BookmarkPlus,
  Copy,
  Check,
  Trash2,
  BookOpen,
  Calculator,
  Award,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { NoteItem } from '../../types';
import { generateLocalLumiResponse } from './lumiKnowledgeEngine';

export interface StudyChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  subject?: string;
  mode?: string;
}

interface StudyBuddyProps {
  onAddNote: (
    title: string,
    subject: NoteItem['subject'],
    content: string,
    tags: string[],
    labRef: string
  ) => void;
}

const STORAGE_KEY = 'learnsphere_lumi_chat_v2';

const INITIAL_WELCOME_MESSAGE: StudyChatMessage = {
  id: 'lumi_welcome_1',
  role: 'model',
  timestamp: Date.now(),
  subject: 'All Subjects',
  mode: 'Explain Simply',
  text: `Hi there! I'm **Lumi**, your pocket study owl and science companion! 🦉✨

Whether you're revising **NCERT 3D diagrams** (like the *Human Digestive System* or the *Electric Motor*), solving **Physics & Chemistry numericals**, or planning your exam revision schedule, I'm here to help you step by step.

**How we can study together:**
- **Explain Simply**: Ask me any tough topic and I'll break it down with everyday analogies and memory tricks.
- **Step-by-Step Solver**: Paste a Physics, Chemistry, or Math problem for a complete worked solution with formulas and units.
- **Exam & Revision Coach**: Get high-yield NCERT key points, definitions, and common exam pitfalls.
- **Quiz Me!**: Test your mastery with interactive one-on-one practice questions.

What are we studying today?`
};

const QUICK_PROMPTS = [
  {
    category: 'Physics',
    prompt: "Explain Fleming's Left-Hand Rule and how the split-ring commutator works in an Electric Motor.",
    mode: 'explain' as const
  },
  {
    category: 'Biology',
    prompt: 'Walk me through the Human Digestive System (Fig. 2.11)—what happens in the stomach, duodenum, and small intestine?',
    mode: 'exam' as const
  },
  {
    category: 'Chemistry',
    prompt: 'How do periodic trends (Atomic Radius, Ionization Energy, Electronegativity) change across a period and down a group?',
    mode: 'explain' as const
  },
  {
    category: 'Physics',
    prompt: 'A projectile is launched at 20 m/s at an angle of 30° to the horizontal. Find its maximum height and horizontal range (g = 9.8 m/s²).',
    mode: 'solver' as const
  },
  {
    category: 'Biology',
    prompt: 'Explain the counter-current mechanism in a Human Nephron and why the Loop of Henle is critical.',
    mode: 'explain' as const
  },
  {
    category: 'Chemistry',
    prompt: 'Quiz me on Acids, Bases, Salts, and pH scale calculations!',
    mode: 'quiz' as const
  },
  {
    category: 'Study Tips',
    prompt: 'Help me build an effective 3-hour active recall study routine for my Science & Math board exams.',
    mode: 'exam' as const
  }
];

// Cute SVG Mascot Component for Lumi the Pocket Study Owl
const LumiMascotAvatar: React.FC<{ isThinking?: boolean; size?: 'sm' | 'lg' }> = ({
  isThinking = false,
  size = 'lg'
}) => {
  const dimensions = size === 'lg' ? 'w-14 h-14' : 'w-9 h-9';
  return (
    <div
      className={`relative ${dimensions} rounded-2xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-emerald-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-lg`}
    >
      <svg
        viewBox="0 0 64 64"
        className={`w-4/5 h-4/5 ${isThinking ? 'animate-pulse' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glowing Star Antenna */}
        <line x1="32" y1="6" x2="32" y2="14" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
        <circle
          cx="32"
          cy="5"
          r="3.5"
          fill={isThinking ? '#facc15' : '#22d3ee'}
        />
        {/* Cute Owl Ear Tufts */}
        <path d="M16 20 L12 12 L22 16 Z" fill="#0891b2" />
        <path d="M48 20 L52 12 L42 16 Z" fill="#0891b2" />
        {/* Round Owl Body */}
        <ellipse cx="32" cy="36" rx="20" ry="19" fill="#0e7490" stroke="#22d3ee" strokeWidth="2" />
        {/* Soft Cream Belly Patch */}
        <ellipse cx="32" cy="41" rx="13" ry="11" fill="#cffafe" opacity="0.9" />
        {/* Belly Feather Chevrons */}
        <path d="M27 39 L29 41 L31 39" stroke="#0891b2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M33 39 L35 41 L37 39" stroke="#0891b2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 44 L32 46 L34 44" stroke="#0891b2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        {/* Big Expressive Eyes + Study Glasses */}
        <circle cx="24" cy="28" r="6.5" fill="#ffffff" stroke="#fbbf24" strokeWidth="2.2" />
        <circle cx="40" cy="28" r="6.5" fill="#ffffff" stroke="#fbbf24" strokeWidth="2.2" />
        {/* Glasses Bridge */}
        <line x1="30.5" y1="28" x2="33.5" y2="28" stroke="#fbbf24" strokeWidth="2.2" />
        {/* Pupils */}
        <circle cx={isThinking ? '25' : '24.5'} cy={isThinking ? '26.5' : '28'} r="3.2" fill="#0f172a" />
        <circle cx={isThinking ? '41' : '39.5'} cy={isThinking ? '26.5' : '28'} r="3.2" fill="#0f172a" />
        {/* Eye Sparkles */}
        <circle cx="23" cy="26.5" r="1.2" fill="#ffffff" />
        <circle cx="38" cy="26.5" r="1.2" fill="#ffffff" />
        {/* Little Golden Beak */}
        <polygon points="30,31 34,31 32,35" fill="#f59e0b" />
        {/* Rosy Cheeks */}
        <ellipse cx="16.5" cy="32" rx="2.5" ry="1.5" fill="#f472b6" opacity="0.7" />
        <ellipse cx="47.5" cy="32" rx="2.5" ry="1.5" fill="#f472b6" opacity="0.7" />
        {/* Little Feet */}
        <ellipse cx="25" cy="55" rx="3.5" ry="2" fill="#f59e0b" />
        <ellipse cx="39" cy="55" rx="3.5" ry="2" fill="#f59e0b" />
      </svg>
    </div>
  );
};

// Clean Markdown-lite Renderer for Lumi's Study Responses
const FormattedStudyText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  const renderInline = (line: string) => {
    // Handle `code` and **bold** and *italic*
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-950 border border-slate-700/80 font-mono text-xs text-cyan-300"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={idx} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={idx} className="italic text-cyan-200">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-200">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-1" />;
        }
        if (line.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-cyan-300 pt-2">
              {renderInline(line.slice(4))}
            </h4>
          );
        }
        if (line.startsWith('## ') || line.startsWith('# ')) {
          const clean = line.replace(/^#+\s*/, '');
          return (
            <h3 key={idx} className="text-base font-bold text-white pt-2 border-b border-slate-800/80 pb-1">
              {renderInline(clean)}
            </h3>
          );
        }
        if (
          line.toLowerCase().startsWith("lumi's study tip") ||
          line.toLowerCase().startsWith('lumi’s study tip') ||
          line.toLowerCase().startsWith("lumi's memory trick") ||
          line.toLowerCase().startsWith('lumi’s memory trick') ||
          line.toLowerCase().startsWith('memory trick:') ||
          line.toLowerCase().startsWith('study tip:')
        ) {
          return (
            <div
              key={idx}
              className="p-3 my-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-100 flex items-start gap-2.5 text-xs leading-relaxed"
            >
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>{renderInline(line)}</div>
            </div>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-cyan-400 font-bold mt-0.5">•</span>
              <span className="flex-1">{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        const numMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="font-mono text-xs font-bold text-cyan-400 mt-0.5 min-w-[18px]">
                {numMatch[1]}.
              </span>
              <span className="flex-1">{renderInline(numMatch[2])}</span>
            </div>
          );
        }
        return <p key={idx}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

export const StudyBuddy: React.FC<StudyBuddyProps> = ({ onAddNote }) => {
  const [messages, setMessages] = useState<StudyChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const [subject, setSubject] = useState<
    'All Subjects' | 'Physics' | 'Chemistry' | 'Biology' | 'Mathematics' | 'Study Tips'
  >('All Subjects');
  const [gradeBand, setGradeBand] = useState<'Classes 6–8' | 'Classes 9–10' | 'Classes 11–12'>(
    'Classes 9–10'
  );
  const [studyMode, setStudyMode] = useState<'explain' | 'solver' | 'exam' | 'quiz'>('explain');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNoteIds, setSavedNoteIds] = useState<string[]>([]);

  // Built-in Pomodoro Focus Timer in Lumi's Study Corner
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const studyModes = [
    {
      id: 'explain',
      label: 'Explain Simply',
      icon: BookOpen,
      desc: 'Analogies & memory tricks'
    },
    {
      id: 'solver',
      label: 'Step-by-Step Solver',
      icon: Calculator,
      desc: 'Formulas, steps & units'
    },
    {
      id: 'exam',
      label: 'Exam & NCERT Coach',
      icon: Award,
      desc: 'High-yield board points'
    },
    {
      id: 'quiz',
      label: 'Quiz Me!',
      icon: HelpCircle,
      desc: 'Interactive practice Q&A'
    }
  ] as const;

  const sendQuestionToLumi = async (questionText: string, overrideMode?: typeof studyMode) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const activeMode = overrideMode || studyMode;
    if (overrideMode) {
      setStudyMode(overrideMode);
    }

    const modeLabel = studyModes.find((m) => m.id === activeMode)?.label || 'Explain Simply';

    const userMsg: StudyChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
      subject,
      mode: modeLabel
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setErrorMsg(null);
    setLastFailedPrompt(null);
    setIsLoading(true);

    const historyPayload = messages
      .filter((m) => m.id !== 'lumi_welcome_1')
      .slice(-10)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      let replyText: string | null = null;
      const isStaticGitHubPages =
        typeof window !== 'undefined' &&
        (window.location.hostname.includes('github.io') ||
          window.location.protocol === 'file:');

      if (!isStaticGitHubPages) {
        try {
          const response = await fetch('/api/study-buddy/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify({
              message: trimmed,
              history: historyPayload,
              subject,
              gradeBand,
              studyMode: activeMode
            })
          });

          const contentType = (response.headers.get('content-type') || '').toLowerCase();
          const rawText = await response.text();
          const trimmedRaw = rawText.trim();

          if (
            response.ok &&
            contentType.includes('application/json') &&
            trimmedRaw.startsWith('{')
          ) {
            const data = JSON.parse(trimmedRaw);
            if (data && typeof data.reply === 'string' && data.reply.trim()) {
              replyText = data.reply;
            }
          }
        } catch {
          // Static host or offline — fall through to Lumi's built-in NCERT & STEM engine
        }
      }

      if (!replyText) {
        await new Promise((resolve) => setTimeout(resolve, 320));
        replyText = generateLocalLumiResponse({
          message: trimmed,
          history: historyPayload,
          subject,
          gradeBand,
          studyMode: activeMode
        });
      }

      const lumiMsg: StudyChatMessage = {
        id: `lumi_${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: Date.now(),
        subject,
        mode: modeLabel
      };

      setMessages((prev) => [...prev, lumiMsg]);
    } catch {
      const fallbackText = generateLocalLumiResponse({
        message: trimmed,
        history: historyPayload,
        subject,
        gradeBand,
        studyMode: activeMode
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `lumi_${Date.now()}`,
          role: 'model',
          text: fallbackText,
          timestamp: Date.now(),
          subject,
          mode: modeLabel
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestionToLumi(input);
  };

  const handleCopyMessage = (msg: StudyChatMessage) => {
    navigator.clipboard?.writeText(msg.text);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToNotes = (msg: StudyChatMessage, idx: number) => {
    // Find preceding user question for a meaningful note title
    const prevUserMsg = [...messages.slice(0, idx)].reverse().find((m) => m.role === 'user');
    const rawTitle = prevUserMsg
      ? `Lumi Study Note: ${prevUserMsg.text.slice(0, 52)}${prevUserMsg.text.length > 52 ? '...' : ''}`
      : `Lumi Study Guide (${msg.subject || subject})`;

    const mappedSubject: NoteItem['subject'] =
      msg.subject === 'Physics'
        ? 'Physics'
        : msg.subject === 'Chemistry'
        ? 'Chemistry'
        : msg.subject === 'Biology'
        ? 'Biology'
        : 'General';

    onAddNote(
      rawTitle,
      mappedSubject,
      msg.text,
      ['Lumi Study Buddy', msg.subject || subject, gradeBand],
      'Ask Lumi — Study Companion'
    );
    setSavedNoteIds((prev) => (prev.includes(msg.id) ? prev : [...prev, msg.id]));
  };

  const handleClearChat = () => {
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        timestamp: Date.now()
      }
    ]);
    setErrorMsg(null);
    setLastFailedPrompt(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Meet Lumi + Study Mode & Context Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <LumiMascotAvatar isThinking={isLoading} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                Lumi — Your Pocket Study Buddy
              </h1>
              <span className="text-xs text-cyan-300 font-medium">
                · {isLoading ? 'Lumi is thinking...' : 'Ready to help you study'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Ask any question on NCERT Biology, Chemistry, Physics, Atomic Structure, Mathematics, or study strategies. Save any explanation directly to your Notes with one click.
            </p>
          </div>
        </div>

        {/* Grade & Subject Context Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
            {(['Classes 6–8', 'Classes 9–10', 'Classes 11–12'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGradeBand(g)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  gradeBand === g
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Start a fresh study chat"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Workspace: Left Study Sidebar (4 cols) + Right Chat Area (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Study Mode, Subject Filter, Quick Starters, & Focus Timer */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Lumi's Study Mode Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">01. Choose Lumi&apos;s Coaching Style</h2>
              <span className="text-xs text-slate-400">{studyModes.find((m) => m.id === studyMode)?.label}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {studyModes.map((mode) => {
                const Icon = mode.icon;
                const active = studyMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setStudyMode(mode.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        active ? 'bg-cyan-500/25 text-cyan-300' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{mode.label}</div>
                      <div className="text-[11px] text-slate-400 truncate">{mode.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Subject Filter + Curated Starter Questions */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">02. Subject Focus & Quick Prompts</h2>
            <div className="flex flex-wrap gap-1.5">
              {(
                ['All Subjects', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Study Tips'] as const
              ).map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSubject(subj)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    subject === subj
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-1 max-h-64 overflow-y-auto pr-1">
              {QUICK_PROMPTS.filter(
                (q) => subject === 'All Subjects' || q.category === subject
              ).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => sendQuestionToLumi(item.prompt, item.mode)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/30 transition-all group cursor-pointer disabled:opacity-50"
                >
                  <div className="text-[11px] text-cyan-400 font-medium mb-0.5">
                    {item.category} · {studyModes.find((m) => m.id === item.mode)?.label}
                  </div>
                  <div className="text-xs text-slate-300 group-hover:text-white line-clamp-2">
                    &ldquo;{item.prompt}&rdquo;
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Lumi's 25-Min Pomodoro Study Timer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">03. Lumi&apos;s Focus Timer</h2>
                <p className="text-[11px] text-slate-400">Pomodoro session while you revise</p>
              </div>
              <span className="font-mono text-xl font-bold text-cyan-300 tabular-nums">
                {formatTimer(timerSeconds)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTimerRunning((prev) => !prev)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-xs font-semibold text-cyan-200 transition-colors cursor-pointer"
              >
                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{timerRunning ? 'Pause Focus' : 'Start Focus'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(25 * 60);
                }}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset 25:00"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Study Conversation with Lumi */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col h-[680px] overflow-hidden">
          {/* Chat Messages Scroll Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg, index) => {
              const isLumi = msg.role === 'model';
              const isCopied = copiedId === msg.id;
              const isSaved = savedNoteIds.includes(msg.id);

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3.5 ${isLumi ? 'justify-start' : 'justify-end'}`}
                >
                  {isLumi && <LumiMascotAvatar size="sm" />}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      isLumi
                        ? 'bg-slate-950/90 border border-slate-800/90 text-slate-100'
                        : 'bg-cyan-600/25 border border-cyan-500/40 text-white'
                    }`}
                  >
                    {/* Quiet inline metadata header */}
                    <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400 mb-2">
                      <span>
                        {isLumi ? 'Lumi · Study Owl' : 'You'}
                        {msg.subject ? ` · ${msg.subject}` : ''}
                        {msg.mode ? ` · ${msg.mode}` : ''}
                      </span>
                      <span className="font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Message Body */}
                    {isLumi ? (
                      <FormattedStudyText text={msg.text} />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}

                    {/* Action Bar for Lumi's Study Responses */}
                    {isLumi && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveToNotes(msg, index)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/30 text-cyan-300'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Saved to Notes</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3 h-3" />
                              <span>Save to Study Notes</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking state */}
            {isLoading && (
              <div className="flex items-start gap-3.5">
                <LumiMascotAvatar isThinking size="sm" />
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-300 flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span>Lumi is flipping through her study notes for you...</span>
                </div>
              </div>
            )}

            {/* Propagated Server / API Error Banner with Retry */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                {lastFailedPrompt && (
                  <button
                    type="button"
                    onClick={() => sendQuestionToLumi(lastFailedPrompt)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-100 font-medium shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Composer Footer */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3.5 sm:p-4 bg-slate-950/90 border-t border-slate-800 flex items-end gap-3"
          >
            <div className="flex-1">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendQuestionToLumi(input);
                  }
                }}
                placeholder={`Ask Lumi anything about ${subject === 'All Subjects' ? 'Science, Math, or Studying' : subject} (${gradeBand})...`}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500/60 focus:outline-none px-3.5 py-2.5 text-sm text-white placeholder-slate-500 resize-none"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 px-1">
                <span>
                  Active Mode: <strong className="text-cyan-300">{studyModes.find((m) => m.id === studyMode)?.label}</strong> · {subject} · {gradeBand}
                </span>
                <span className="hidden sm:inline">Press Enter to send · Shift+Enter for new line</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed mb-5"
            >
              <span>Ask Lumi</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

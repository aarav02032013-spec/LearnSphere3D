import React, { useState, useMemo } from 'react';
import { 
  NCERT_DIAGRAMS, 
  NCERTDiagramItem, 
  NCERTClassGrade, 
  NCERTSubject 
} from '../../data/ncertDiagramsData';
import { Pinpoint } from '../../types';
import { NCERT3DCanvas } from './NCERT3DCanvas';
import confetti from 'canvas-confetti';
import { 
  BookOpen, 
  Search, 
  Layers, 
  Eye, 
  RotateCcw, 
  Play, 
  Pause, 
  CheckCircle2, 
  HelpCircle, 
  Award, 
  Sparkles, 
  ChevronRight, 
  FileText,
  Sliders,
  Check
} from 'lucide-react';

interface VisualLearningProps {
  onAddNote: (
    title: string,
    subject: 'Biology' | 'Physics' | 'Chemistry' | 'Mathematics',
    content: string,
    tags: string[],
    labRef: string
  ) => void;
}

export const VisualLearning: React.FC<VisualLearningProps> = ({ onAddNote }) => {
  const [selectedClass, setSelectedClass] = useState<NCERTClassGrade | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<NCERTSubject | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Active selected diagram
  const [activeDiagramId, setActiveDiagramId] = useState<string>('nephron_structure');
  const [selectedPin, setSelectedPin] = useState<Pinpoint | null>(null);

  // 3D Canvas Controls
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [xray, setXray] = useState<boolean>(false);
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [unitCellType, setUnitCellType] = useState<'SC' | 'BCC' | 'FCC'>('BCC');

  // Study & Quiz Mode
  const [activeTab, setActiveTab] = useState<'inspector' | 'quiz' | 'exam_tips'>('inspector');
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizTargetPin, setQuizTargetPin] = useState<Pinpoint | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Filter diagrams
  const filteredDiagrams = useMemo(() => {
    return NCERT_DIAGRAMS.filter((diag) => {
      const matchClass = selectedClass === 'all' || diag.classGrade === selectedClass;
      const matchSubject = selectedSubject === 'all' || diag.subject === selectedSubject;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        diag.title.toLowerCase().includes(query) ||
        diag.chapter.toLowerCase().includes(query) ||
        diag.ncertFigure.toLowerCase().includes(query) ||
        diag.subtitle.toLowerCase().includes(query) ||
        diag.pinpoints.some((p) => p.name.toLowerCase().includes(query));

      return matchClass && matchSubject && matchSearch;
    });
  }, [selectedClass, selectedSubject, searchQuery]);

  const activeDiagram: NCERTDiagramItem =
    NCERT_DIAGRAMS.find((d) => d.id === activeDiagramId) ||
    filteredDiagrams[0] ||
    NCERT_DIAGRAMS[0];

  // When switching diagrams
  const handleSelectDiagram = (diag: NCERTDiagramItem) => {
    setActiveDiagramId(diag.id);
    setSelectedPin(diag.pinpoints[0] || null);
    setExplodeFactor(0);
    setQuizFeedback(null);
    if (diag.pinpoints.length > 0) {
      const randomTarget = diag.pinpoints[Math.floor(Math.random() * diag.pinpoints.length)];
      setQuizTargetPin(randomTarget);
    }
  };

  // Pinpoint selection
  const handlePinSelect = (pin: Pinpoint) => {
    setSelectedPin(pin);

    // If currently in quiz mode
    if (activeTab === 'quiz' && quizTargetPin) {
      if (pin.id === quizTargetPin.id) {
        setQuizScore((prev) => prev + 1);
        setQuizFeedback(`Correct! You accurately identified "${pin.name}".`);
        try {
          confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
        } catch {}

        setTimeout(() => {
          const nextTargets = activeDiagram.pinpoints.filter((p) => p.id !== pin.id);
          if (nextTargets.length > 0) {
            setQuizTargetPin(nextTargets[Math.floor(Math.random() * nextTargets.length)]);
            setQuizFeedback(null);
          } else {
            setQuizFeedback('Mastery achieved! You identified all parts in this diagram.');
          }
        }, 1400);
      } else {
        setQuizFeedback(`Not quite: you selected "${pin.name}". Try finding "${quizTargetPin.name}".`);
      }
    }
  };

  // Start new quiz round
  const handleStartQuiz = () => {
    setActiveTab('quiz');
    setQuizScore(0);
    setQuizFeedback(null);
    if (activeDiagram.pinpoints.length > 0) {
      const initialTarget = activeDiagram.pinpoints[Math.floor(Math.random() * activeDiagram.pinpoints.length)];
      setQuizTargetPin(initialTarget);
    }
  };

  // Save to Notes
  const handleSaveToNotes = () => {
    const formattedContent = `### NCERT 3D Diagram: ${activeDiagram.title}
**Class**: Class ${activeDiagram.classGrade} | **Subject**: ${activeDiagram.subject}
**NCERT Citation**: ${activeDiagram.chapter} (${activeDiagram.ncertFigure})
${activeDiagram.formula ? `**Formula**: \`${activeDiagram.formula}\`\n` : ''}
${activeDiagram.description}

#### NCERT Official Labeled Structures:
${activeDiagram.pinpoints.map((p) => `- **${p.name}**: ${p.description}\n  *Significance*: ${p.significance}${p.formulaOrFact ? `\n  *Fact*: ${p.formulaOrFact}` : ''}`).join('\n\n')}

#### Key Concepts & Principles:
${activeDiagram.keyConcepts.map((k) => `- ${k}`).join('\n')}

#### NCERT Board Exam Tips:
${activeDiagram.examTips.map((e) => `- ${e}`).join('\n')}
`;

    onAddNote(
      `NCERT: ${activeDiagram.title}`,
      activeDiagram.subject,
      formattedContent,
      [`Class ${activeDiagram.classGrade}`, activeDiagram.subject, 'NCERT', 'Diagram'],
      `NCERT 3D: ${activeDiagram.title}`
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2800);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              NCERT Curriculum Classes 6–12
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">• Official Science & Biology Diagrams in 3D</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white flex items-center gap-3">
            <span>Visual Learning</span>
            <span className="text-sm font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {NCERT_DIAGRAMS.length} 3D Models
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Explore authentic NCERT textbook diagrams in interactive, stylized 3D. Inspect internal cross-sections,
            learn every official textbook label with physiological and physical functions, and test your board exam recall.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToNotes}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
              savedSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
            }`}
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved to Study Notes!' : 'Save Diagram to Notes'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Left = Interactive List, Right = 3D Stage & Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (4 COLS): INTERACTIVE DIAGRAM DIRECTORY LIST */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Diagram Directory</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {filteredDiagrams.length} shown
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diagram, organ, chapter..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Class Grade Filter Tabs */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Filter by Class:
            </span>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setSelectedClass('all')}
                className={`py-1 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                  selectedClass === 'all'
                    ? 'bg-cyan-500 text-white font-semibold shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All (6–12)
              </button>
              {([6, 7, 8, 9, 10, 11, 12] as NCERTClassGrade[]).map((grade) => {
                const count = NCERT_DIAGRAMS.filter((d) => d.classGrade === grade).length;
                const isSelected = selectedClass === grade;
                return (
                  <button
                    key={grade}
                    onClick={() => setSelectedClass(grade)}
                    className={`py-1 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500 text-white font-semibold shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Class {grade} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
            {(['all', 'Biology', 'Physics', 'Chemistry'] as const).map((sub) => {
              const isSub = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                    isSub
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-950/40'
                  }`}
                >
                  {sub === 'all' ? 'All' : sub}
                </button>
              );
            })}
          </div>

          {/* Interactive List of Diagrams */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredDiagrams.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No diagrams match your filter or search query.
              </div>
            ) : (
              filteredDiagrams.map((diag) => {
                const isSelected = diag.id === activeDiagram.id;
                return (
                  <button
                    key={diag.id}
                    onClick={() => handleSelectDiagram(diag)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all relative group flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-400/80 ring-1 ring-cyan-500/40 text-white shadow-xl shadow-cyan-950/30'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="font-mono text-cyan-300 font-semibold">
                        Class {diag.classGrade} · {diag.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {diag.pinpoints.length} parts
                      </span>
                    </div>

                    <h3 className="text-xs font-bold leading-snug text-white group-hover:text-cyan-200 transition-colors">
                      {diag.title}
                    </h3>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                      <span className="truncate max-w-[200px]">{diag.ncertFigure}</span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                          <Check className="w-3 h-3" />
                          <span>Active 3D</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (8 COLS): 3D STAGE & STUDY DOSSIER */}
        <div className="lg:col-span-8 space-y-6">
          {/* 3D WebGL Stage Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col">
            {/* Title & Badge Header */}
            <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Class {activeDiagram.classGrade} {activeDiagram.subject}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{activeDiagram.ncertFigure}</span>
                </div>
                <h2 className="text-xl font-display font-bold text-white mt-1 leading-tight">
                  {activeDiagram.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{activeDiagram.subtitle}</p>
              </div>

              {/* Reset View Button */}
              <button
                onClick={() => {
                  setExplodeFactor(0);
                  setSelectedPin(activeDiagram.pinpoints[0] || null);
                }}
                title="Reset View"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* 3D Canvas Box */}
            <div className="w-full h-[460px] sm:h-[500px] bg-slate-950/80 rounded-2xl relative overflow-hidden border border-slate-800/80 group">
              <NCERT3DCanvas
                renderType={activeDiagram.renderType}
                wireframe={wireframe}
                xray={xray}
                explodeFactor={explodeFactor}
                autoRotate={autoRotate}
                pinpoints={activeDiagram.pinpoints}
                selectedPinId={selectedPin?.id || null}
                onSelectPin={handlePinSelect}
                unitCellType={unitCellType}
              />

              {/* Top Overlay Badge */}
              <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium bg-slate-900/90 text-cyan-300 border border-cyan-500/30 shadow-lg backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Stylized 3D Model
                </span>
              </div>

              {/* Explode / Section Slider (Bottom Left Overlay) */}
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-72 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/80 shadow-xl flex items-center gap-3">
                <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                    <span className="font-semibold">Explode / Cross-Section</span>
                    <span className="font-mono">{Math.round(explodeFactor * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={explodeFactor}
                    onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* 3D Mode Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                    autoRotate
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Auto Orbit</span>
                </button>

                <button
                  onClick={() => setWireframe(!wireframe)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                    wireframe
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Wireframe</span>
                </button>

                <button
                  onClick={() => setXray(!xray)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                    xray
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>X-Ray Glass</span>
                </button>
              </div>

              {/* Optional Crystal unit cell switch */}
              {activeDiagram.renderType === 'ncert_unit_cell' && (
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-700">
                  <span className="text-[10px] text-slate-400 px-1 font-mono">Lattice:</span>
                  {(['SC', 'BCC', 'FCC'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setUnitCellType(t)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        unitCellType === t ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* NCERT Study Guide & Quiz Tabs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            {/* Tabs Header */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'inspector'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>NCERT Labels</span>
              </button>

              <button
                onClick={handleStartQuiz}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'quiz'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Labeling Quiz</span>
              </button>

              <button
                onClick={() => setActiveTab('exam_tips')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'exam_tips'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Board Tips</span>
              </button>
            </div>

            {/* TAB 1: NCERT LABELS & INSPECTOR */}
            {activeTab === 'inspector' && (
              <div className="space-y-4">
                {/* Chapter Reference Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-cyan-400 font-mono">
                    <span>{activeDiagram.chapter}</span>
                    <span className="font-semibold">{activeDiagram.ncertFigure}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeDiagram.description}</p>
                  {activeDiagram.formula && (
                    <div className="pt-1.5 font-mono text-xs text-amber-300">
                      <span className="text-slate-400">Key Formula: </span>
                      {activeDiagram.formula}
                    </div>
                  )}
                </div>

                {/* Selected Pinpoint Detail View */}
                {selectedPin ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-cyan-950/40 border border-cyan-500/40 shadow-xl space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Selected Structure
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Highlighted in 3D</span>
                    </div>
                    <h3 className="text-base font-bold text-white tracking-wide">{selectedPin.name}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-semibold text-cyan-200">Role / Function: </span>
                      {selectedPin.description}
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-amber-200/90">
                      <span className="font-semibold text-amber-300">NCERT Significance: </span>
                      {selectedPin.significance}
                    </div>
                    {selectedPin.formulaOrFact && (
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-emerald-200/90 font-mono">
                        <span className="font-semibold text-emerald-300">Key Fact: </span>
                        {selectedPin.formulaOrFact}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    Click on any pinpoint or labeled item below to view full textbook details.
                  </div>
                )}

                {/* Interactive Pinpoints Grid */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Official Diagram Labels ({activeDiagram.pinpoints.length} parts)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                    {activeDiagram.pinpoints.map((pin) => {
                      const isSelected = selectedPin?.id === pin.id;
                      return (
                        <button
                          key={pin.id}
                          onClick={() => setSelectedPin(pin)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-white font-semibold'
                              : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                            <span className="truncate">{pin.name}</span>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE LABEL QUIZ */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-slate-950 border border-indigo-500/30 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-indigo-400 font-mono text-xs">
                    <Award className="w-4 h-4" />
                    <span>3D Diagram Labeling Challenge</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Locate and identify the requested anatomical structure in 3D:
                  </h3>
                  {quizTargetPin ? (
                    <div className="p-3 bg-indigo-500/20 border border-indigo-400/40 rounded-xl">
                      <span className="text-xs text-indigo-200 font-medium">Find & Click on:</span>
                      <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                        "{quizTargetPin.name}"
                      </h2>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-400 font-semibold">Quiz Round Complete!</div>
                  )}
                  <div className="flex items-center justify-center gap-4 text-xs font-mono pt-1 text-slate-400">
                    <span>Score: <strong className="text-cyan-300 font-bold">{quizScore}</strong> pts</span>
                  </div>
                </div>

                {/* Feedback Alert */}
                {quizFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium border ${
                      quizFeedback.startsWith('Correct')
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                        : 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                    }`}
                  >
                    {quizFeedback}
                  </div>
                )}

                {/* Pinpoint alternative buttons for quick guessing */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Or select from the candidate labels:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {activeDiagram.pinpoints.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePinSelect(p)}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-xs text-slate-300 hover:text-white transition-colors text-left truncate cursor-pointer"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NCERT BOARD EXAM TIPS */}
            {activeTab === 'exam_tips' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>CBSE & State Board High-Yield Questions</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Topics and viva voce questions most frequently tested from this diagram in board exams.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Exam Tips & Drawing Guidelines
                  </span>
                  <div className="space-y-2">
                    {activeDiagram.examTips.map((tip, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed flex gap-2">
                        <span className="text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Core Scientific Principles
                  </span>
                  <div className="space-y-1.5">
                    {activeDiagram.keyConcepts.map((conc, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{conc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

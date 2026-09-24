import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Layers, 
  Eye, 
  Play, 
  Pause, 
  PlusCircle, 
  Check, 
  Compass, 
  Share2,
  Atom,
  HelpCircle
} from 'lucide-react';
import { Model3DItem, Pinpoint, GradeLevel } from '../types';
import { BIOLOGY_MATH_MODELS } from '../data/biologyMathData';
import { ThreeCanvas } from './ThreeCanvas';
import { ErrorBoundary } from './ErrorBoundary';

interface Model3DViewerProps {
  selectedGrade: GradeLevel | 'all';
  onAddNote: (title: string, subject: 'Biology' | 'Mathematics', content: string, tags: string[], labRef: string) => void;
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({
  selectedGrade,
  onAddNote
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Biology' | 'Mathematics'>('All');
  const [activeModelId, setActiveModelId] = useState<string>('plant_cell');
  const [selectedPin, setSelectedPin] = useState<Pinpoint | null>(null);
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [xray, setXray] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [noteCopied, setNoteCopied] = useState<boolean>(false);

  // Cancel any ongoing browser speech synthesis if present
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Filter models
  const filteredModels = BIOLOGY_MATH_MODELS.filter((m) => {
    const matchesGrade = selectedGrade === 'all' || m.grade === selectedGrade;
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesGrade && matchesCategory;
  });

  const activeModel: Model3DItem =
    BIOLOGY_MATH_MODELS.find((m) => m.id === activeModelId) || filteredModels[0] || BIOLOGY_MATH_MODELS[0];

  const handleSelectModel = (m: Model3DItem) => {
    setActiveModelId(m.id);
    setSelectedPin(m.pinpoints[0] || null);
    setExplodeFactor(0);
  };

  // Attach to Notes
  const handleSendToNotes = () => {
    const content = `### ${activeModel.title} (${activeModel.gradeLabel})
**Category**: ${activeModel.category}
${activeModel.formula ? `**Key Formula / Invariant**: \`${activeModel.formula}\`\n` : ''}
${activeModel.description}

#### Core Structural Components:
${activeModel.pinpoints.map((p) => `- **${p.name}**: ${p.description} *(${p.significance})*`).join('\n')}

#### Key Learning Concepts:
${activeModel.keyConcepts.map((k) => `- ${k}`).join('\n')}
`;

    onAddNote(
      `${activeModel.title} Study Sheet`,
      activeModel.category,
      content,
      [activeModel.category, activeModel.gradeLabel, ...activeModel.keyConcepts.slice(0, 2)],
      `3D Learning: ${activeModel.title}`
    );

    setNoteCopied(true);
    setTimeout(() => setNoteCopied(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>3D Interactive Learning</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Anatomical Biology specimens & 3D Mathematical geometric shapes organized by grade level.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            {(['All', 'Biology', 'Mathematics'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 font-medium rounded-md transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Selection Carousel / Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {filteredModels.map((m) => {
          const isActive = m.id === activeModel.id;
          return (
            <button
              key={m.id}
              onClick={() => handleSelectModel(m)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  m.category === 'Biology' ? 'bg-emerald-400' : 'bg-indigo-400'
                }`}
              />
              <span>{m.title}</span>
              <span className="text-[10px] text-slate-500 border border-slate-700/60 px-1.5 py-0.2 rounded">
                {m.gradeLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 3D Viewport & Knowledge Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive 3D Canvas */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col min-h-[520px]">
          {/* Canvas Floating Top Info */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">{activeModel.category}</span>
              <span aria-hidden="true">·</span>
              <span>{activeModel.gradeLabel}</span>
              {activeModel.formula && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-cyan-400 text-[11px] bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                    {activeModel.formula}
                  </span>
                </>
              )}
            </div>
            <h3 className="text-xl font-bold text-white font-display drop-shadow-md">
              {activeModel.title}
            </h3>
          </div>

          {/* 3D Action Tools Overlay (Right Top) */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
              className={`p-2 rounded-lg text-xs transition-colors ${
                autoRotate ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setXray(!xray)}
              title="X-Ray Glass Transparency"
              className={`p-2 rounded-lg text-xs transition-colors ${
                xray ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setWireframe(!wireframe)}
              title="Wireframe Mesh"
              className={`p-2 rounded-lg text-xs transition-colors ${
                wireframe ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setExplodeFactor(0);
                setSelectedPin(null);
              }}
              title="Reset View"
              className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* WebGL Canvas */}
          <div className="flex-1 w-full relative min-h-[460px] h-[460px] science-grid overflow-hidden">
            <ErrorBoundary
              key={`${activeModel.id}_${activeModel.renderType}`}
              fallbackTitle="3D Model Viewer Error"
              fallbackMessage="An issue occurred while rendering this 3D model. Click Reset to reload the interactive canvas."
              onReset={() => {
                setExplodeFactor(0);
                setWireframe(false);
                setXray(false);
              }}
            >
              <ThreeCanvas
                renderType={activeModel.renderType}
                wireframe={wireframe}
                xray={xray}
                explodeFactor={explodeFactor}
                autoRotate={autoRotate}
                pinpoints={activeModel.pinpoints}
                selectedPinId={selectedPin?.id || null}
                onSelectPin={(pin) => {
                  setSelectedPin(pin);
                }}
              />
            </ErrorBoundary>

            {/* Instruction Cue */}
            <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] text-slate-500 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drag to rotate · Scroll to zoom · Click cyan nodes to inspect</span>
            </div>
          </div>

          {/* Bottom interactive sliders */}
          <div className="bg-slate-950/90 border-t border-slate-800/80 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
            {/* Explode / Slicing Slider */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-400 whitespace-nowrap">Explode / Slicing:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                className="w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-xs font-mono text-cyan-400 tabular-nums w-8">
                {Math.round(explodeFactor * 100)}%
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendToNotes}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-cyan-600/20 border border-cyan-500/40 hover:bg-cyan-600/30 text-cyan-300 rounded-lg transition-all cursor-pointer"
              >
                {noteCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <PlusCircle className="w-3.5 h-3.5" />}
                <span>{noteCopied ? 'Saved to Notes!' : 'Save to Notes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Structural & Concept Deck */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Pinpoint / Feature Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Atom className="w-4 h-4 text-cyan-400" />
                <span>Component Inspector</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">
                {activeModel.pinpoints.length} Target Points
              </span>
            </div>

            {selectedPin ? (
              <div className="space-y-3">
                <h4 className="font-display text-lg font-bold text-white flex items-center justify-between">
                  <span>{selectedPin.name}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedPin.description}
                </p>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                    Scientific Significance
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedPin.significance}
                  </p>
                </div>

                {selectedPin.formulaOrFact && (
                  <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                    <span className="text-slate-500 block text-[10px]">QUANTITATIVE INVARIANT:</span>
                    {selectedPin.formulaOrFact}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 space-y-2">
                <p className="text-xs">Select any pinned anatomical node on the 3D model or choose from below.</p>
              </div>
            )}

            {/* Quick Pinpoint Selector Buttons */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] text-slate-400 font-medium block">Explore Structural Features:</span>
              <div className="grid grid-cols-1 gap-1.5">
                {activeModel.pinpoints.map((pin) => {
                  const isCur = selectedPin?.id === pin.id;
                  return (
                    <button
                      key={pin.id}
                      onClick={() => {
                        setSelectedPin(pin);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                        isCur
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate">{pin.name}</span>
                      <span className="text-[10px] text-slate-500">Inspect →</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Model Summary & Curriculum Concepts */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Curriculum Core Concepts
            </h4>
            <ul className="space-y-1.5">
              {activeModel.keyConcepts.map((concept, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-cyan-400 font-bold">·</span>
                  <span>{concept}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ElementData } from '../../types/atomic';
import { Play, Pause, RotateCw, ZoomIn, ZoomOut, BookmarkPlus, Layers, Info, Zap, Sparkles } from 'lucide-react';

interface BohrModelVisualizerProps {
  element: ElementData;
  onAddNote?: (title: string, subject: 'Chemistry', content: string, tags: string[], labRef: string) => void;
}

const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
const SHELL_MAX_CAPACITIES = [2, 8, 18, 32, 50, 72, 98];
const SHELL_SUBSHELLS = [
  '1s',
  '2s, 2p',
  '3s, 3p, 3d',
  '4s, 4p, 4d, 4f',
  '5s, 5p, 5d, 5f',
  '6s, 6p, 6d',
  '7s, 7p'
];

export const BohrModelVisualizer: React.FC<BohrModelVisualizerProps> = ({
  element,
  onAddNote
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [tilt3D, setTilt3D] = useState<boolean>(true);
  const [hoveredShellIndex, setHoveredShellIndex] = useState<number | null>(null);
  const [selectedShellIndex, setSelectedShellIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  const neutrons = useMemo(() => {
    return Math.max(0, Math.round(element.atomicMass) - element.number);
  }, [element.atomicMass, element.number]);

  // Animation loop with requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotationOffsets: number[] = new Array(element.shells.length).fill(0);
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update rotation
      if (isPlaying) {
        rotationOffsets = rotationOffsets.map((rot, idx) => {
          // Inner shells rotate faster (Keplerian-like Bohr frequency omega ~ 1/n^1.5)
          const shellSpeed = (1.8 / Math.pow(idx + 1, 1.2)) * speedMultiplier;
          return rot + shellSpeed * dt;
        });
      }

      // Handle high-DPI
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * window.devicePixelRatio || canvas.height !== height * window.devicePixelRatio) {
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
      }

      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 3D Tilt perspective transform
      ctx.save();
      ctx.translate(centerX, centerY);
      if (tilt3D) {
        ctx.scale(1 * zoomLevel, 0.78 * zoomLevel);
        ctx.rotate(-0.15); // Slight dynamic tilt
      } else {
        ctx.scale(1 * zoomLevel, 1 * zoomLevel);
      }

      const numShells = element.shells.length;
      const maxRadius = Math.min(width * 0.44, height * 0.44) / (tilt3D ? 0.78 : 1);
      const minRadius = 42;
      const stepRadius = (maxRadius - minRadius) / Math.max(1, numShells);

      // 1. Draw subtle background coordinate orbits
      for (let s = 0; s < numShells; s++) {
        const radius = minRadius + (s + 1) * stepRadius;
        const isHovered = hoveredShellIndex === s || selectedShellIndex === s;
        const isValence = s === numShells - 1;

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.lineWidth = isHovered ? 2.5 : isValence ? 1.8 : 1;
        ctx.strokeStyle = isHovered
          ? 'rgba(6, 182, 212, 0.95)' // Cyan
          : isValence
          ? 'rgba(245, 158, 11, 0.8)' // Amber valence highlight
          : 'rgba(51, 65, 85, 0.6)'; // Subtle slate
        if (isHovered) {
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 12;
        } else if (isValence) {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Shell Name Tag on the orbit line
        ctx.save();
        ctx.fillStyle = isHovered ? '#22d3ee' : isValence ? '#fbbf24' : '#64748b';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${SHELL_NAMES[s]} (n=${s + 1})`, radius, 0);
        ctx.restore();
      }

      // 2. Draw Electrons on each shell
      for (let s = 0; s < numShells; s++) {
        const radius = minRadius + (s + 1) * stepRadius;
        const electronCount = element.shells[s];
        const rot = rotationOffsets[s];
        const isHovered = hoveredShellIndex === s || selectedShellIndex === s;
        const isValence = s === numShells - 1;

        for (let e = 0; e < electronCount; e++) {
          const angle = rot + (e * 2 * Math.PI) / electronCount;
          const ex = Math.cos(angle) * radius;
          const ey = Math.sin(angle) * radius;

          // Electron glow
          ctx.beginPath();
          ctx.arc(ex, ey, isValence ? 5.5 : 4.5, 0, Math.PI * 2);
          ctx.fillStyle = isValence
            ? '#fbbf24' // Gold/amber for valence
            : isHovered
            ? '#38bdf8'
            : '#22d3ee'; // Electric cyan
          ctx.shadowColor = isValence ? '#f59e0b' : '#06b6d4';
          ctx.shadowBlur = isHovered ? 14 : 9;
          ctx.fill();

          // Core point
          ctx.beginPath();
          ctx.arc(ex, ey, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.fill();
        }
      }

      // 3. Central Nucleus (Protons & Neutrons)
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      const nucleusGradient = ctx.createRadialGradient(0, 0, 4, 0, 0, 34);
      nucleusGradient.addColorStop(0, '#f43f5e'); // Rose/Red proton core
      nucleusGradient.addColorStop(0.5, '#e11d48');
      nucleusGradient.addColorStop(1, '#881337');
      ctx.fillStyle = nucleusGradient;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Nucleus border
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(254, 205, 211, 0.6)';
      ctx.stroke();

      // Nucleus Symbol & Protons Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Syne", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(element.symbol, 0, -4);

      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fecdd3';
      ctx.fillText(`${element.number}p⁺ · ${neutrons}n⁰`, 0, 11);

      ctx.restore(); // Undo 3D transform
      ctx.restore(); // Undo high-DPI scaling

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [element, isPlaying, speedMultiplier, tilt3D, hoveredShellIndex, selectedShellIndex, zoomLevel, neutrons]);

  // Lewis Dot Diagram Generator
  const valenceDots = useMemo(() => {
    const v = element.valenceElectrons;
    // Standard Lewis dot 4 cardinal directions (up, right, down, left), max 2 per side (8 total)
    const dots: { x: number; y: number }[] = [];
    const positions = [
      { x: 0, y: -24 }, // Top 1
      { x: 24, y: 0 },  // Right 1
      { x: 0, y: 24 },  // Bottom 1
      { x: -24, y: 0 }, // Left 1
      { x: -6, y: -24 }, // Top 2
      { x: 24, y: -6 },  // Right 2
      { x: 6, y: 24 },   // Bottom 2
      { x: -24, y: 6 },  // Left 2
    ];

    for (let i = 0; i < Math.min(8, v); i++) {
      dots.push(positions[i]);
    }
    return dots;
  }, [element.valenceElectrons]);

  const handleSaveToNotes = () => {
    if (!onAddNote) return;
    const title = `${element.name} (${element.symbol}) - Bohr & Atomic Shells`;
    const shellsText = element.shells
      .map((eCount, idx) => `${SHELL_NAMES[idx]}-shell: ${eCount} e⁻ (max ${SHELL_MAX_CAPACITIES[idx]})`)
      .join(', ');

    const content = `### Atomic Profile: ${element.name} (${element.symbol})
- **Atomic Number (Z):** ${element.number} protons
- **Atomic Mass (A):** ${element.atomicMass} u (~${neutrons} neutrons)
- **Principal Shells (${element.shells.length} active):** ${shellsText}
- **Valency:** ${element.valency.join(', ')}
- **Valence Electrons:** ${element.valenceElectrons} (Outermost shell: ${SHELL_NAMES[element.shells.length - 1]})
- **Valency Nature:** ${element.valencyDescription}
- **Electron Configuration:** ${element.electronConfiguration}
- **Chemical Category:** ${element.category.toUpperCase()} (${element.block}-block)
- **Real-World Uses:** ${element.applications.join('; ')}`;

    onAddNote(
      title,
      'Chemistry',
      content,
      ['#AtomicStructure', '#BohrModel', `#Valency`, `#${element.name}`],
      `Atomic Foundation - ${element.name} (${element.symbol})`
    );

    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-display font-bold text-amber-400 text-lg">
              {element.symbol}
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Bohr Atomic Model: {element.name}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Atomic #{element.number} · {element.number} Protons · {neutrons} Neutrons · {element.number} Electrons in {element.shells.length} Orbitals
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {/* Note button */}
          <button
            onClick={handleSaveToNotes}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
              noteSaved
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>{noteSaved ? 'Saved to Notes!' : 'Save to Notes'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Workspace: 3D Bohr Canvas (Left) & Shells & Valency Studio (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Bohr Canvas Simulation (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col relative shadow-2xl">
          {/* Canvas Top Bar Controls */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-850 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-medium transition-colors"
                title={isPlaying ? 'Pause animation' : 'Play animation'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isPlaying ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={() => setTilt3D(!tilt3D)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-medium transition-colors ${
                  tilt3D
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{tilt3D ? '3D Angled' : '2D Planar'}</span>
              </button>
            </div>

            {/* Speed & Zoom */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeedMultiplier(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      speedMultiplier === s ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                  className="p-1 hover:text-white text-slate-400 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
                  className="p-1 hover:text-white text-slate-400 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Mount */}
          <div className="relative flex-1 min-h-[440px] sm:min-h-[480px] w-full rounded-xl bg-radial from-slate-900/60 to-slate-950 flex items-center justify-center overflow-hidden border border-slate-900">
            <canvas
              ref={canvasRef}
              className="w-full h-full absolute inset-0 cursor-crosshair"
            />

            {/* Canvas overlay legend */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 backdrop-blur-md text-[10px] font-mono text-slate-400 flex items-center gap-3 pointer-events-none">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                Inner Electrons
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                Valence Electrons
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />
                Nucleus ({element.number}p⁺, {neutrons}n⁰)
              </span>
            </div>
          </div>

          {/* Bohr postulate caption */}
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Bohr’s condition: Electrons occupy discrete stationary orbits with quantized angular momentum <code className="text-cyan-300 font-mono">L = n · (h / 2π)</code> without radiating energy.
            </span>
          </div>
        </div>

        {/* Right: K, L, M, N Shells Breakdown & Valency Studio (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Master Valency Card */}
          <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Valency & Chemical Reactivity
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-display text-white">
                    {element.valency.join(', ')}
                  </span>
                  <span className="text-xs text-amber-300 font-mono">
                    ({element.valenceElectrons} Valence e⁻ in {SHELL_NAMES[element.shells.length - 1]} shell)
                  </span>
                </div>
              </div>

              {/* Lewis Dot Representation */}
              <div className="w-16 h-16 rounded-xl bg-slate-950 border border-amber-500/40 relative flex items-center justify-center shadow-inner">
                <span className="font-display font-bold text-lg text-amber-300">
                  {element.symbol}
                </span>
                {valenceDots.map((dot, idx) => (
                  <span
                    key={idx}
                    style={{
                      transform: `translate(${dot.x}px, ${dot.y}px)`
                    }}
                    className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400"
                  />
                ))}
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {element.valencyDescription}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Valence Shell</span>
                <span className="font-bold text-cyan-300 font-mono">
                  {SHELL_NAMES[element.shells.length - 1]} Shell (n={element.shells.length})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Octet Deficit / Rule</span>
                <span className="font-bold text-amber-300 font-mono">
                  {element.category === 'noble'
                    ? 'Stable Octet'
                    : element.valenceElectrons < 4
                    ? `Loses ${element.valenceElectrons} e⁻`
                    : `Needs ${8 - element.valenceElectrons} e⁻`}
                </span>
              </div>
            </div>
          </div>

          {/* All K, L, M, N, O, P, Q Shells Breakdown List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  K, L, M, N Shell Occupancies
                </h3>
                <span className="text-[11px] text-slate-400">
                  Based on Bohr-Bury scheme (maximum capacity: <code className="text-cyan-300">2n²</code>)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40">
                Total: {element.number} e⁻
              </span>
            </div>

            <div className="space-y-2.5">
              {SHELL_NAMES.slice(0, Math.max(4, element.shells.length)).map((shellName, idx) => {
                const count = element.shells[idx] || 0;
                const maxCap = SHELL_MAX_CAPACITIES[idx];
                const pct = Math.min(100, (count / maxCap) * 100);
                const isOutermost = idx === element.shells.length - 1;
                const isHovered = hoveredShellIndex === idx;

                return (
                  <div
                    key={shellName}
                    onMouseEnter={() => setHoveredShellIndex(idx)}
                    onMouseLeave={() => setHoveredShellIndex(null)}
                    onClick={() => setSelectedShellIndex(selectedShellIndex === idx ? null : idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isOutermost
                        ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                        : isHovered
                        ? 'bg-cyan-950/30 border-cyan-500/50'
                        : count > 0
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/20 border-slate-900 opacity-40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold font-mono text-xs ${
                            isOutermost
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : count > 0
                              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {shellName}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-200">
                            {shellName} Shell
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono ml-1.5">
                            (n = {idx + 1}, {SHELL_SUBSHELLS[idx]})
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-bold ${isOutermost ? 'text-amber-300' : 'text-cyan-300'}`}>
                          {count}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {' '}/ {maxCap} e⁻
                        </span>
                        {isOutermost && (
                          <span className="ml-2 text-[9px] font-semibold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase">
                            Valence
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full transition-all duration-500 ${
                          isOutermost
                            ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                            : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

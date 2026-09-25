import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ElementData } from '../../types/atomic';
import { Sparkles, Layers, Box, RotateCw, Info, BookmarkPlus, ArrowUp, ArrowDown } from 'lucide-react';

interface QuantumModelVisualizerProps {
  element: ElementData;
  onAddNote?: (title: string, subject: 'Chemistry', content: string, tags: string[], labRef: string) => void;
}

interface SubshellConfig {
  name: string;
  n: number;
  l: number; // 0=s, 1=p, 2=d, 3=f
  lName: 's' | 'p' | 'd' | 'f';
  capacity: number;
  electrons: number;
  boxes: { up: boolean; down: boolean }[];
}

// Standard Aufbau order of filling subshells
const AUFBAU_ORDER: { name: string; n: number; l: number; lName: 's' | 'p' | 'd' | 'f'; cap: number }[] = [
  { name: '1s', n: 1, l: 0, lName: 's', cap: 2 },
  { name: '2s', n: 2, l: 0, lName: 's', cap: 2 },
  { name: '2p', n: 2, l: 1, lName: 'p', cap: 6 },
  { name: '3s', n: 3, l: 0, lName: 's', cap: 2 },
  { name: '3p', n: 3, l: 1, lName: 'p', cap: 6 },
  { name: '4s', n: 4, l: 0, lName: 's', cap: 2 },
  { name: '3d', n: 3, l: 2, lName: 'd', cap: 10 },
  { name: '4p', n: 4, l: 1, lName: 'p', cap: 6 },
  { name: '5s', n: 5, l: 0, lName: 's', cap: 2 },
  { name: '4d', n: 4, l: 2, lName: 'd', cap: 10 },
  { name: '5p', n: 5, l: 1, lName: 'p', cap: 6 },
  { name: '6s', n: 6, l: 0, lName: 's', cap: 2 },
  { name: '4f', n: 4, l: 3, lName: 'f', cap: 14 },
  { name: '5d', n: 5, l: 2, lName: 'd', cap: 10 },
  { name: '6p', n: 6, l: 1, lName: 'p', cap: 6 },
  { name: '7s', n: 7, l: 0, lName: 's', cap: 2 },
  { name: '5f', n: 5, l: 3, lName: 'f', cap: 14 },
  { name: '6d', n: 6, l: 2, lName: 'd', cap: 10 },
  { name: '7p', n: 7, l: 1, lName: 'p', cap: 6 },
];

export const QuantumModelVisualizer: React.FC<QuantumModelVisualizerProps> = ({
  element,
  onAddNote
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeOrbitalTab, setActiveOrbitalTab] = useState<'s' | 'p' | 'd' | 'f'>(
    element.block === 's' ? 's' : element.block === 'p' ? 'p' : element.block === 'd' ? 'd' : 'f'
  );
  const [selectedSubshell, setSelectedSubshell] = useState<string>('all');
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  // Compute Aufbau subshells for this element
  const subshells = useMemo(() => {
    let remaining = element.number;
    const result: SubshellConfig[] = [];

    for (const orbital of AUFBAU_ORDER) {
      if (remaining <= 0) break;
      const count = Math.min(remaining, orbital.cap);
      remaining -= count;

      // Number of degenerate orbital boxes: (2l + 1)
      const numBoxes = 2 * orbital.l + 1;
      const boxes: { up: boolean; down: boolean }[] = Array.from({ length: numBoxes }, () => ({
        up: false,
        down: false
      }));

      // Fill boxes according to Hund's rule: single electron up in each box first
      let e = 0;
      for (let b = 0; b < numBoxes && e < count; b++) {
        boxes[b].up = true;
        e++;
      }
      // Then pair with down electron
      for (let b = 0; b < numBoxes && e < count; b++) {
        boxes[b].down = true;
        e++;
      }

      result.push({
        name: orbital.name,
        n: orbital.n,
        l: orbital.l,
        lName: orbital.lName,
        capacity: orbital.cap,
        electrons: count,
        boxes
      });
    }

    return result;
  }, [element.number]);

  // Set default selected subshell to the outermost active subshell
  useEffect(() => {
    if (subshells.length > 0) {
      setSelectedSubshell(subshells[subshells.length - 1].name);
      setActiveOrbitalTab(subshells[subshells.length - 1].lName);
    }
  }, [element.number, subshells]);

  // Render 3D Quantum Orbital Cloud on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = rotationAngle;

    const render = () => {
      if (isRotating) {
        angle += 0.015;
      }

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * window.devicePixelRatio || canvas.height !== height * window.devicePixelRatio) {
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
      }

      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      ctx.save();
      ctx.translate(cx, cy);

      // Coordinate axes
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // X axis
      ctx.beginPath();
      ctx.moveTo(-160, 0);
      ctx.lineTo(160, 0);
      ctx.stroke();

      // Y axis
      ctx.beginPath();
      ctx.moveTo(0, -160);
      ctx.lineTo(0, 160);
      ctx.stroke();

      // Z axis (isometric depth)
      ctx.beginPath();
      ctx.moveTo(-100, 100);
      ctx.lineTo(100, -100);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Orbitals based on selected subshell or active tab
      const shapeType = selectedSubshell !== 'all'
        ? selectedSubshell.slice(-1) as 's' | 'p' | 'd' | 'f'
        : activeOrbitalTab;

      // 1. s Orbital: Spherical Electron Cloud Probability
      if (shapeType === 's') {
        const radius = 95;
        // Radial probability density gradient
        const radGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
        radGrad.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
        radGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.45)');
        radGrad.addColorStop(0.8, 'rgba(6, 182, 212, 0.15)');
        radGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Stippled quantum probability cloud particles
        const numParticles = 160;
        ctx.fillStyle = 'rgba(165, 243, 252, 0.7)';
        for (let i = 0; i < numParticles; i++) {
          const r = radius * Math.sqrt((i + 1) / numParticles);
          const theta = i * 2.39996 + angle * 0.5; // Golden angle spiral
          const px = Math.cos(theta) * r;
          const py = Math.sin(theta) * r;
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Spherical wireframe ring
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.35, angle, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. p Orbitals: Dumbbell lobes along orthogonal axes (px, py, pz)
      else if (shapeType === 'p') {
        const lobeLength = 110;
        const lobeWidth = 46;

        const drawLobe = (rot: number, colorPos: string, colorNeg: string) => {
          ctx.save();
          ctx.rotate(rot);

          // Positive phase lobe (+y)
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(lobeWidth, -20, lobeWidth, -lobeLength * 0.7, 0, -lobeLength);
          ctx.bezierCurveTo(-lobeWidth, -lobeLength * 0.7, -lobeWidth, -20, 0, 0);
          ctx.fillStyle = colorPos;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 12;
          ctx.fill();

          // Phase sign tag (+)
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('+', 0, -lobeLength * 0.6);

          // Negative phase lobe (-y)
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(lobeWidth, 20, lobeWidth, lobeLength * 0.7, 0, lobeLength);
          ctx.bezierCurveTo(-lobeWidth, lobeLength * 0.7, -lobeWidth, 20, 0, 0);
          ctx.fillStyle = colorNeg;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;
          ctx.fill();

          // Phase sign tag (-)
          ctx.fillStyle = '#ffffff';
          ctx.fillText('-', 0, lobeLength * 0.6);

          ctx.restore();
        };

        // Draw px (horizontal) and py (vertical)
        drawLobe(angle, 'rgba(6, 182, 212, 0.75)', 'rgba(245, 158, 11, 0.75)');
        drawLobe(angle + Math.PI / 2, 'rgba(59, 130, 246, 0.75)', 'rgba(239, 68, 68, 0.75)');
      }

      // 3. d Orbitals: 4-lobed cloverleaf shapes & torus doughnut
      else if (shapeType === 'd') {
        const lobeLen = 95;
        const lobeW = 34;

        ctx.save();
        ctx.rotate(angle);

        // 4 clover lobes in the plane
        for (let i = 0; i < 4; i++) {
          const lobeRot = (i * Math.PI) / 2 + Math.PI / 4;
          const isPos = i % 2 === 0;

          ctx.save();
          ctx.rotate(lobeRot);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(lobeW, -15, lobeW, -lobeLen * 0.7, 0, -lobeLen);
          ctx.bezierCurveTo(-lobeW, -lobeLen * 0.7, -lobeW, -15, 0, 0);
          ctx.fillStyle = isPos ? 'rgba(168, 85, 247, 0.75)' : 'rgba(236, 72, 153, 0.75)';
          ctx.shadowColor = isPos ? '#a855f7' : '#ec4899';
          ctx.shadowBlur = 10;
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(isPos ? '+' : '-', 0, -lobeLen * 0.6);
          ctx.restore();
        }

        // Central nodal ring (toroid)
        ctx.beginPath();
        ctx.ellipse(0, 0, 36, 14, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
      }

      // 4. f Orbitals: Multi-lobed tetrahedral symmetry
      else {
        const lobeLen = 85;
        const lobeW = 26;

        ctx.save();
        ctx.rotate(angle);

        for (let i = 0; i < 8; i++) {
          const lobeRot = (i * Math.PI) / 4;
          const isPos = i % 2 === 0;

          ctx.save();
          ctx.rotate(lobeRot);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(lobeW, -10, lobeW, -lobeLen * 0.6, 0, -lobeLen);
          ctx.bezierCurveTo(-lobeW, -lobeLen * 0.6, -lobeW, -10, 0, 0);
          ctx.fillStyle = isPos ? 'rgba(34, 197, 94, 0.75)' : 'rgba(249, 115, 22, 0.75)';
          ctx.shadowColor = isPos ? '#22c55e' : '#f97316';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }

      // Central Nucleus Dot
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.restore();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeOrbitalTab, selectedSubshell, isRotating, rotationAngle]);

  const handleSaveToNotes = () => {
    if (!onAddNote) return;
    const title = `${element.name} (${element.symbol}) - Quantum Mechanics & Orbitals`;
    const qn = element.quantumNumbersOuter;
    const content = `### Quantum Mechanical Profile: ${element.name} (${element.symbol})
- **Complete Electron Configuration:** ${element.electronConfiguration}
- **Condensed Shorthand:** ${element.electronConfigurationShort}
- **Outermost Subshell:** ${selectedSubshell} (${element.block}-block)
- **Quantum Numbers of Valence Electron:**
  - Principal (n): ${qn.n}
  - Azimuthal / Orbital (l): ${qn.l} (${element.block} orbital)
  - Magnetic (ml): ${qn.ml}
  - Spin (ms): ${qn.ms}
- **Aufbau & Hund's Rule Summary:** Total of ${element.number} electrons filling ${subshells.length} quantum subshells.`;

    onAddNote(
      title,
      'Chemistry',
      content,
      ['#QuantumModel', '#AufbauPrinciple', '#Orbitals', `#${element.name}`],
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
            <span className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-display font-bold text-purple-400 text-lg">
              Ψ
            </span>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Quantum Mechanical Model: {element.name}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Wavefunctions Ψ(r, θ, φ) · Probability Density |Ψ|² · Hund’s Rule & Pauli Exclusion Principle
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={handleSaveToNotes}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
              noteSaved
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-purple-400" />
            <span>{noteSaved ? 'Saved to Notes!' : 'Save to Notes'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid: Orbital 3D Probability Cloud (Left) & Aufbau Filling Boxes (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Probability Cloud Canvas (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col relative shadow-2xl">
          {/* Subshell / Orbital Type Segmented Control */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-850 text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              {(['s', 'p', 'd', 'f'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setActiveOrbitalTab(type);
                    setSelectedSubshell('all');
                  }}
                  className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition-colors ${
                    activeOrbitalTab === type && selectedSubshell === 'all'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type} orbital
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsRotating(!isRotating)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-[11px] font-medium"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              <span>{isRotating ? 'Rotating' : 'Paused'}</span>
            </button>
          </div>

          {/* Canvas Mount */}
          <div className="relative flex-1 min-h-[420px] w-full rounded-xl bg-radial from-slate-900/60 to-slate-950 flex items-center justify-center overflow-hidden border border-slate-900">
            <canvas ref={canvasRef} className="w-full h-full absolute inset-0 cursor-grab" />

            {/* Overlay description */}
            <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 backdrop-blur-md text-xs text-slate-300 max-w-[240px]">
              <span className="font-bold text-purple-300 font-display block">
                {activeOrbitalTab.toUpperCase()} Subshell Geometry
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {activeOrbitalTab === 's'
                  ? 'Spherical symmetry (l = 0). 1 orbital holding up to 2 electrons.'
                  : activeOrbitalTab === 'p'
                  ? 'Dumbbell lobes along Cartesian axes (l = 1). 3 orbitals holding up to 6 electrons.'
                  : activeOrbitalTab === 'd'
                  ? 'Cloverleaf and toroidal shapes (l = 2). 5 orbitals holding up to 10 electrons.'
                  : 'Multi-lobed nodal geometries (l = 3). 7 orbitals holding up to 14 electrons.'}
              </span>
            </div>

            <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 backdrop-blur-md text-[10px] font-mono text-purple-300 pointer-events-none">
              Schrödinger: ĤΨ = EΨ
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>
              Heisenberg Uncertainty Principle: <code className="text-purple-300 font-mono">Δx · Δp ≥ ℏ/2</code>. Electrons exist as probability density waves, not defined circular tracks.
            </span>
          </div>
        </div>

        {/* Right: Aufbau Energy Ladder & Hund's Rule Box Diagrams (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Electron Configuration Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Spectroscopic Electron Configuration
            </span>
            <div className="text-lg font-mono font-bold text-cyan-300 break-words">
              {element.electronConfiguration}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              Noble gas shorthand: <strong className="text-amber-300">{element.electronConfigurationShort}</strong>
            </div>
          </div>

          {/* 4 Quantum Numbers of Outermost Valence Electron */}
          <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Quantum Numbers of Outermost Electron
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Principal (n)</span>
                <span className="text-base font-bold font-mono text-cyan-300">
                  {element.quantumNumbersOuter.n}
                </span>
                <span className="text-[9px] text-slate-400 block">Energy Level</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Azimuthal (l)</span>
                <span className="text-base font-bold font-mono text-amber-300">
                  {element.quantumNumbersOuter.l}
                </span>
                <span className="text-[9px] text-slate-400 block">{element.block} orbital</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Magnetic (mₗ)</span>
                <span className="text-base font-bold font-mono text-emerald-300">
                  {element.quantumNumbersOuter.ml}
                </span>
                <span className="text-[9px] text-slate-400 block">Orientation</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Spin (mₛ)</span>
                <span className="text-base font-bold font-mono text-purple-300">
                  {element.quantumNumbersOuter.ms}
                </span>
                <span className="text-[9px] text-slate-400 block">Spin vector</span>
              </div>
            </div>
          </div>

          {/* Aufbau Orbital Filling Diagram with Hund's Rule Spin Boxes */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                Aufbau Orbital Filling & Hund’s Rule Boxes
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                ↑ (mₛ = +½), ↓ (mₛ = -½)
              </span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
              {subshells.map((sh) => {
                const isSelected = selectedSubshell === sh.name;
                const isFull = sh.electrons === sh.capacity;

                return (
                  <div
                    key={sh.name}
                    onClick={() => {
                      setSelectedSubshell(sh.name);
                      setActiveOrbitalTab(sh.lName);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-cyan-300 w-8">
                        {sh.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {sh.electrons} / {sh.capacity} e⁻
                      </span>
                    </div>

                    {/* Degenerate Orbital Spin Boxes */}
                    <div className="flex items-center gap-1.5">
                      {sh.boxes.map((box, bIdx) => (
                        <div
                          key={bIdx}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center gap-0.5 font-bold text-xs ${
                            box.up && box.down
                              ? 'bg-purple-950/60 border-purple-500/60 text-purple-300'
                              : box.up
                              ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                              : 'bg-slate-900 border-slate-800 text-slate-600'
                          }`}
                        >
                          {box.up && <span className="text-cyan-300 text-sm leading-none">↑</span>}
                          {box.down && <span className="text-amber-300 text-sm leading-none">↓</span>}
                          {!box.up && !box.down && <span className="text-slate-700 text-[10px]">·</span>}
                        </div>
                      ))}
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

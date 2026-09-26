import React, { useState, useEffect, useRef } from 'react';
import { 
  FlaskConical, 
  Flame, 
  RotateCcw, 
  PlusCircle, 
  Check, 
  Atom, 
  Sparkles, 
  Thermometer, 
  Droplet,
  Info,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { CHEMICALS, REACTIONS } from '../data/chemistryData';
import { Chemical, ReactionResult } from '../types';
import { FormulaCrafter } from './FormulaCrafter';

interface ChemistryLabProps {
  onAddNote: (title: string, subject: 'Chemistry', content: string, tags: string[], labRef: string) => void;
}

export const ChemistryLab: React.FC<ChemistryLabProps> = ({ onAddNote }) => {
  const [chemSectionTab, setChemSectionTab] = useState<'beaker' | 'crafter'>('beaker');
  const [selectedChemicals, setSelectedChemicals] = useState<Chemical[]>([]);
  const [currentTemp, setCurrentTemp] = useState<number>(22.0); // Room temp
  const [heatingActive, setHeatingActive] = useState<boolean>(false);
  const [stirrerActive, setStirrerActive] = useState<boolean>(false);
  const [activeReaction, setActiveReaction] = useState<ReactionResult | null>(null);
  const [showMolecularView, setShowMolecularView] = useState<boolean>(false);
  const [noteCopied, setNoteCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Compute mixture attributes
  const totalVolume = selectedChemicals.length * 50; // 50 ml per aliquot
  
  // Calculate pH based on mixture
  const calculatedPH = computeMixturePH(selectedChemicals, activeReaction);
  const solutionColor = computeSolutionColor(selectedChemicals, activeReaction, calculatedPH);

  // Detect reaction whenever chemicals change or heat is applied
  useEffect(() => {
    const chemicalIds = selectedChemicals.map((c) => c.id);
    const foundReaction = REACTIONS.find((rx) => {
      const hasAllRequired = rx.requiredIds.every((reqId) => chemicalIds.includes(reqId));
      if (!hasAllRequired) return false;
      if (rx.minTemp && currentTemp < rx.minTemp) return false;
      return true;
    });

    if (foundReaction && (!activeReaction || activeReaction.id !== foundReaction.id)) {
      setActiveReaction(foundReaction);
      if (foundReaction.exothermicDeltaTemp) {
        setCurrentTemp((prev) => Math.min(95, prev + foundReaction.exothermicDeltaTemp!));
      }
    } else if (!foundReaction && activeReaction) {
      setActiveReaction(null);
    }
  }, [selectedChemicals, currentTemp]);

  // Heating loop with Bunsen burner
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (heatingActive) {
      interval = setInterval(() => {
        setCurrentTemp((prev) => Math.min(98.5, prev + 0.8));
      }, 200);
    } else {
      interval = setInterval(() => {
        setCurrentTemp((prev) => (prev > 22.2 ? prev - 0.2 : 22.0));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [heatingActive]);

  // Fluid & Bubble / Particle Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; vy: number; radius: number; opacity: number; color: string }[] = [];

    // Initialize initial particles
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vy: -(0.5 + Math.random() * 1.5),
        radius: 1 + Math.random() * 2.5,
        opacity: Math.random() * 0.7,
        color: '#ffffff'
      });
    }

    let time = 0;
    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (selectedChemicals.length === 0) {
        // Empty beaker watermark
        ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.font = '12px "Plus Jakarta Sans"';
        ctx.textAlign = 'center';
        ctx.fillText('Beaker empty. Add chemicals from shelf.', canvas.width / 2, canvas.height / 2);
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const fluidHeight = Math.min(canvas.height * 0.85, (totalVolume / 300) * canvas.height * 0.85);
      const fluidTop = canvas.height - fluidHeight;

      // Draw Beaker Liquid Body
      ctx.save();
      ctx.beginPath();
      // Wave motion on surface
      const waveAmplitude = stirrerActive ? 6 : heatingActive ? 3 : 1;
      ctx.moveTo(0, fluidTop);
      for (let x = 0; x <= canvas.width; x += 10) {
        const waveY = fluidTop + Math.sin(time * 3 + x * 0.05) * waveAmplitude;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();

      // Fluid gradient
      const grad = ctx.createLinearGradient(0, fluidTop, 0, canvas.height);
      grad.addColorStop(0, solutionColor);
      grad.addColorStop(1, adjustColorBrightness(solutionColor, -30));
      ctx.fillStyle = grad;
      ctx.fill();

      // Chemiluminescence glow effect
      if (activeReaction?.luminescence) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 30;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw Settled Precipitate at the bottom
      if (activeReaction?.precipitate) {
        ctx.fillStyle = activeReaction.id === 'precipitation_agcl' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(180, 83, 9, 0.85)';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height - 8, canvas.width * 0.42, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bubbles & Gas Effervescence
      const hasGas = activeReaction?.gasEvolution || heatingActive;
      if (hasGas || stirrerActive) {
        particles.forEach((p) => {
          p.y += p.vy * (activeReaction?.gasEvolution ? 2.5 : 1);
          p.x += Math.sin(time + p.y * 0.1) * (stirrerActive ? 2 : 0.5);

          if (p.y < fluidTop) {
            p.y = canvas.height - Math.random() * 15;
            p.x = 20 + Math.random() * (canvas.width - 40);
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.fill();
        });
      }

      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [selectedChemicals, solutionColor, activeReaction, heatingActive, stirrerActive, totalVolume]);

  const handleAddChemical = (chem: Chemical) => {
    if (selectedChemicals.length >= 6) return;
    setSelectedChemicals((prev) => [...prev, chem]);
  };

  const handleClearBeaker = () => {
    setSelectedChemicals([]);
    setActiveReaction(null);
    setCurrentTemp(22.0);
    setHeatingActive(false);
  };

  const handleSaveToNotes = () => {
    const rx = activeReaction;
    const content = `### Chemistry Lab Experiment Record
**Mixture Reagents**: ${selectedChemicals.map((c) => c.name).join(', ')}
**Final Solution pH**: ${calculatedPH.toFixed(1)}
**Equilibrium Temperature**: ${currentTemp.toFixed(1)} °C
**Observations**: ${rx ? rx.name : 'Homogeneous mixture with no spontaneous macroscopic reaction.'}

${rx ? `#### Reaction Stoichiometry:
\`${rx.equation}\`

#### Sub-microscopic Molecular Mechanics:
${rx.molecularExplanation}

#### Real-world Industrial / Biological Context:
${rx.realWorldApplication}

#### Safety Protocols:
${rx.safetyNote}` : 'No chemical reaction observed. Solution remained in thermodynamic equilibrium.'}
`;

    onAddNote(
      rx ? `${rx.name} Experiment` : 'Chemical Solution Analysis',
      'Chemistry',
      content,
      ['Chemistry Lab', rx ? rx.name : 'Mixture', `pH ${calculatedPH.toFixed(1)}`],
      `Chemistry Lab: ${rx ? rx.name : 'Solution Mixing'}`
    );

    setNoteCopied(true);
    setTimeout(() => setNoteCopied(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Chemistry Lab Workbench</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Safe chemical-mixing simulation, valency criss-cross formula crafter, polyatomic ions, and compound synthesis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sub-Section Switcher: Wet Reaction Beaker vs. Formula Crafter */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setChemSectionTab('beaker')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chemSectionTab === 'beaker'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Reaction Beaker Lab</span>
            </button>
            <button
              type="button"
              onClick={() => setChemSectionTab('crafter')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chemSectionTab === 'crafter'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>Formula Crafter (Ions & Compounds)</span>
            </button>
          </div>

          {chemSectionTab === 'beaker' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMolecularView(!showMolecularView)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  showMolecularView
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Atom className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showMolecularView ? 'Hide Molecular View' : 'Molecular Level View'}</span>
              </button>

              <button
                onClick={handleClearBeaker}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Beaker</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {chemSectionTab === 'crafter' ? (
        <FormulaCrafter onAddNote={onAddNote} />
      ) : (
      /* Main Lab Layout */
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chemical Reagents Shelf */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <span>Chemical Shelf Reagents</span>
              </span>
              <span className="text-[11px] text-slate-500">Tap to add</span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[460px] overflow-y-auto pr-1">
              {CHEMICALS.map((chem) => (
                <button
                  key={chem.id}
                  onClick={() => handleAddChemical(chem)}
                  className="w-full text-left p-2.5 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: chem.color }}
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {chem.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {chem.formula} · pH {chem.pH}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-cyan-400 font-bold">
                    +50ml
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Interactive Glass Beaker Stage */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col items-center shadow-2xl relative min-h-[520px]">
          {/* Beaker Telemetry HUD */}
          <div className="w-full flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <Thermometer className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono font-bold text-white tabular-nums">
                {currentTemp.toFixed(1)} °C
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <Droplet className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono font-bold text-cyan-300 tabular-nums">
                pH {calculatedPH.toFixed(1)}
              </span>
            </div>

            <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
              {totalVolume} ml / 300 ml
            </div>
          </div>

          {/* Glassware Container Graphic */}
          <div className="relative w-64 h-80 flex flex-col items-center justify-end">
            {/* Beaker Rim and Spout */}
            <div className="w-56 h-4 border-2 border-b-0 border-slate-600/70 rounded-t-lg bg-slate-800/10" />

            {/* Beaker Glass Body */}
            <div className="w-56 h-72 border-2 border-slate-600/60 border-t-0 rounded-b-3xl relative overflow-hidden bg-slate-950/30 backdrop-blur-xs shadow-inner">
              {/* Volume Graduations */}
              <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between py-6 pointer-events-none z-10 opacity-40">
                <span className="text-[9px] font-mono text-slate-300">250ml -</span>
                <span className="text-[9px] font-mono text-slate-300">200ml -</span>
                <span className="text-[9px] font-mono text-slate-300">150ml -</span>
                <span className="text-[9px] font-mono text-slate-300">100ml -</span>
                <span className="text-[9px] font-mono text-slate-300">50ml -</span>
              </div>

              {/* Dynamic Fluid Canvas */}
              <canvas
                ref={canvasRef}
                width={220}
                height={280}
                className="w-full h-full block"
              />

              {/* Bunsen Burner Flame Base Glow */}
              {heatingActive && (
                <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-amber-500/40 via-red-500/20 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Bunsen Burner Appliance */}
            <div className="w-40 mt-1 flex flex-col items-center">
              {heatingActive && (
                <div className="w-12 h-8 bg-gradient-to-t from-cyan-400 via-blue-500 to-amber-300 rounded-full blur-[2px] animate-pulse" />
              )}
              <div className="w-24 h-3 bg-slate-800 rounded-t border-t border-slate-700" />
              <div className="w-32 h-2 bg-slate-700 rounded-b" />
            </div>
          </div>

          {/* Workbench Controls (Heat & Stir) */}
          <div className="w-full flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setHeatingActive(!heatingActive)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                heatingActive
                  ? 'bg-red-500/20 border-red-500/40 text-red-300 shadow-md shadow-red-950/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${heatingActive ? 'text-red-400 animate-bounce' : ''}`} />
              <span>{heatingActive ? 'Bunsen Burner ON' : 'Ignite Burner'}</span>
            </button>

            <button
              onClick={() => setStirrerActive(!stirrerActive)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                stirrerActive
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/40'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${stirrerActive ? 'text-cyan-400 animate-spin' : ''}`} />
              <span>{stirrerActive ? 'Stirrer Spinning' : 'Magnetic Stirrer'}</span>
            </button>
          </div>

          {/* Live Kinetics Status for Burner & Magnetic Stirrer */}
          <div className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span>
                Burner:{' '}
                <strong className={heatingActive ? 'text-red-400' : 'text-slate-400'}>
                  {heatingActive ? `Heating (+0.8°C/s → ${currentTemp.toFixed(1)}°C)` : 'Standby (Cooling to 22°C)'}
                </strong>
              </span>
              <span>
                Stirrer:{' '}
                <strong className={stirrerActive ? 'text-cyan-300' : 'text-slate-400'}>
                  {stirrerActive ? '600 RPM (2.5× Collision Rate)' : '0 RPM'}
                </strong>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Tip: Use the <strong>Burner</strong> to unlock endothermic reactions (e.g., <code className="text-cyan-300">CuSO₄ + NaOH ≥ 55°C</code> or <code className="text-cyan-300">CaCO₃ ≥ 65°C</code>) and the <strong>Magnetic Stirrer</strong> to agitate ions & prevent precipitate settling.
            </p>
          </div>
        </div>

        {/* Right: Reaction Concept & Molecular Drawer */}
        <div className="lg:col-span-4 space-y-4">
          {/* Reaction Result Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Atom className="w-4 h-4 text-cyan-400" />
                <span>Reaction Analytics</span>
              </span>
              {activeReaction ? (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REACTION DETECTED
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">Awaiting reagents</span>
              )}
            </div>

            {activeReaction ? (
              <div className="space-y-3.5">
                <div>
                  <h4 className="font-display text-base font-bold text-white">
                    {activeReaction.name}
                  </h4>
                  <div className="p-2.5 mt-2 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-xs text-cyan-300">
                    {activeReaction.equation}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Molecular Level Dynamics
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeReaction.molecularExplanation}
                  </p>
                </div>

                <div className="p-3 bg-cyan-950/30 border border-cyan-900/40 rounded-xl space-y-1">
                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block">
                    Real-World Relevance
                  </span>
                  <p className="text-xs text-cyan-200/90 leading-relaxed">
                    {activeReaction.realWorldApplication}
                  </p>
                </div>

                <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-200/90 leading-tight">
                    {activeReaction.safetyNote}
                  </p>
                </div>

                <button
                  onClick={handleSaveToNotes}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-cyan-600/20 border border-cyan-500/40 hover:bg-cyan-600/30 text-cyan-300 rounded-xl transition-all"
                >
                  {noteCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  <span>{noteCopied ? 'Logged to Notes!' : 'Save Experiment to Notes'}</span>
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Info className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs">Add reagents from the shelf to trigger real chemical transformations.</p>
                <p className="text-[11px] text-slate-500">
                  Try mixing: <br />
                  <span className="text-cyan-400">HCl + NaOH</span> (Neutralization) <br />
                  <span className="text-cyan-400">AgNO₃ + NaCl</span> (Precipitation) <br />
                  <span className="text-cyan-400">H₂O₂ + KI Catalyst</span> (Elephant Toothpaste) <br />
                  <span className="text-cyan-400">CuSO₄ + Fe Filings</span> (Redox)
                </p>
              </div>
            )}
          </div>

          {/* Molecular View Modal / Inline Card */}
          {showMolecularView && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 space-y-3 shadow-xl">
              <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider block">
                Sub-Atomic Ion Lattice Simulation
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-slate-950 rounded-lg text-center border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-red-500/80 text-[10px] font-bold text-white flex items-center justify-center mx-auto mb-1">
                    H⁺
                  </div>
                  <span className="text-[10px] text-slate-400">Hydronium</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg text-center border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500/80 text-[10px] font-bold text-white flex items-center justify-center mx-auto mb-1">
                    OH⁻
                  </div>
                  <span className="text-[10px] text-slate-400">Hydroxide</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg text-center border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/80 text-[10px] font-bold text-white flex items-center justify-center mx-auto mb-1">
                    Cl⁻
                  </div>
                  <span className="text-[10px] text-slate-400">Chloride</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Water molecules continuously collide at ~500 m/s, solvating ions in hydration spheres and driving spontaneous bond formation when activation barriers are overcome.
              </p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

// Color & pH helpers
function computeMixturePH(chems: Chemical[], rx: ReactionResult | null): number {
  if (chems.length === 0) return 7.0;
  if (rx) return rx.resultPH;
  const avg = chems.reduce((acc, c) => acc + c.pH, 0) / chems.length;
  return Math.min(14, Math.max(0, avg));
}

function computeSolutionColor(chems: Chemical[], rx: ReactionResult | null, ph: number): string {
  if (chems.length === 0) return 'rgba(255, 255, 255, 0.1)';
  if (rx) return rx.resultColor;

  const hasIndicator = chems.some((c) => c.type === 'indicator');
  if (hasIndicator) {
    if (ph < 3) return 'rgba(239, 68, 68, 0.7)'; // Red
    if (ph < 6) return 'rgba(245, 158, 11, 0.7)'; // Orange
    if (ph < 8) return 'rgba(16, 185, 129, 0.7)'; // Green (neutral)
    if (ph < 11) return 'rgba(6, 182, 212, 0.7)'; // Cyan
    return 'rgba(147, 51, 234, 0.7)'; // Violet/Purple
  }

  // Otherwise blend chemical colors
  return chems[chems.length - 1].color;
}

function adjustColorBrightness(col: string, percent: number) {
  return col;
}

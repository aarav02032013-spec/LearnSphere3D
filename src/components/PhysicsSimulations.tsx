import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  HelpCircle, 
  PlusCircle, 
  Check, 
  Award,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhysicsSimType, QuizQuestion } from '../types';
import { 
  CELESTIAL_BODIES, 
  generateProjectileQuiz, 
  generateCollisionQuiz, 
  generateGravityQuiz, 
  generatePendulumQuiz 
} from '../data/physicsData';

interface PhysicsSimulationsProps {
  onAddNote: (title: string, subject: 'Physics', content: string, tags: string[], labRef: string) => void;
}

export const PhysicsSimulations: React.FC<PhysicsSimulationsProps> = ({ onAddNote }) => {
  const [activeSim, setActiveSim] = useState<PhysicsSimType>('projectile');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [noteCopied, setNoteCopied] = useState<boolean>(false);

  // --- Projectile Motion State ---
  const [projV0, setProjV0] = useState<number>(35); // m/s
  const [projAngle, setProjAngle] = useState<number>(45); // deg
  const [projBodyIndex, setProjBodyIndex] = useState<number>(0); // Earth
  const [projAirResistance, setProjAirResistance] = useState<boolean>(false);

  // --- Collision State ---
  const [colM1, setColM1] = useState<number>(2.0); // kg
  const [colM2, setColM2] = useState<number>(1.5); // kg
  const [colV1, setColV1] = useState<number>(4.0); // m/s
  const [colV2, setColV2] = useState<number>(-2.0); // m/s
  const [colElasticity, setColElasticity] = useState<number>(1.0); // 1 = elastic, 0 = inelastic

  // --- Gravity Orbit State ---
  const [orbitRadius, setOrbitRadius] = useState<number>(180); // px
  const [orbitSpeed, setOrbitSpeed] = useState<number>(1.0);

  // --- Pendulum State ---
  const [pendLength, setPendLength] = useState<number>(1.8); // meters
  const [pendAngle0, setPendAngle0] = useState<number>(35); // deg
  const [pendDamping, setPendDamping] = useState<number>(0.02);

  // --- Quiz System State ---
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Simulation time ref
  const simTimeRef = useRef<number>(0);

  // Carts collision dynamic positions
  const cart1PosRef = useRef<number>(100);
  const cart2PosRef = useRef<number>(380);
  const cart1VelRef = useRef<number>(colV1);
  const cart2VelRef = useRef<number>(colV2);

  // Pendulum theta dynamic ref
  const pendThetaRef = useRef<number>((pendAngle0 * Math.PI) / 180);
  const pendOmegaRef = useRef<number>(0);

  // Reset simulation dynamics on parameter change
  useEffect(() => {
    simTimeRef.current = 0;
    cart1PosRef.current = 100;
    cart2PosRef.current = 380;
    cart1VelRef.current = colV1;
    cart2VelRef.current = colV2;
    pendThetaRef.current = (pendAngle0 * Math.PI) / 180;
    pendOmegaRef.current = 0;
  }, [activeSim, projV0, projAngle, projBodyIndex, colM1, colM2, colV1, colV2, colElasticity, pendLength, pendAngle0]);

  // Main Canvas Physics Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimestamp) / 1000);
      lastTimestamp = now;

      if (isRunning) {
        simTimeRef.current += dt;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (activeSim === 'projectile') {
        renderProjectileSim(ctx, canvas, dt, isRunning, {
          v0: projV0,
          angle: projAngle,
          gravity: CELESTIAL_BODIES[projBodyIndex].gravity,
          airRes: projAirResistance,
          time: simTimeRef.current
        });
      } else if (activeSim === 'collision') {
        renderCollisionSim(ctx, canvas, dt, isRunning, {
          m1: colM1,
          m2: colM2,
          v1Init: colV1,
          v2Init: colV2,
          e: colElasticity,
          cart1PosRef,
          cart2PosRef,
          cart1VelRef,
          cart2VelRef
        });
      } else if (activeSim === 'gravity') {
        renderGravityOrbitSim(ctx, canvas, dt, isRunning, {
          radius: orbitRadius,
          speedMult: orbitSpeed,
          time: simTimeRef.current
        });
      } else if (activeSim === 'pendulum') {
        renderPendulumSim(ctx, canvas, dt, isRunning, {
          length: pendLength,
          damping: pendDamping,
          pendThetaRef,
          pendOmegaRef
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    activeSim,
    isRunning,
    projV0,
    projAngle,
    projBodyIndex,
    projAirResistance,
    colM1,
    colM2,
    colV1,
    colV2,
    colElasticity,
    orbitRadius,
    orbitSpeed,
    pendLength,
    pendDamping
  ]);

  // Generate dynamic quiz
  const handleOpenQuiz = () => {
    let generated: QuizQuestion[] = [];
    if (activeSim === 'projectile') {
      const body = CELESTIAL_BODIES[projBodyIndex];
      generated = generateProjectileQuiz(projV0, projAngle, body.gravity, body.name);
    } else if (activeSim === 'collision') {
      generated = generateCollisionQuiz(colM1, colM2, colV1, colV2, colElasticity === 1.0);
    } else if (activeSim === 'gravity') {
      generated = generateGravityQuiz(orbitRadius, orbitSpeed);
    } else {
      generated = generatePendulumQuiz(pendLength, 9.81);
    }
    setQuestions(generated);
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
    setQuizActive(true);
  };

  const handleSelectQuizAnswer = (optionIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);

    const isCorrect = optionIdx === questions[currentQIndex].correctIndex;
    if (isCorrect) setScore((prev) => prev + 1);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSaveToNotes = () => {
    let title = '';
    let content = '';

    if (activeSim === 'projectile') {
      const body = CELESTIAL_BODIES[projBodyIndex];
      const theta = (projAngle * Math.PI) / 180;
      const v0y = projV0 * Math.sin(theta);
      const v0x = projV0 * Math.cos(theta);
      const tFlight = (2 * v0y) / body.gravity;
      const hMax = (v0y * v0y) / (2 * body.gravity);
      const range = v0x * tFlight;

      title = `Projectile Trajectory on ${body.name}`;
      content = `### Kinematics Analysis: Projectile Motion
- **Environment**: ${body.name} (g = ${body.gravity} m/s²)
- **Launch Parameters**: Velocity = ${projV0} m/s at ${projAngle}°
- **Component Velocities**: \`v₀ₓ = ${v0x.toFixed(2)} m/s\`, \`v₀ᵧ = ${v0y.toFixed(2)} m/s\`
- **Theoretical Peak Height (H_max)**: \`${hMax.toFixed(2)} meters\`
- **Total Time of Flight (T)**: \`${tFlight.toFixed(2)} seconds\`
- **Horizontal Range (R)**: \`${range.toFixed(2)} meters\`

*Key Concept*: Horizontal velocity remains constant in a vacuum, while vertical velocity undergoes constant gravitational acceleration.`;
    } else if (activeSim === 'collision') {
      const pTot = colM1 * colV1 + colM2 * colV2;
      const keTot = 0.5 * colM1 * colV1 * colV1 + 0.5 * colM2 * colV2 * colV2;

      title = 'Conservation of Momentum in 1D Collisions';
      content = `### Impulse & Momentum Simulation Record
- **Cart 1**: Mass = ${colM1} kg, Initial Velocity = ${colV1} m/s
- **Cart 2**: Mass = ${colM2} kg, Initial Velocity = ${colV2} m/s
- **Restitution Coefficient (e)**: ${colElasticity === 1 ? '1.0 (Perfect Elasticity)' : colElasticity === 0 ? '0.0 (Completely Inelastic)' : colElasticity}
- **Total Linear Momentum**: \`${pTot.toFixed(2)} kg·m/s\` (Strictly Conserved)
- **Initial Total Kinetic Energy**: \`${keTot.toFixed(2)} Joules\`

*Takeaway*: Momentum is conserved in all isolated collisions by Newton's 3rd Law. Kinetic energy is only conserved in elastic collisions.`;
    } else if (activeSim === 'gravity') {
      title = 'Keplerian Orbital Mechanics Analysis';
      content = `### Orbital Mechanics & Gravitational Equilibrium
- **Orbital Radius**: ${orbitRadius} units
- **Kepler's 3rd Law Formula**: \`T² = (4π² / GM) · r³\`
- **Orbital Velocity Condition**: \`v_circ = √(GM / r)\`
- **Escape Velocity**: \`v_esc = √2 · v_circ\`

*Takeaway*: Centripetal acceleration required to keep a planet in circular orbit is provided entirely by Newton's universal gravitational attraction.`;
    } else {
      const T = 2 * Math.PI * Math.sqrt(pendLength / 9.81);
      title = 'Simple Harmonic Pendulum Dynamics';
      content = `### Harmonic Oscillation & Energy Exchange
- **String Length (L)**: ${pendLength} meters
- **Calculated Period (T)**: \`${T.toFixed(2)} seconds\`
- **Frequency**: \`${(1 / T).toFixed(2)} Hz\`
- **Damping Factor**: ${pendDamping}

*Takeaway*: The period of a simple pendulum depends only on the length and local gravity, and is independent of the bob's mass.`;
    }

    onAddNote(
      title,
      'Physics',
      content,
      ['Physics Simulation', activeSim, 'Kinematics'],
      `Physics Lab: ${activeSim}`
    );

    setNoteCopied(true);
    setTimeout(() => setNoteCopied(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Motion Physics Simulations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time interactive mechanics with forces, vectors, telemetry, and automated comprehension quizzes.
          </p>
        </div>

        {/* Sim Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'projectile', label: 'Projectile Motion' },
            { id: 'collision', label: '1D Collisions' },
            { id: 'gravity', label: 'Orbital Gravity' },
            { id: 'pendulum', label: 'Harmonic Pendulum' }
          ].map((tab) => {
            const isSel = activeSim === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSim(tab.id as PhysicsSimType);
                  setQuizActive(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Physics Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Canvas Viewport */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col min-h-[540px]">
          {/* Top Bar HUD */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white capitalize">
                {activeSim.replace('_', ' ')} Simulation
              </span>
              <span className="text-slate-500 text-xs">·</span>
              <span className="text-[11px] font-mono text-cyan-400">
                {isRunning ? 'RUNNING' : 'PAUSED'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  simTimeRef.current = 0;
                  cart1PosRef.current = 100;
                  cart2PosRef.current = 380;
                  cart1VelRef.current = colV1;
                  cart2VelRef.current = colV2;
                  pendThetaRef.current = (pendAngle0 * Math.PI) / 180;
                  pendOmegaRef.current = 0;
                }}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2D Canvas */}
          <div className="flex-1 w-full h-[380px] relative bg-slate-950 science-grid">
            <canvas
              ref={canvasRef}
              width={700}
              height={380}
              className="w-full h-full block"
            />
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleOpenQuiz}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-xl transition-all shadow-md shadow-cyan-500/20"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Test Understanding (Take Quiz)</span>
            </button>

            <button
              onClick={handleSaveToNotes}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-300 rounded-xl transition-all"
            >
              {noteCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <PlusCircle className="w-3.5 h-3.5" />}
              <span>{noteCopied ? 'Logged to Notes!' : 'Log Simulation to Notes'}</span>
            </button>
          </div>
        </div>

        {/* Right: Simulation Controls & Quiz Deck */}
        <div className="lg:col-span-4 space-y-4">
          {quizActive ? (
            /* Interactive Quiz Mode */
            <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-5 space-y-4 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Comprehension Quiz</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
              </div>

              {!quizCompleted ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-white leading-relaxed">
                    {questions[currentQIndex]?.prompt}
                  </h4>

                  {/* Options */}
                  <div className="space-y-2">
                    {questions[currentQIndex]?.options.map((opt, idx) => {
                      const isChosen = selectedAnswer === idx;
                      const isCorrect = idx === questions[currentQIndex].correctIndex;
                      let btnStyle = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700';

                      if (selectedAnswer !== null) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-semibold';
                        } else if (isChosen) {
                          btnStyle = 'bg-red-950/40 border-red-500/60 text-red-300';
                        } else {
                          btnStyle = 'opacity-40 bg-slate-950 border-slate-900 text-slate-500';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectQuizAnswer(idx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {selectedAnswer !== null && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {selectedAnswer !== null && (
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                      <span className="font-semibold text-cyan-400 block text-[11px]">
                        PHYSICS EXPLANATION:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {questions[currentQIndex]?.explanation}
                      </p>
                      <div className="font-mono text-[10px] text-slate-400 pt-1">
                        Formula: {questions[currentQIndex]?.formulaUsed}
                      </div>

                      <button
                        onClick={handleNextQuestion}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                      >
                        <span>{currentQIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Quiz Complete Score Card */
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-300">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      Simulation Mastered!
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      You scored <span className="font-mono text-cyan-300 font-bold">{score} / {questions.length}</span> on this trial.
                    </p>
                  </div>
                  <button
                    onClick={() => setQuizActive(false)}
                    className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                  >
                    Return to Simulation Controls
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Simulation Parameter Controls */
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Simulation Parameters
                </span>
                <span className="text-[11px] font-mono text-cyan-400">Live Modifiers</span>
              </div>

              {activeSim === 'projectile' && (
                <div className="space-y-4">
                  {/* Velocity Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Initial Velocity (v₀):</span>
                      <span className="font-mono text-cyan-400 font-semibold">{projV0} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={projV0}
                      onChange={(e) => setProjV0(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-400"
                    />
                  </div>

                  {/* Angle Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Launch Angle (θ):</span>
                      <span className="font-mono text-cyan-400 font-semibold">{projAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="85"
                      value={projAngle}
                      onChange={(e) => setProjAngle(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-400"
                    />
                  </div>

                  {/* Planet / Gravity Selector */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 block">Celestial Gravity:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CELESTIAL_BODIES.map((body, i) => (
                        <button
                          key={body.id}
                          onClick={() => setProjBodyIndex(i)}
                          className={`p-2 rounded-lg text-xs font-medium text-left border transition-all ${
                            projBodyIndex === i
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-semibold">{body.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{body.gravity} m/s²</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Air Resistance Toggle */}
                  <label className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-300 cursor-pointer">
                    <span>Atmospheric Air Resistance (Drag):</span>
                    <input
                      type="checkbox"
                      checked={projAirResistance}
                      onChange={(e) => setProjAirResistance(e.target.checked)}
                      className="rounded accent-cyan-400 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              )}

              {activeSim === 'collision' && (
                <div className="space-y-4">
                  {/* Cart 1 Mass & Velocity */}
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-cyan-400 block">Cart 1 (Blue)</span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Mass:</span>
                      <span className="font-mono text-white">{colM1} kg</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.5"
                      value={colM1}
                      onChange={(e) => setColM1(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Velocity:</span>
                      <span className="font-mono text-white">{colV1} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="0.5"
                      value={colV1}
                      onChange={(e) => setColV1(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>

                  {/* Cart 2 Mass & Velocity */}
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-amber-400 block">Cart 2 (Amber)</span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Mass:</span>
                      <span className="font-mono text-white">{colM2} kg</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.5"
                      value={colM2}
                      onChange={(e) => setColM2(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-amber-400"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Velocity:</span>
                      <span className="font-mono text-white">{colV2} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="0.5"
                      value={colV2}
                      onChange={(e) => setColV2(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-amber-400"
                    />
                  </div>

                  {/* Elasticity Restitution */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Elasticity Restitution (e):</span>
                      <span className="font-mono text-cyan-400">{colElasticity}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={colElasticity}
                      onChange={(e) => setColElasticity(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>
                </div>
              )}

              {activeSim === 'gravity' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Orbital Distance (r):</span>
                      <span className="font-mono text-cyan-400">{orbitRadius} px</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="240"
                      value={orbitRadius}
                      onChange={(e) => setOrbitRadius(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Simulation Velocity:</span>
                      <span className="font-mono text-cyan-400">{orbitSpeed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.1"
                      value={orbitSpeed}
                      onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>
                </div>
              )}

              {activeSim === 'pendulum' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">String Length (L):</span>
                      <span className="font-mono text-cyan-400">{pendLength.toFixed(1)} m</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="3.0"
                      step="0.1"
                      value={pendLength}
                      onChange={(e) => setPendLength(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Initial Release Angle (θ₀):</span>
                      <span className="font-mono text-cyan-400">{pendAngle0}°</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={pendAngle0}
                      onChange={(e) => setPendAngle0(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Damping Factor:</span>
                      <span className="font-mono text-cyan-400">{pendDamping}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.08"
                      step="0.01"
                      value={pendDamping}
                      onChange={(e) => setPendDamping(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded accent-cyan-400"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Physics 2D Canvas Renderers ---

function renderProjectileSim(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dt: number,
  running: boolean,
  params: { v0: number; angle: number; gravity: number; airRes: boolean; time: number }
) {
  const theta = (params.angle * Math.PI) / 180;
  const v0x = params.v0 * Math.cos(theta);
  const v0y = params.v0 * Math.sin(theta);
  const g = params.gravity;

  const tFlight = (2 * v0y) / g;
  const loopTime = params.time % (tFlight + 1.2);
  const currentT = Math.min(tFlight, loopTime);

  // Trajectory scale
  const scaleX = 4.2;
  const scaleY = 4.2;
  const originX = 60;
  const originY = canvas.height - 40;

  // Ground plane
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, originY);
  ctx.lineTo(canvas.width, originY);
  ctx.stroke();

  // Full Theoretical Trajectory Arc
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  for (let t = 0; t <= tFlight; t += 0.05) {
    const x = originX + v0x * t * scaleX;
    const y = originY - (v0y * t - 0.5 * g * t * t) * scaleY;
    if (t === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Current Projectile Position
  const curX = originX + v0x * currentT * scaleX;
  const curY = originY - (v0y * currentT - 0.5 * g * currentT * currentT) * scaleY;
  const curVx = v0x;
  const curVy = v0y - g * currentT;

  // Draw Cannon Base
  ctx.save();
  ctx.translate(originX, originY);
  ctx.rotate(-theta);
  ctx.fillStyle = '#475569';
  ctx.fillRect(-8, -8, 32, 16);
  ctx.restore();

  // Draw Projectile Ball
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#0284c7';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(curX, curY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Velocity Vector Arrows (Vx, Vy, Resultant)
  // 1. Vx arrow (Horizontal Cyan)
  drawArrow(ctx, curX, curY, curX + curVx * 1.5, curY, '#06b6d4', 'Vx');
  // 2. Vy arrow (Vertical Amber)
  drawArrow(ctx, curX, curY, curX, curY - curVy * 1.5, '#f59e0b', 'Vy');
  // 3. Resultant V arrow (White)
  drawArrow(ctx, curX, curY, curX + curVx * 1.5, curY - curVy * 1.5, '#ffffff', 'V');

  // Telemetry HUD inside canvas
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.fillRect(originX + 10, 20, 240, 80);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(originX + 10, 20, 240, 80);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px "JetBrains Mono"';
  ctx.fillText(`Time (t): ${currentT.toFixed(2)} s / ${tFlight.toFixed(2)} s`, originX + 20, 40);
  ctx.fillText(`Apex Max Height: ${((v0y * v0y) / (2 * g)).toFixed(1)} m`, originX + 20, 58);
  ctx.fillText(`Range (R): ${(v0x * tFlight).toFixed(1)} m`, originX + 20, 76);
  ctx.fillText(`Current V_y: ${curVy.toFixed(1)} m/s`, originX + 20, 94);
}

function renderCollisionSim(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dt: number,
  running: boolean,
  params: {
    m1: number;
    m2: number;
    v1Init: number;
    v2Init: number;
    e: number;
    cart1PosRef: React.MutableRefObject<number>;
    cart2PosRef: React.MutableRefObject<number>;
    cart1VelRef: React.MutableRefObject<number>;
    cart2VelRef: React.MutableRefObject<number>;
  }
) {
  const trackY = canvas.height / 2;
  const cartWidth = 60;
  const cartHeight = 35;

  // Air Track
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, trackY + 15, canvas.width - 80, 8);

  // Update dynamic positions
  if (running) {
    params.cart1PosRef.current += params.cart1VelRef.current * 40 * dt;
    params.cart2PosRef.current += params.cart2VelRef.current * 40 * dt;

    // Collision check between carts
    if (params.cart1PosRef.current + cartWidth >= params.cart2PosRef.current) {
      // 1D restitution collision equations
      const m1 = params.m1;
      const m2 = params.m2;
      const u1 = params.cart1VelRef.current;
      const u2 = params.cart2VelRef.current;
      const e = params.e;

      const v1 = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);
      const v2 = ((1 + e) * m1 * u1 + (m2 - e * m1) * u2) / (m1 + m2);

      params.cart1VelRef.current = v1;
      params.cart2VelRef.current = v2;
      params.cart1PosRef.current = params.cart2PosRef.current - cartWidth; // Separate
    }

    // Wall bounce
    if (params.cart1PosRef.current < 50) {
      params.cart1VelRef.current = Math.abs(params.cart1VelRef.current);
    }
    if (params.cart2PosRef.current > canvas.width - 50 - cartWidth) {
      params.cart2VelRef.current = -Math.abs(params.cart2VelRef.current);
    }
  }

  // Draw Cart 1 (Blue)
  const x1 = params.cart1PosRef.current;
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x1, trackY - cartHeight + 15, cartWidth, cartHeight);
  ctx.strokeStyle = '#38bdf8';
  ctx.strokeRect(x1, trackY - cartHeight + 15, cartWidth, cartHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(`C1: ${params.m1}kg`, x1 + 10, trackY - 5);

  // Draw Cart 2 (Amber)
  const x2 = params.cart2PosRef.current;
  ctx.fillStyle = '#d97706';
  ctx.fillRect(x2, trackY - cartHeight + 15, cartWidth, cartHeight);
  ctx.strokeStyle = '#fbbf24';
  ctx.strokeRect(x2, trackY - cartHeight + 15, cartWidth, cartHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(`C2: ${params.m2}kg`, x2 + 10, trackY - 5);

  // Velocity arrows on carts
  drawArrow(ctx, x1 + cartWidth / 2, trackY - cartHeight + 5, x1 + cartWidth / 2 + params.cart1VelRef.current * 15, trackY - cartHeight + 5, '#38bdf8', `${params.cart1VelRef.current.toFixed(1)} m/s`);
  drawArrow(ctx, x2 + cartWidth / 2, trackY - cartHeight + 5, x2 + cartWidth / 2 + params.cart2VelRef.current * 15, trackY - cartHeight + 5, '#fbbf24', `${params.cart2VelRef.current.toFixed(1)} m/s`);

  // Telemetry: Momentum & Kinetic Energy
  const p1 = params.m1 * params.cart1VelRef.current;
  const p2 = params.m2 * params.cart2VelRef.current;
  const pTot = p1 + p2;
  const keTot = 0.5 * params.m1 * Math.pow(params.cart1VelRef.current, 2) + 0.5 * params.m2 * Math.pow(params.cart2VelRef.current, 2);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px "JetBrains Mono"';
  ctx.fillText(`Total Momentum (p): ${pTot.toFixed(2)} kg·m/s (CONSERVED)`, 60, 40);
  ctx.fillText(`Total Kinetic Energy (KE): ${keTot.toFixed(2)} J`, 60, 60);
}

function renderGravityOrbitSim(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dt: number,
  running: boolean,
  params: { radius: number; speedMult: number; time: number }
) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Central Sun / Star
  ctx.fillStyle = '#f59e0b';
  ctx.shadowColor = '#d97706';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Orbital Path Circle
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.beginPath();
  ctx.arc(cx, cy, params.radius, 0, Math.PI * 2);
  ctx.stroke();

  // Planet Position
  const angle = params.time * 0.8 * params.speedMult;
  const px = cx + Math.cos(angle) * params.radius;
  const py = cy + Math.sin(angle) * params.radius;

  // Orbiting Planet
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(px, py, 9, 0, Math.PI * 2);
  ctx.fill();

  // Tangential Velocity Vector
  const vx = -Math.sin(angle) * 40;
  const vy = Math.cos(angle) * 40;
  drawArrow(ctx, px, py, px + vx, py + vy, '#10b981', 'v_orb');

  // Centripetal Gravitational Force Vector
  const fx = (cx - px) * 0.35;
  const fy = (cy - py) * 0.35;
  drawArrow(ctx, px, py, px + fx, py + fy, '#ef4444', 'F_gravity');
}

function renderPendulumSim(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dt: number,
  running: boolean,
  params: {
    length: number;
    damping: number;
    pendThetaRef: React.MutableRefObject<number>;
    pendOmegaRef: React.MutableRefObject<number>;
  }
) {
  const pivotX = canvas.width / 2;
  const pivotY = 50;
  const pixelLength = params.length * 90;

  if (running) {
    // Angular acceleration: alpha = - (g / L) * sin(theta) - damping * omega
    const g = 9.81;
    const alpha = -(g / params.length) * Math.sin(params.pendThetaRef.current) - params.damping * params.pendOmegaRef.current;
    params.pendOmegaRef.current += alpha * dt;
    params.pendThetaRef.current += params.pendOmegaRef.current * dt;
  }

  const bobX = pivotX + Math.sin(params.pendThetaRef.current) * pixelLength;
  const bobY = pivotY + Math.cos(params.pendThetaRef.current) * pixelLength;

  // Ceiling Pivot Mount
  ctx.fillStyle = '#475569';
  ctx.fillRect(pivotX - 30, pivotY - 8, 60, 8);

  // Pendulum String
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(bobX, bobY);
  ctx.stroke();

  // Bob
  ctx.fillStyle = '#06b6d4';
  ctx.shadowColor = '#0284c7';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(bobX, bobY, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// Arrow helper
function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  label: string
) {
  const headLen = 7;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  ctx.font = '10px "JetBrains Mono"';
  ctx.fillText(label, toX + 5, toY - 5);
}

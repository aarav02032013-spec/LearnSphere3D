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
  generatePendulumQuiz,
  generateNewtonFirstQuiz,
  generateNewtonSecondQuiz,
  generateNewtonThirdQuiz
} from '../data/physicsData';

interface PhysicsSimulationsProps {
  onAddNote: (title: string, subject: 'Physics', content: string, tags: string[], labRef: string) => void;
}

export const PhysicsSimulations: React.FC<PhysicsSimulationsProps> = ({ onAddNote }) => {
  const [activeSim, setActiveSim] = useState<PhysicsSimType>('newton_second');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [noteCopied, setNoteCopied] = useState<boolean>(false);

  // --- Newton's 1st Law (Inertia) State ---
  const [n1Mass, setN1Mass] = useState<number>(5.0); // kg
  const [n1Friction, setN1Friction] = useState<number>(0.0); // 0 = frictionless ice/space
  const [n1PuckSpeed, setN1PuckSpeed] = useState<number>(14); // m/s impulse
  const n1PosRef = useRef<number>(140);
  const n1VelRef = useRef<number>(14);

  // --- Newton's 2nd Law (F = ma) State ---
  const [n2Force, setN2Force] = useState<number>(50); // Newtons
  const [n2Mass, setN2Mass] = useState<number>(10.0); // kg
  const [n2Friction, setN2Friction] = useState<number>(0.08); // coeff
  const n2PosRef = useRef<number>(160);
  const n2VelRef = useRef<number>(0);

  // --- Newton's 3rd Law (Action / Reaction) State ---
  const [n3Mode, setN3Mode] = useState<'astronauts' | 'rocket'>('astronauts');
  const [n3MassA, setN3MassA] = useState<number>(60); // kg
  const [n3MassB, setN3MassB] = useState<number>(120); // kg
  const [n3PushForce, setN3PushForce] = useState<number>(180); // N
  const n3PosARef = useRef<number>(290);
  const n3PosBRef = useRef<number>(390);
  const n3VelARef = useRef<number>(0);
  const n3VelBRef = useRef<number>(0);
  const n3RocketPosRef = useRef<number>(180);
  const n3RocketVelRef = useRef<number>(0);
  const n3RocketThrust = useRef<boolean>(true);
  const n3ParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);

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
    n1PosRef.current = 140;
    n1VelRef.current = n1PuckSpeed;
    n2PosRef.current = 160;
    n2VelRef.current = 0;
    n3PosARef.current = 290;
    n3PosBRef.current = 390;
    n3VelARef.current = 0;
    n3VelBRef.current = 0;
    n3RocketPosRef.current = 180;
    n3RocketVelRef.current = 0;
    n3ParticlesRef.current = [];
    cart1PosRef.current = 100;
    cart2PosRef.current = 380;
    cart1VelRef.current = colV1;
    cart2VelRef.current = colV2;
    pendThetaRef.current = (pendAngle0 * Math.PI) / 180;
    pendOmegaRef.current = 0;
  }, [
    activeSim,
    n1Mass,
    n1Friction,
    n1PuckSpeed,
    n2Force,
    n2Mass,
    n2Friction,
    n3Mode,
    n3MassA,
    n3MassB,
    n3PushForce,
    projV0,
    projAngle,
    projBodyIndex,
    colM1,
    colM2,
    colV1,
    colV2,
    colElasticity,
    pendLength,
    pendAngle0
  ]);

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

      if (activeSim === 'newton_first') {
        renderNewtonFirstSim(ctx, canvas, dt, isRunning, {
          mass: n1Mass,
          friction: n1Friction,
          posRef: n1PosRef,
          velRef: n1VelRef
        });
      } else if (activeSim === 'newton_second') {
        renderNewtonSecondSim(ctx, canvas, dt, isRunning, {
          force: n2Force,
          mass: n2Mass,
          friction: n2Friction,
          posRef: n2PosRef,
          velRef: n2VelRef
        });
      } else if (activeSim === 'newton_third') {
        renderNewtonThirdSim(ctx, canvas, dt, isRunning, {
          mode: n3Mode,
          massA: n3MassA,
          massB: n3MassB,
          pushForce: n3PushForce,
          posARef: n3PosARef,
          posBRef: n3PosBRef,
          velARef: n3VelARef,
          velBRef: n3VelBRef,
          rocketPosRef: n3RocketPosRef,
          rocketVelRef: n3RocketVelRef,
          particlesRef: n3ParticlesRef
        });
      } else if (activeSim === 'projectile') {
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
    n1Mass,
    n1Friction,
    n1PuckSpeed,
    n2Force,
    n2Mass,
    n2Friction,
    n3Mode,
    n3MassA,
    n3MassB,
    n3PushForce,
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
    if (activeSim === 'newton_first') {
      generated = generateNewtonFirstQuiz(n1Mass, n1Friction, n1VelRef.current);
    } else if (activeSim === 'newton_second') {
      generated = generateNewtonSecondQuiz(n2Force, n2Mass, n2Friction);
    } else if (activeSim === 'newton_third') {
      generated = generateNewtonThirdQuiz(n3MassA, n3MassB, n3PushForce);
    } else if (activeSim === 'projectile') {
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

    if (activeSim === 'newton_first') {
      const frictionForce = n1Friction * n1Mass * 9.81;
      title = "Newton's First Law of Motion: Law of Inertia";
      content = `### Newton's 1st Law (Law of Inertia)
- **Statement**: An object at rest stays at rest, and an object in motion continues with constant velocity in a straight line, unless acted upon by a net external force (∑F = 0 ⟹ a = 0, v = constant).
- **Tested Mass**: ${n1Mass} kg
- **Frictional Coefficient (μ)**: ${n1Friction.toFixed(2)} (${n1Friction === 0 ? 'Frictionless Space / Ice' : 'Contact Surface'})
- **Frictional Braking Force**: \`F_f = μ · m · g = ${frictionForce.toFixed(2)} N\`
- **Current Velocity**: \`${n1VelRef.current.toFixed(2)} m/s\`
- **Key Principle**: Friction is an external contact force that robs kinetic energy. In the absence of net external forces, velocity remains strictly constant without requiring any continuous propulsion force!`;
    } else if (activeSim === 'newton_second') {
      const fNorm = n2Mass * 9.81;
      const fFricMax = n2Friction * fNorm;
      const fNet = Math.abs(n2Force) > fFricMax ? n2Force - Math.sign(n2Force) * fFricMax : 0;
      const accel = fNet / n2Mass;
      title = "Newton's Second Law of Motion: F_net = m · a";
      content = `### Newton's 2nd Law (Force, Mass & Acceleration)
- **Fundamental Formula**: \`F_net = m · a ⟹ a = F_net / m\`
- **Applied Force (F_applied)**: \`${n2Force} N\`
- **Object Mass (m)**: \`${n2Mass} kg\`
- **Friction Force (F_f)**: \`${fFricMax.toFixed(2)} N\` (μ = ${n2Friction.toFixed(2)})
- **Net Resultant Force (F_net)**: \`${fNet.toFixed(2)} N\`
- **Calculated Acceleration (a)**: \`${accel.toFixed(2)} m/s²\`
- **Key Insight**: Acceleration is directly proportional to net force and inversely proportional to inertia/mass. Doubling force doubles acceleration; doubling mass halves acceleration.`;
    } else if (activeSim === 'newton_third') {
      title = "Newton's Third Law of Motion: Action & Reaction";
      const accelA = n3PushForce / n3MassA;
      const accelB = n3PushForce / n3MassB;
      content = `### Newton's 3rd Law (Action-Reaction Pairs)
- **Principle**: Whenever object A exerts a force on object B, object B simultaneously exerts an equal and opposite force on object A: \`F_{A → B} = -F_{B → A}\`.
- **Interaction Push Force**: \`${n3PushForce} N\`
- **Astronaut A (m_A = ${n3MassA} kg)**: Experiences Force = \`-${n3PushForce} N\`, resulting in acceleration \`a_A = -${accelA.toFixed(2)} m/s²\`.
- **Astronaut B (m_B = ${n3MassB} kg)**: Experiences Force = \`+${n3PushForce} N\`, resulting in acceleration \`a_B = +${accelB.toFixed(2)} m/s²\`.
- **Total System Momentum**: \`p_total = m_A·v_A + m_B·v_B = 0 kg·m/s\` (Conserved)
- **Why Forces Don't Cancel**: Action and reaction act on TWO DIFFERENT bodies, causing each body to accelerate independently according to its own mass!`;
    } else if (activeSim === 'projectile') {
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
      ['Physics Simulation', activeSim, 'NewtonLaws', 'Mechanics'],
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
            Newton's Laws of Motion, Kinematics, Collisions, Orbitals, and Real-Time Vector Dynamics.
          </p>
        </div>

        {/* Sim Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'newton_first', label: "Newton's 1st Law (Inertia)" },
            { id: 'newton_second', label: "Newton's 2nd Law (F = ma)" },
            { id: 'newton_third', label: "Newton's 3rd Law (Action/Reaction)" },
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
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isSel
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
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
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                title={isRunning ? 'Pause' : 'Play'}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  simTimeRef.current = 0;
                  n1PosRef.current = 140;
                  n1VelRef.current = n1PuckSpeed;
                  n2PosRef.current = 160;
                  n2VelRef.current = 0;
                  n3PosARef.current = 290;
                  n3PosBRef.current = 390;
                  n3VelARef.current = 0;
                  n3VelBRef.current = 0;
                  n3RocketPosRef.current = 180;
                  n3RocketVelRef.current = 0;
                  n3ParticlesRef.current = [];
                  cart1PosRef.current = 100;
                  cart2PosRef.current = 380;
                  cart1VelRef.current = colV1;
                  cart2VelRef.current = colV2;
                  pendThetaRef.current = (pendAngle0 * Math.PI) / 180;
                  pendOmegaRef.current = 0;
                }}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset simulation"
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

              {activeSim === 'newton_first' && (
                <div className="space-y-4">
                  {/* Impulse actions */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 block font-medium">Apply External Impulse Force:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          n1VelRef.current = 15;
                        }}
                        className="py-2 px-3 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 rounded-xl text-xs font-semibold text-cyan-300 transition-all cursor-pointer"
                      >
                        Push Right (+15 m/s)
                      </button>
                      <button
                        onClick={() => {
                          n1VelRef.current = -15;
                        }}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                      >
                        Push Left (-15 m/s)
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        n1VelRef.current = 0;
                      }}
                      className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Halt / Bring to Rest (v = 0)
                    </button>
                  </div>

                  {/* Surface Presets */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-400 block font-medium">Surface Medium (Friction μ):</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'Deep Space / Ice', mu: 0.0 },
                        { label: 'Teflon Track', mu: 0.08 },
                        { label: 'Polished Wood', mu: 0.20 },
                        { label: 'Rough Asphalt', mu: 0.50 }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => setN1Friction(item.mu)}
                          className={`p-2 rounded-xl text-xs text-left border transition-all cursor-pointer ${
                            n1Friction === item.mu
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-medium truncate">{item.label}</div>
                          <div className="text-[10px] text-slate-500 font-mono">μ = {item.mu.toFixed(2)}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mass Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Object Inertial Mass (m):</span>
                      <span className="font-mono text-cyan-400 font-semibold">{n1Mass} kg</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={n1Mass}
                      onChange={(e) => setN1Mass(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Custom Friction Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Custom Friction Coeff (μ):</span>
                      <span className="font-mono text-amber-400 font-semibold">{n1Friction.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.6"
                      step="0.02"
                      value={n1Friction}
                      onChange={(e) => setN1Friction(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeSim === 'newton_second' && (
                <div className="space-y-4">
                  {/* Applied Force Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Applied Force (F_app):</span>
                      <span className="font-mono text-cyan-400 font-bold">{n2Force > 0 ? `+${n2Force}` : n2Force} N</span>
                    </div>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      step="5"
                      value={n2Force}
                      onChange={(e) => setN2Force(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Force Presets */}
                  <div className="flex items-center gap-1.5">
                    {[-80, -40, 0, 40, 80].map((fVal) => (
                      <button
                        key={fVal}
                        onClick={() => setN2Force(fVal)}
                        className={`flex-1 py-1 rounded-lg font-mono text-[10px] border transition-all cursor-pointer ${
                          n2Force === fVal
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {fVal > 0 ? `+${fVal}` : fVal}N
                      </button>
                    ))}
                  </div>

                  {/* Mass Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Crate Mass (m):</span>
                      <span className="font-mono text-amber-300 font-semibold">{n2Mass} kg</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="35"
                      value={n2Mass}
                      onChange={(e) => setN2Mass(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Friction Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Surface Friction (μ):</span>
                      <span className="font-mono text-red-400 font-semibold">{n2Friction.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="0.30"
                      step="0.02"
                      value={n2Friction}
                      onChange={(e) => setN2Friction(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg accent-red-400 cursor-pointer"
                    />
                  </div>

                  {/* Live Formula Badge */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
                    <div className="text-[10px] text-slate-500 uppercase font-sans">Newton's 2nd Law Calculation</div>
                    <div className="text-emerald-400 font-bold">
                      F_net = {Math.abs(n2Force) > (n2Friction * n2Mass * 9.81) ? (n2Force - Math.sign(n2Force) * n2Friction * n2Mass * 9.81).toFixed(1) : 0} N
                    </div>
                    <div className="text-cyan-300 text-[11px]">
                      a = F_net / m = {Math.abs(n2Force) > (n2Friction * n2Mass * 9.81) ? ((n2Force - Math.sign(n2Force) * n2Friction * n2Mass * 9.81) / n2Mass).toFixed(2) : '0.00'} m/s²
                    </div>
                  </div>
                </div>
              )}

              {activeSim === 'newton_third' && (
                <div className="space-y-4">
                  {/* Mode switcher */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => setN3Mode('astronauts')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        n3Mode === 'astronauts'
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Astronauts on Ice
                    </button>
                    <button
                      onClick={() => setN3Mode('rocket')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        n3Mode === 'rocket'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Rocket Gas Thrust
                    </button>
                  </div>

                  {n3Mode === 'astronauts' ? (
                    <div className="space-y-3.5">
                      {/* Push Force */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Interaction Push Force (F):</span>
                          <span className="font-mono text-cyan-400 font-semibold">{n3PushForce} N</span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="350"
                          step="10"
                          value={n3PushForce}
                          onChange={(e) => setN3PushForce(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
                        />
                      </div>

                      {/* Astronaut A Mass */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Astronaut A Mass (Left):</span>
                          <span className="font-mono text-cyan-300 font-semibold">{n3MassA} kg</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="120"
                          value={n3MassA}
                          onChange={(e) => setN3MassA(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
                        />
                      </div>

                      {/* Astronaut B Mass */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Astronaut B Mass (Right):</span>
                          <span className="font-mono text-amber-300 font-semibold">{n3MassB} kg</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="180"
                          value={n3MassB}
                          onChange={(e) => setN3MassB(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg accent-amber-400 cursor-pointer"
                        />
                      </div>

                      {/* Push action buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            // Apply push impulse
                            const dtImpulse = 0.25; // seconds
                            const impulse = n3PushForce * dtImpulse;
                            n3VelARef.current = -impulse / n3MassA;
                            n3VelBRef.current = impulse / n3MassB;
                          }}
                          className="py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                        >
                          Trigger Push!
                        </button>
                        <button
                          onClick={() => {
                            n3PosARef.current = 290;
                            n3PosBRef.current = 390;
                            n3VelARef.current = 0;
                            n3VelBRef.current = 0;
                          }}
                          className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                        >
                          Reset Together
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Thruster Action Force (F_thrust):</span>
                          <span className="font-mono text-amber-400 font-semibold">{n3PushForce} N</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="400"
                          step="10"
                          value={n3PushForce}
                          onChange={(e) => setN3PushForce(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg accent-amber-400 cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            n3RocketThrust.current = !n3RocketThrust.current;
                          }}
                          className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            n3RocketThrust.current
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {n3RocketThrust.current ? 'Engine: FIRING' : 'Engine: OFF'}
                        </button>
                        <button
                          onClick={() => {
                            n3RocketPosRef.current = 180;
                            n3RocketVelRef.current = 0;
                            n3ParticlesRef.current = [];
                          }}
                          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                        >
                          Reset Rocket
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

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

function renderNewtonFirstSim(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dt: number,
  running: boolean,
  params: {
    mass: number;
    friction: number;
    posRef: React.MutableRefObject<number>;
    velRef: React.MutableRefObject<number>;
  }
) {
  let pos = params.posRef.current;
  let vel = params.velRef.current;
  const mass = params.mass;
  const mu = params.friction;
  const g = 9.81;

  // Calculate friction deceleration
  const normalForce = mass * g;
  const frictionForce = mu * normalForce;

  if (running) {
    if (mu > 0 && Math.abs(vel) > 0.01) {
      const decel = (frictionForce / mass) * dt;
      if (Math.abs(vel) <= decel) {
        vel = 0;
      } else {
        vel -= Math.sign(vel) * decel;
      }
    }
    // Update position
    pos += vel * dt * 32;

    // Elastic boundary bounce
    const minX = 65;
    const maxX = canvas.width - 65;
    if (pos <= minX) {
      pos = minX;
      vel = -vel * (mu === 0 ? 1 : 0.85);
    } else if (pos >= maxX) {
      pos = maxX;
      vel = -vel * (mu === 0 ? 1 : 0.85);
    }

    params.posRef.current = pos;
    params.velRef.current = vel;
  }

  const trackY = canvas.height - 75;

  // Background environment
  if (mu === 0) {
    // Deep Space Zero-G Void look
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Starfield specks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 35; i++) {
      const sx = (i * 73 + 19) % canvas.width;
      const sy = (i * 47 + 23) % (trackY - 20);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Glowing superconducting rail
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, trackY);
    ctx.lineTo(canvas.width, trackY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else {
    // Laboratory Test Track
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, trackY);
    ctx.lineTo(canvas.width, trackY);
    ctx.stroke();

    // Track friction hatch marks
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, trackY);
      ctx.lineTo(x - 6, trackY + 12);
      ctx.stroke();
    }
  }

  // End padded bumpers
  ctx.fillStyle = '#334155';
  ctx.fillRect(20, trackY - 35, 12, 35);
  ctx.fillRect(canvas.width - 32, trackY - 35, 12, 35);

  // Puck / Hover Vehicle
  const puckW = 60;
  const puckH = 26;
  const puckY = trackY - puckH - 2;

  // Hover glow under puck
  ctx.fillStyle = mu === 0 ? 'rgba(6, 182, 212, 0.5)' : 'rgba(245, 158, 11, 0.2)';
  ctx.shadowColor = mu === 0 ? '#06b6d4' : '#f59e0b';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.ellipse(pos, trackY, puckW * 0.45, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Puck body
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = mu === 0 ? '#06b6d4' : '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(pos - puckW / 2, puckY, puckW, puckH, 8);
  ctx.fill();
  ctx.stroke();

  // Puck Mass Tag
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "JetBrains Mono"';
  ctx.textAlign = 'center';
  ctx.fillText(`${mass} kg`, pos, puckY + 16);

  // Vectors on Puck
  // 1. Normal Force (Up, Green)
  drawArrow(ctx, pos, puckY, pos, puckY - 45, '#10b981', 'F_N');
  // 2. Gravitational Force (Down, Blue)
  drawArrow(ctx, pos, puckY + puckH, pos, puckY + puckH + 45, '#3b82f6', 'F_g');

  // 3. Velocity Vector (Cyan, horizontal)
  if (Math.abs(vel) > 0.05) {
    drawArrow(ctx, pos, puckY + puckH / 2, pos + vel * 4, puckY + puckH / 2, '#22d3ee', `v = ${vel.toFixed(1)} m/s`);
  }

  // 4. Friction Force (Red, opposing velocity)
  if (mu > 0 && Math.abs(vel) > 0.05) {
    const fDir = -Math.sign(vel);
    drawArrow(ctx, pos, puckY + puckH / 2, pos + fDir * 35, puckY + puckH / 2, '#ef4444', `F_f = ${frictionForce.toFixed(1)} N`);
  }

  // HUD Panel inside canvas
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(20, 20, 310, 85);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(20, 20, 310, 85);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px "Syne", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText("NEWTON'S 1ST LAW: LAW OF INERTIA", 32, 40);

  ctx.font = '11px "JetBrains Mono"';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Velocity (v): ${vel.toFixed(2)} m/s`, 32, 58);
  ctx.fillText(`Friction (μ): ${mu.toFixed(2)} | Braking F_f: ${Math.abs(vel) > 0.01 ? frictionForce.toFixed(1) : 0} N`, 32, 74);
  ctx.fillText(`Net Force (∑F): ${mu === 0 || Math.abs(vel) < 0.01 ? '0.0 N (BALANCED)' : `${frictionForce.toFixed(1)} N (UNBALANCED)`}`, 32, 90);

  // Status Banner
  ctx.fillStyle = mu === 0 && Math.abs(vel) > 0.05
    ? 'rgba(6, 182, 212, 0.2)'
    : Math.abs(vel) < 0.05
    ? 'rgba(100, 116, 139, 0.2)'
    : 'rgba(239, 68, 68, 0.2)';
  ctx.strokeStyle = mu === 0 && Math.abs(vel) > 0.05 ? '#06b6d4' : Math.abs(vel) < 0.05 ? '#64748b' : '#ef4444';
  ctx.fillRect(canvas.width - 330, 20, 310, 48);
  ctx.strokeRect(canvas.width - 330, 20, 310, 48);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  if (mu === 0 && Math.abs(vel) > 0.05) {
    ctx.fillText('✨ INERTIAL DRIFT: ∑F = 0', canvas.width - 175, 40);
    ctx.font = '10px "JetBrains Mono"';
    ctx.fillStyle = '#67e8f9';
    ctx.fillText('v = Constant without propulsion force!', canvas.width - 175, 56);
  } else if (Math.abs(vel) < 0.05) {
    ctx.fillText('⚪ OBJECT AT REST (v = 0)', canvas.width - 175, 40);
    ctx.font = '10px "JetBrains Mono"';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Stays at rest until net force is applied.', canvas.width - 175, 56);
  } else {
    ctx.fillText('⚠️ DECELERATING (Friction Acting)', canvas.width - 175, 40);
    ctx.font = '10px "JetBrains Mono"';
    ctx.fillStyle = '#fca5a5';
    ctx.fillText(`Net external force a = ${(frictionForce / mass).toFixed(2)} m/s²`, canvas.width - 175, 56);
  }
}

function renderNewtonSecondSim(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dt: number,
  running: boolean,
  params: {
    force: number;
    mass: number;
    friction: number;
    posRef: React.MutableRefObject<number>;
    velRef: React.MutableRefObject<number>;
  }
) {
  let pos = params.posRef.current;
  let vel = params.velRef.current;
  const mass = params.mass;
  const force = params.force;
  const mu = params.friction;
  const g = 9.81;

  const normalForce = mass * g;
  const maxFriction = mu * normalForce;

  let netForce = 0;
  if (Math.abs(vel) < 0.05) {
    if (Math.abs(force) > maxFriction) {
      netForce = force - Math.sign(force) * maxFriction;
    } else {
      netForce = 0;
    }
  } else {
    const frictionAgainstMotion = -Math.sign(vel) * maxFriction;
    netForce = force + frictionAgainstMotion;
  }

  const accel = netForce / mass;

  if (running) {
    vel += accel * dt;
    // Static friction stop check
    if (force === 0 && Math.abs(vel) < 0.1) {
      vel = 0;
    }
    pos += vel * dt * 24;

    const minX = 85;
    const maxX = canvas.width - 85;
    if (pos <= minX) {
      pos = minX;
      vel = -vel * 0.4;
    } else if (pos >= maxX) {
      pos = maxX;
      vel = -vel * 0.4;
    }

    params.posRef.current = pos;
    params.velRef.current = vel;
  }

  const trackY = canvas.height - 75;

  // Track & background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, trackY);
  ctx.lineTo(canvas.width, trackY);
  ctx.stroke();

  // Runway distance ticks
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
  ctx.fillStyle = '#64748b';
  ctx.font = '9px "JetBrains Mono"';
  ctx.textAlign = 'center';
  for (let x = 60; x <= canvas.width - 60; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, trackY);
    ctx.lineTo(x, trackY + 8);
    ctx.stroke();
    ctx.fillText(`${(x / 50).toFixed(0)}m`, x, trackY + 20);
  }

  // Crate Dimensions
  const crateW = Math.min(80, Math.max(50, 40 + mass * 1.4));
  const crateH = Math.min(70, Math.max(45, 35 + mass * 1.1));
  const crateX = pos - crateW / 2;
  const crateY = trackY - crateH;

  // Crate shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(pos, trackY, crateW * 0.55, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crate Body
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(crateX, crateY, crateW, crateH, 6);
  ctx.fill();
  ctx.stroke();

  // Crate diagonal brace lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(crateX + 4, crateY + 4);
  ctx.lineTo(crateX + crateW - 4, crateY + crateH - 4);
  ctx.moveTo(crateX + crateW - 4, crateY + 4);
  ctx.lineTo(crateX + 4, crateY + crateH - 4);
  ctx.stroke();

  // Crate Label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "JetBrains Mono"';
  ctx.fillText(`${mass} kg`, pos, crateY + crateH / 2 + 4);

  // Pusher Figure (Robot / Student silhouette pushing the crate)
  if (force !== 0) {
    const isPushRight = force > 0;
    const pusherX = isPushRight ? crateX - 22 : crateX + crateW + 22;
    const pusherY = trackY - 32;

    ctx.save();
    ctx.fillStyle = '#06b6d4';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;

    // Head
    ctx.beginPath();
    ctx.arc(pusherX, pusherY - 20, 7, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(pusherX, pusherY - 13);
    ctx.lineTo(isPushRight ? pusherX + 8 : pusherX - 8, pusherY + 12);
    ctx.stroke();

    // Pushing arms
    ctx.beginPath();
    ctx.moveTo(pusherX, pusherY - 5);
    ctx.lineTo(isPushRight ? crateX : crateX + crateW, pusherY - 2);
    ctx.stroke();

    ctx.restore();
  }

  // Force Vectors
  // 1. Applied Force Arrow (Cyan)
  if (force !== 0) {
    const arrowLen = Math.min(110, Math.abs(force) * 0.9);
    const startX = force > 0 ? crateX : crateX + crateW;
    const endX = startX + Math.sign(force) * arrowLen;
    drawArrow(ctx, startX, crateY + crateH * 0.35, endX, crateY + crateH * 0.35, '#06b6d4', `F_app = ${force} N`);
  }

  // 2. Friction Arrow (Red)
  if (mu > 0 && (Math.abs(vel) > 0.05 || Math.abs(force) > 0)) {
    const fDir = vel !== 0 ? -Math.sign(vel) : -Math.sign(force);
    const fLen = Math.min(80, maxFriction * 0.8);
    drawArrow(ctx, pos, trackY - 5, pos + fDir * fLen, trackY - 5, '#ef4444', `F_f = ${maxFriction.toFixed(1)} N`);
  }

  // 3. Resultant Acceleration Vector (Yellow, above crate)
  if (Math.abs(accel) > 0.02) {
    const aLen = Math.min(90, Math.abs(accel) * 14);
    drawArrow(ctx, pos, crateY - 18, pos + Math.sign(accel) * aLen, crateY - 18, '#facc15', `a = ${accel.toFixed(2)} m/s²`);
  }

  // Top Equation Board HUD
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(20, 20, 420, 88);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(20, 20, 420, 88);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px "Syne", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText("NEWTON'S 2ND LAW: F_net = m · a", 32, 40);

  ctx.font = '12px "JetBrains Mono"';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`F_net = ${netForce.toFixed(1)} N  |  m = ${mass} kg`, 32, 60);

  ctx.fillStyle = '#facc15';
  ctx.fillText(`a = F_net / m = ${accel.toFixed(2)} m/s²  |  v = ${vel.toFixed(1)} m/s`, 32, 80);

  ctx.font = '10px "JetBrains Mono"';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Applied: ${force} N  |  Friction: ${maxFriction.toFixed(1)} N`, 32, 98);
}

function renderNewtonThirdSim(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  dt: number,
  running: boolean,
  params: {
    mode: 'astronauts' | 'rocket';
    massA: number;
    massB: number;
    pushForce: number;
    posARef: React.MutableRefObject<number>;
    posBRef: React.MutableRefObject<number>;
    velARef: React.MutableRefObject<number>;
    velBRef: React.MutableRefObject<number>;
    rocketPosRef: React.MutableRefObject<number>;
    rocketVelRef: React.MutableRefObject<number>;
    particlesRef: React.MutableRefObject<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>;
  }
) {
  const { mode, massA, massB, pushForce } = params;

  if (mode === 'astronauts') {
    let posA = params.posARef.current;
    let posB = params.posBRef.current;
    let velA = params.velARef.current;
    let velB = params.velBRef.current;

    if (running) {
      posA += velA * dt * 26;
      posB += velB * dt * 26;

      // Soft rebound from walls
      if (posA <= 50) {
        posA = 50;
        velA = -velA * 0.9;
      }
      if (posB >= canvas.width - 50) {
        posB = canvas.width - 50;
        velB = -velB * 0.9;
      }

      params.posARef.current = posA;
      params.posBRef.current = posB;
      params.velARef.current = velA;
      params.velBRef.current = velB;
    }

    const trackY = canvas.height - 75;

    // Space / Frictionless Ice Floor
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, trackY);
    ctx.lineTo(canvas.width, trackY);
    ctx.stroke();

    // Draw Astronaut A (Cyan Suit)
    drawAstronaut(ctx, posA, trackY, massA, '#06b6d4', 'Astronaut A', velA);

    // Draw Astronaut B (Amber Suit)
    drawAstronaut(ctx, posB, trackY, massB, '#f59e0b', 'Astronaut B', velB);

    // Action-Reaction Equal & Opposite Force Arrows
    const midX = (posA + posB) / 2;
    const arrowY = trackY - 60;

    // Force on A by B (pointing left)
    drawArrow(ctx, midX, arrowY, midX - 80, arrowY, '#06b6d4', `F_{B→A} = -${pushForce} N`);
    // Force on B by A (pointing right)
    drawArrow(ctx, midX, arrowY, midX + 80, arrowY, '#f59e0b', `F_{A→B} = +${pushForce} N`);

    // Top HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(20, 20, canvas.width - 40, 75);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(20, 20, canvas.width - 40, 75);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "Syne", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("NEWTON'S 3RD LAW: F_{A → B} = -F_{B → A} (ACTION & REACTION)", 32, 40);

    ctx.font = '11px "JetBrains Mono"';
    ctx.fillStyle = '#22d3ee';
    ctx.fillText(`Astronaut A (${massA} kg): a_A = -${(pushForce / massA).toFixed(2)} m/s² | v_A = ${velA.toFixed(1)} m/s`, 32, 60);

    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Astronaut B (${massB} kg): a_B = +${(pushForce / massB).toFixed(2)} m/s² | v_B = ${velB.toFixed(1)} m/s`, 32, 78);

    ctx.textAlign = 'right';
    const pTotal = massA * velA + massB * velB;
    ctx.fillStyle = '#10b981';
    ctx.fillText(`Total Momentum: ${pTotal.toFixed(2)} kg·m/s (Conserved)`, canvas.width - 40, 60);
  } else {
    // Rocket Propulsion Mode
    let rX = params.rocketPosRef.current;
    let rV = params.rocketVelRef.current;
    const rY = canvas.height / 2;
    const rMass = 250; // kg

    // Background deep space
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97 + 13) % canvas.width;
      const sy = (i * 59 + 29) % canvas.height;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    if (running) {
      const rAccel = pushForce / rMass;
      rV += rAccel * dt;
      rX += rV * dt * 20;

      // Wrap rocket across screen
      if (rX > canvas.width + 80) {
        rX = -60;
      }

      // Generate exhaust fire/gas particles backward
      const particles = params.particlesRef.current;
      for (let p = 0; p < 4; p++) {
        particles.push({
          x: rX - 45,
          y: rY + (Math.random() - 0.5) * 12,
          vx: -(Math.random() * 180 + 160),
          vy: (Math.random() - 0.5) * 45,
          life: 1.0,
          color: p % 2 === 0 ? '#f97316' : '#facc15'
        });
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt * 2.2;
        if (pt.life <= 0) {
          particles.splice(i, 1);
        }
      }

      params.rocketPosRef.current = rX;
      params.rocketVelRef.current = rV;
    }

    // Render exhaust particles
    params.particlesRef.current.forEach((pt) => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.life;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (1 - pt.life) * 10 + 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Draw Rocket Body
    ctx.save();
    ctx.translate(rX, rY);

    // Rocket Hull
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(40, 0); // Nose cone
    ctx.lineTo(-30, -18);
    ctx.lineTo(-30, 18);
    ctx.closePath();
    ctx.fill();

    // Cockpit window
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(10, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Rocket fins
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-20, -18);
    ctx.lineTo(-40, -32);
    ctx.lineTo(-30, -18);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-20, 18);
    ctx.lineTo(-40, 32);
    ctx.lineTo(-30, 18);
    ctx.fill();

    ctx.restore();

    // Draw Force Vectors
    // Action: Exhaust gas force pointing backward
    drawArrow(ctx, rX - 45, rY, rX - 140, rY, '#f97316', `ACTION: Gas Pushed Back (-${pushForce} N)`);
    // Reaction: Forward thrust propelling rocket forward
    drawArrow(ctx, rX + 40, rY, rX + 130, rY, '#22d3ee', `REACTION: Thrust (+${pushForce} N)`);

    // Top HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(20, 20, canvas.width - 40, 75);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(20, 20, canvas.width - 40, 75);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px "Syne", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("ROCKET REACTION PROPULSION IN VACUUM SPACE", 32, 40);

    ctx.font = '11px "JetBrains Mono"';
    ctx.fillStyle = '#f97316';
    ctx.fillText(`ACTION: Engine pushes exhaust gas particles backward with Force -${pushForce} N`, 32, 60);

    ctx.fillStyle = '#22d3ee';
    ctx.fillText(`REACTION: Gas particles push rocket hull forward with equal Force +${pushForce} N (v = ${rV.toFixed(1)} m/s)`, 32, 78);
  }
}

function drawAstronaut(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  mass: number,
  color: string,
  label: string,
  vel: number
) {
  const h = 55;
  const y = groundY - h;

  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, groundY, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spacesuit Legs
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 6, y + 35);
  ctx.lineTo(x - 7, groundY);
  ctx.moveTo(x + 6, y + 35);
  ctx.lineTo(x + 7, groundY);
  ctx.stroke();

  // Torso / Life Support Pack
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - 14, y + 15, 28, 24, 6);
  ctx.fill();
  ctx.stroke();

  // Helmet
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(x, y + 8, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Visor gold reflection
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 8, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Label & mass badge
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px "Plus Jakarta Sans"';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y - 8);

  ctx.fillStyle = color;
  ctx.font = '9px "JetBrains Mono"';
  ctx.fillText(`${mass} kg | v=${vel.toFixed(1)}`, x, y + 30);

  ctx.restore();
}

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

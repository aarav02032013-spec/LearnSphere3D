import React from 'react';
import { X, Sparkles, BookOpen, Layers, FlaskConical, Gauge, Compass } from 'lucide-react';

interface LabGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LabGuideModal: React.FC<LabGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                LearnSphere 3D Interactive Lab Guide
              </h3>
              <p className="text-xs text-slate-400">
                Quick orientation to the 5 interactive learning modules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              1. 3D Learning (Biology & Mathematics)
            </h4>
            <p className="text-slate-400">
              Explore plant cells, double helix DNA, human heart chambers, and 4D geometric tesseracts. Use your mouse to rotate and zoom. Click anatomical pinpoints to inspect cellular and mathematical invariant properties. Use the <strong>Explode Slider</strong> to slice open structures and toggle <strong>X-Ray</strong> glass transparency.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              2. Advanced 3D Lab (Machines & Tech)
            </h4>
            <p className="text-slate-400">
              Interact with industrial machines including dual-motor electric vehicles, turbofan jet engines with afterburners, 6-axis robotic arms, and supercomputing motherboards. Use the <strong>Throttle Lever</strong> to drive real-time physics and observe dynamic telemetry (RPM, Gross Thrust, Pack Power, Frequency).
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              3. Chemistry Lab (Safe Reaction Bench)
            </h4>
            <p className="text-slate-400">
              Combine acids, bases, salts, and catalysts. Watch real-time chemical reactions, effervescent gas bubbles, precipitates, and chemiluminescence. Control the <strong>Bunsen Burner</strong> and <strong>Magnetic Stirrer</strong> while monitoring digital pH and temperature telemetry.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              4. Physics Simulations & Comprehension Quizzes
            </h4>
            <p className="text-slate-400">
              Simulate projectile ballistics across different planetary gravities, 1D momentum conservation in cart collisions, Keplerian orbital gravity, and harmonic pendulums. Click <strong>Test Understanding</strong> to take a real-time comprehension quiz tailored to your simulation!
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
            <h4 className="font-semibold text-cyan-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              5. Permanent Personal Notes
            </h4>
            <p className="text-slate-400">
              Every simulation and 3D model features a <strong>"Save to Notes"</strong> button that automatically logs formulas, telemetry, and experiment observations directly to your browser storage. You can create custom notes, search tags, export as JSON, or print study sheets.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md shadow-cyan-500/20"
          >
            Start Exploring Labs
          </button>
        </div>
      </div>
    </div>
  );
};

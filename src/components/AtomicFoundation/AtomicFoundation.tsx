import React, { useState } from 'react';
import { PeriodicTable } from './PeriodicTable';
import { BohrModelVisualizer } from './BohrModelVisualizer';
import { QuantumModelVisualizer } from './QuantumModelVisualizer';
import { getElementByNumber, ALL_118_ELEMENTS_SUMMARY } from '../../data/elementsData';
import { AtomicSubTab } from '../../types/atomic';
import { Table, Atom, Sparkles, ChevronLeft, ChevronRight, Shuffle, BookmarkPlus } from 'lucide-react';

interface AtomicFoundationProps {
  onAddNote: (
    title: string,
    subject: 'Biology' | 'Mathematics' | 'Chemistry' | 'Physics' | 'Engineering' | 'General',
    content: string,
    tags: string[],
    labRef: string
  ) => void;
}

export const AtomicFoundation: React.FC<AtomicFoundationProps> = ({ onAddNote }) => {
  const [selectedElementNumber, setSelectedElementNumber] = useState<number>(6); // Default Carbon
  const [activeSubTab, setActiveSubTab] = useState<AtomicSubTab>('periodic_table');

  const selectedElement = getElementByNumber(selectedElementNumber);

  const handlePrevElement = () => {
    setSelectedElementNumber((prev) => (prev > 1 ? prev - 1 : 118));
  };

  const handleNextElement = () => {
    setSelectedElementNumber((prev) => (prev < 118 ? prev + 1 : 1));
  };

  const handleRandomElement = () => {
    const randomNum = Math.floor(Math.random() * 118) + 1;
    setSelectedElementNumber(randomNum);
  };

  // Quick jump highlights
  const popularElements = [
    { num: 1, sym: 'H' },
    { num: 6, sym: 'C' },
    { num: 7, sym: 'N' },
    { num: 8, sym: 'O' },
    { num: 11, sym: 'Na' },
    { num: 17, sym: 'Cl' },
    { num: 26, sym: 'Fe' },
    { num: 29, sym: 'Cu' },
    { num: 79, sym: 'Au' },
    { num: 92, sym: 'U' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Atomic Foundation Header & Subnavigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Atom className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white">
              Atomic Foundation & Periodic Lab
            </h1>
            <p className="text-xs text-slate-400">
              Interactive 118-Element Periodic Table · Bohr Orbits & Valency Shells · Quantum Wavefunctions
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation (Functional interactive buttons) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('periodic_table')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'periodic_table'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Periodic Table</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bohr_model')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'bohr_model'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Bohr Model & Shells</span>
          </button>

          <button
            onClick={() => setActiveSubTab('quantum_model')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'quantum_model'
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quantum Orbitals</span>
          </button>
        </div>
      </div>

      {/* Global Element Quick Switcher Bar (Visible on all tabs) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Previous / Next / Random Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevElement}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 transition-colors"
            title="Previous element"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-950 border border-cyan-500/40 rounded-lg">
            <span className="font-mono font-bold text-cyan-400">
              #{selectedElement.number}
            </span>
            <span className="font-bold text-white font-display">
              {selectedElement.name} ({selectedElement.symbol})
            </span>
          </div>

          <button
            onClick={handleNextElement}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 transition-colors"
            title="Next element"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleRandomElement}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 transition-colors ml-1"
            title="Pick a random element"
          >
            <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Random</span>
          </button>
        </div>

        {/* Quick jump popular elements */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-slate-500 text-[11px] hidden md:inline">Quick Jump:</span>
          {popularElements.map((item) => (
            <button
              key={item.num}
              onClick={() => setSelectedElementNumber(item.num)}
              className={`px-2 py-1 rounded-md font-mono text-[11px] transition-colors ${
                selectedElementNumber === item.num
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {item.sym}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'periodic_table' && (
        <PeriodicTable
          selectedElement={selectedElement}
          onSelectElement={(num) => setSelectedElementNumber(num)}
          onGoToBohr={() => setActiveSubTab('bohr_model')}
          onGoToQuantum={() => setActiveSubTab('quantum_model')}
        />
      )}

      {activeSubTab === 'bohr_model' && (
        <BohrModelVisualizer
          element={selectedElement}
          onAddNote={(title, subject, content, tags, labRef) =>
            onAddNote(title, subject, content, tags, labRef)
          }
        />
      )}

      {activeSubTab === 'quantum_model' && (
        <QuantumModelVisualizer
          element={selectedElement}
          onAddNote={(title, subject, content, tags, labRef) =>
            onAddNote(title, subject, content, tags, labRef)
          }
        />
      )}
    </div>
  );
};

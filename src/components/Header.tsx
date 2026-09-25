import React from 'react';
import { HelpCircle, Sparkles, BookOpen } from 'lucide-react';
import { GradeLevel } from '../types';

interface HeaderProps {
  activeSection: 'visual_learning' | 'learning' | 'atomic_foundation' | 'advanced_lab' | 'chemistry' | 'physics' | 'notes';
  setActiveSection: (sec: 'visual_learning' | 'learning' | 'atomic_foundation' | 'advanced_lab' | 'chemistry' | 'physics' | 'notes') => void;
  selectedGrade: GradeLevel | 'all';
  setSelectedGrade: (grade: GradeLevel | 'all') => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  setActiveSection,
  selectedGrade,
  setSelectedGrade,
  onOpenGuide
}) => {
  const navItems = [
    { id: 'visual_learning', label: 'Visual Learning' },
    { id: 'learning', label: '3D Learning' },
    { id: 'atomic_foundation', label: 'Atomic Foundation' },
    { id: 'advanced_lab', label: 'Advanced 3D Lab' },
    { id: 'chemistry', label: 'Chemistry Lab' },
    { id: 'physics', label: 'Physics Simulations' },
    { id: 'notes', label: 'Notes' }
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSection('learning')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/50 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              LearnSphere 3D
            </span>
          </button>
        </div>

        {/* Zone 2: Clean 5 text navigation links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/70 border border-slate-800 rounded-xl">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Class / Grade Selector for relevant sections */}
          {(activeSection === 'learning' || activeSection === 'notes') && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <span className="text-[11px] text-slate-500 px-2 hidden sm:inline">Grade:</span>
              <button
                onClick={() => setSelectedGrade('all')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedGrade === 'all'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedGrade('middle')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedGrade === 'middle'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                6–8
              </button>
              <button
                onClick={() => setSelectedGrade('high')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedGrade === 'high'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                9–10
              </button>
              <button
                onClick={() => setSelectedGrade('senior')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedGrade === 'senior'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                11–12
              </button>
            </div>
          )}

          {/* Help & Guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Lab Guide</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto mt-2 pt-2 border-t border-slate-900 pb-0.5 no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

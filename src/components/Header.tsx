import React, { useState } from 'react';
import { HelpCircle, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { GradeLevel } from '../types';

export type AppSectionId =
  | 'visual_learning'
  | 'learning'
  | 'atomic_foundation'
  | 'advanced_lab'
  | 'chemistry'
  | 'physics'
  | 'notes'
  | 'study_buddy';

export interface TabProgressItem {
  id: AppSectionId;
  label: string;
  percent: number;
  detail: string;
  colorClass: string;
  textClass: string;
}

export interface WebsiteProgressSummary {
  overallPercent: number;
  diagramsExplored: number;
  totalDiagrams: number;
  quizzesMastered: number;
  sectionsVisited: number;
  totalSections: number;
  notesCount: number;
  tabProgress: TabProgressItem[];
}

interface HeaderProps {
  activeSection: AppSectionId;
  setActiveSection: (sec: AppSectionId) => void;
  selectedGrade: GradeLevel | 'all';
  setSelectedGrade: (grade: GradeLevel | 'all') => void;
  onOpenGuide: () => void;
  progress?: WebsiteProgressSummary;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  setActiveSection,
  selectedGrade,
  setSelectedGrade,
  onOpenGuide,
  progress
}) => {
  const [showProgressDetails, setShowProgressDetails] = useState(false);

  const navItems: ReadonlyArray<{ id: AppSectionId; label: string }> = [
    { id: 'learning', label: '3D Learning' },
    { id: 'visual_learning', label: 'Visual Learning' },
    { id: 'atomic_foundation', label: 'Atomic Foundation' },
    { id: 'advanced_lab', label: 'Advanced 3D Lab' },
    { id: 'chemistry', label: 'Chemistry Lab' },
    { id: 'physics', label: 'Physics Simulations' },
    { id: 'notes', label: 'Notes' },
    { id: 'study_buddy', label: 'Ask Lumi (Beta) 🦉' }
  ];

  const overallPercent = progress ? progress.overallPercent : 25;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 lg:px-6 py-2.5 transition-all relative">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveSection('learning')}
            className="flex items-center gap-2 text-left group focus-visible:outline-none cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/50 transition-colors">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap">
              LearnSphere 3D
            </span>
          </button>
        </div>

        {/* Right Side Container: Navigation Tabs + Compact Progress + Lab Guide */}
        <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
          {/* Navigation Tabs */}
          <nav className="flex items-center gap-0.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto max-w-full no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-2 py-1 text-[11px] xl:text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
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

          {/* Compact Progress + Grade + Lab Guide Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Compact Interactive Learning Progress Bar Widget */}
            {progress && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowProgressDetails((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer"
                  title="View your overall learning progress"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="flex flex-col gap-0.5 w-11">
                    <div className="flex items-center justify-between text-[9px] leading-none">
                      <span className="text-slate-400 font-medium">Prog</span>
                      <span className="font-mono font-bold text-cyan-300">{overallPercent}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${overallPercent}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Dropdown Progress Breakdown Card */}
                {showProgressDetails && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Learning Progress Tracker
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-md border border-cyan-500/30">
                        {overallPercent}% Overall
                      </span>
                    </div>

                    {/* Overall Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">
                          All 8 Learning Tabs ({progress.sectionsVisited}/{progress.totalSections} visited)
                        </span>
                        <span className="font-mono font-semibold text-emerald-300">
                          {progress.quizzesMastered}/{progress.totalDiagrams} quizzes mastered
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${overallPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar for Each Tab */}
                    <div className="space-y-2 text-xs pt-1 max-h-80 overflow-y-auto pr-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Progress by Tab (Click to open)
                      </div>
                      {progress.tabProgress.map((tab) => {
                        const isCurrent = activeSection === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setActiveSection(tab.id);
                              setShowProgressDetails(false);
                            }}
                            className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-slate-800/90 border-cyan-500/40'
                                : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] mb-1 gap-2">
                              <span className="font-semibold text-slate-200 truncate">
                                {tab.label}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-slate-400">
                                  {tab.detail}
                                </span>
                                <span className={`font-mono font-bold ${tab.textClass}`}>
                                  {tab.percent}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
                              <div
                                className={`h-full ${tab.colorClass} rounded-full transition-all duration-500`}
                                style={{ width: `${Math.min(100, Math.max(0, tab.percent))}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {progress.notesCount} Study Notes Saved
                      </span>
                      <button
                        onClick={() => setShowProgressDetails(false)}
                        className="text-slate-400 hover:text-white font-medium cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Class / Grade Selector for relevant sections */}
            {(activeSection === 'learning' || activeSection === 'notes') && (
              <div className="hidden 2xl:flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs shrink-0">
                <button
                  onClick={() => setSelectedGrade('all')}
                  className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedGrade === 'all'
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedGrade('middle')}
                  className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedGrade === 'middle'
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  6–8
                </button>
                <button
                  onClick={() => setSelectedGrade('high')}
                  className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedGrade === 'high'
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  9–10
                </button>
                <button
                  onClick={() => setSelectedGrade('senior')}
                  className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
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
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl hover:border-cyan-500/40 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Lab Guide</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useMemo } from 'react';
import { ElementData, ElementCategory } from '../../types/atomic';
import { ALL_118_ELEMENTS_SUMMARY, PeriodicGridItem } from '../../data/elementsData';
import { Search, Filter, Sparkles, Atom, ChevronRight } from 'lucide-react';

interface PeriodicTableProps {
  selectedElement: ElementData;
  onSelectElement: (number: number) => void;
  onGoToBohr: () => void;
  onGoToQuantum: () => void;
}

const CATEGORY_COLORS: Record<ElementCategory, { bg: string; border: string; text: string; label: string }> = {
  alkali: { bg: 'bg-rose-950/40 hover:bg-rose-900/60', border: 'border-rose-500/40 hover:border-rose-400', text: 'text-rose-300', label: 'Alkali Metal' },
  alkaline: { bg: 'bg-amber-950/40 hover:bg-amber-900/60', border: 'border-amber-500/40 hover:border-amber-400', text: 'text-amber-300', label: 'Alkaline Earth' },
  transition: { bg: 'bg-blue-950/40 hover:bg-blue-900/60', border: 'border-blue-500/40 hover:border-blue-400', text: 'text-blue-300', label: 'Transition Metal' },
  'post-transition': { bg: 'bg-emerald-950/40 hover:bg-emerald-900/60', border: 'border-emerald-500/40 hover:border-emerald-400', text: 'text-emerald-300', label: 'Post-Transition' },
  metalloid: { bg: 'bg-teal-950/40 hover:bg-teal-900/60', border: 'border-teal-500/40 hover:border-teal-400', text: 'text-teal-300', label: 'Metalloid' },
  nonmetal: { bg: 'bg-sky-950/40 hover:bg-sky-900/60', border: 'border-sky-500/40 hover:border-sky-400', text: 'text-sky-300', label: 'Reactive Nonmetal' },
  halogen: { bg: 'bg-indigo-950/40 hover:bg-indigo-900/60', border: 'border-indigo-500/40 hover:border-indigo-400', text: 'text-indigo-300', label: 'Halogen' },
  noble: { bg: 'bg-purple-950/40 hover:bg-purple-900/60', border: 'border-purple-500/40 hover:border-purple-400', text: 'text-purple-300', label: 'Noble Gas' },
  lanthanide: { bg: 'bg-cyan-950/40 hover:bg-cyan-900/60', border: 'border-cyan-500/40 hover:border-cyan-400', text: 'text-cyan-300', label: 'Lanthanide' },
  actinide: { bg: 'bg-fuchsia-950/40 hover:bg-fuchsia-900/60', border: 'border-fuchsia-500/40 hover:border-fuchsia-400', text: 'text-fuchsia-300', label: 'Actinide' },
};

export const PeriodicTable: React.FC<PeriodicTableProps> = ({
  selectedElement,
  onSelectElement,
  onGoToBohr,
  onGoToQuantum
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeBlock, setActiveBlock] = useState<string>('all');
  const [hoveredElement, setHoveredElement] = useState<PeriodicGridItem | null>(null);

  // Filter elements
  const filteredElementsMap = useMemo(() => {
    const map = new Map<number, PeriodicGridItem>();
    ALL_118_ELEMENTS_SUMMARY.forEach((item) => {
      const matchSearch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.number.toString() === searchTerm.trim();

      const matchCategory =
        activeCategory === 'all' || item.category === activeCategory;

      const matchBlock = activeBlock === 'all' || item.block === activeBlock;

      if (matchSearch && matchCategory && matchBlock) {
        map.set(item.number, item);
      }
    });
    return map;
  }, [searchTerm, activeCategory, activeBlock]);

  // Main grid rows (Periods 1 to 7, Groups 1 to 18)
  // Excludes Lanthanides (57-71) and Actinides (89-103) which are in separate rows
  const gridCells = useMemo(() => {
    const cells: { period: number; group: number; element?: PeriodicGridItem; isPlaceholder?: boolean; label?: string }[] = [];
    
    for (let p = 1; p <= 7; p++) {
      for (let g = 1; g <= 18; g++) {
        // Lanthanide placeholder in row 6, group 3
        if (p === 6 && g === 3) {
          cells.push({ period: p, group: g, isPlaceholder: true, label: '57–71' });
          continue;
        }
        // Actinide placeholder in row 7, group 3
        if (p === 7 && g === 3) {
          cells.push({ period: p, group: g, isPlaceholder: true, label: '89–103' });
          continue;
        }

        const el = ALL_118_ELEMENTS_SUMMARY.find(
          (e) =>
            e.period === p &&
            e.group === g &&
            e.category !== 'lanthanide' &&
            e.category !== 'actinide'
        );

        cells.push({ period: p, group: g, element: el });
      }
    }
    return cells;
  }, []);

  // Lanthanides (57 to 71)
  const lanthanides = useMemo(
    () => ALL_118_ELEMENTS_SUMMARY.filter((e) => e.number >= 57 && e.number <= 71),
    []
  );

  // Actinides (89 to 103)
  const actinides = useMemo(
    () => ALL_118_ELEMENTS_SUMMARY.filter((e) => e.number >= 89 && e.number <= 103),
    []
  );

  const displayEl = hoveredElement || selectedElement;

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Category Filters, Quick Action */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, symbol (e.g., Fe, C, Au) or atomic number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Block filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl text-xs overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Block:</span>
            {['all', 's', 'p', 'd', 'f'].map((block) => (
              <button
                key={block}
                onClick={() => setActiveBlock(block)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeBlock === block
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {block === 'all' ? 'All' : `${block}-block`}
              </button>
            ))}
          </div>
        </div>

        {/* Category Legend & Filter */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              activeCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            All Categories (118)
          </button>
          {Object.entries(CATEGORY_COLORS).map(([catKey, style]) => {
            const isSelected = activeCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(isSelected ? 'all' : catKey)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? `${style.bg} ${style.border} ${style.text} shadow-sm ring-1 ring-white/10`
                    : 'border-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-700 bg-slate-950/40'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${style.text.replace('text-', 'bg-')}`}
                />
                <span>{style.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Element Live Spotlight Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-slate-950 border-2 border-cyan-500/60 flex flex-col items-center justify-center shadow-inner relative group">
            <span className="text-[10px] text-cyan-400 font-mono absolute top-1 left-1.5">
              {displayEl.number}
            </span>
            <span className="text-2xl font-bold font-display text-white">
              {displayEl.symbol}
            </span>
            <span className="text-[9px] text-slate-400 font-mono truncate max-w-[56px] text-center">
              {displayEl.atomicMass.toFixed(2)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white font-display">
                {displayEl.name}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Atomic #{displayEl.number} · Group {displayEl.group}, Period {displayEl.period}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
              <span>
                Configuration: <strong className="text-cyan-300 font-mono">{displayEl.electronConfiguration}</strong>
              </span>
              <span>·</span>
              <span>
                Valency: <strong className="text-amber-300 font-mono">{displayEl.valency.join(', ')}</strong>
              </span>
              <span>·</span>
              <span>
                Shells: <strong className="text-emerald-300 font-mono">{displayEl.shells.join(' · ')}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => {
              onSelectElement(displayEl.number);
              onGoToBohr();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Atom className="w-4 h-4" />
            <span>Explore Bohr Model</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onSelectElement(displayEl.number);
              onGoToQuantum();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Quantum Orbitals</span>
          </button>
        </div>
      </div>

      {/* Main 18-Column Interactive Grid */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 sm:p-5 overflow-x-auto shadow-2xl">
        {/* Periodic Grid Container */}
        <div className="min-w-[940px]">
          {/* Group column header numbers 1-18 */}
          <div className="grid grid-cols-18 gap-1 mb-1.5 text-center">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((g) => (
              <div key={g} className="text-[10px] text-slate-500 font-mono">
                {g}
              </div>
            ))}
          </div>

          {/* Periods 1 to 7 Grid */}
          <div className="grid grid-cols-18 gap-1 mb-4">
            {gridCells.map((cell, idx) => {
              if (cell.isPlaceholder) {
                return (
                  <div
                    key={`placeholder-${idx}`}
                    className="h-14 sm:h-16 rounded-lg border border-dashed border-slate-800 flex flex-col items-center justify-center p-1 bg-slate-900/30 text-center"
                  >
                    <span className="text-[10px] text-slate-500 font-mono">
                      {cell.label}
                    </span>
                    <span className="text-[9px] text-slate-600">
                      {cell.period === 6 ? 'La-Lu' : 'Ac-Lr'}
                    </span>
                  </div>
                );
              }

              if (!cell.element) {
                return <div key={`empty-${idx}`} className="h-14 sm:h-16" />;
              }

              const el = cell.element;
              const isSelected = selectedElement.number === el.number;
              const isMatch = filteredElementsMap.has(el.number);
              const categoryStyle = CATEGORY_COLORS[el.category];

              return (
                <button
                  key={el.number}
                  onClick={() => onSelectElement(el.number)}
                  onMouseEnter={() => setHoveredElement(el)}
                  onMouseLeave={() => setHoveredElement(null)}
                  className={`relative h-14 sm:h-16 rounded-lg p-1 flex flex-col justify-between text-left transition-all border ${
                    isSelected
                      ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-950/70 shadow-lg shadow-cyan-500/30 z-10 scale-105'
                      : isMatch
                      ? `${categoryStyle.bg} ${categoryStyle.border}`
                      : 'opacity-20 border-slate-850 bg-slate-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] font-mono text-slate-400 leading-none">
                      {el.number}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 leading-none">
                      {el.valenceElectrons}e⁻
                    </span>
                  </div>
                  <div className="text-center my-auto">
                    <span className={`text-base sm:text-lg font-bold font-display leading-none block ${categoryStyle.text}`}>
                      {el.symbol}
                    </span>
                  </div>
                  <div className="w-full truncate text-[8.5px] text-slate-300 font-medium leading-none text-center">
                    {el.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Lanthanides & Actinides Separate Sub-Grid */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1">
            {/* Lanthanide row */}
            <div className="flex items-center gap-1">
              <div className="w-16 text-[10px] font-mono text-cyan-400/90 shrink-0 text-right pr-2">
                * 57–71
              </div>
              <div className="grid grid-cols-15 gap-1 flex-1">
                {lanthanides.map((el) => {
                  const isSelected = selectedElement.number === el.number;
                  const isMatch = filteredElementsMap.has(el.number);
                  const categoryStyle = CATEGORY_COLORS[el.category];
                  return (
                    <button
                      key={el.number}
                      onClick={() => onSelectElement(el.number)}
                      onMouseEnter={() => setHoveredElement(el)}
                      onMouseLeave={() => setHoveredElement(null)}
                      className={`h-13 sm:h-15 rounded-lg p-1 flex flex-col justify-between text-left transition-all border ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 border-cyan-400 bg-cyan-950/70 shadow-lg shadow-cyan-500/30 z-10 scale-105'
                          : isMatch
                          ? `${categoryStyle.bg} ${categoryStyle.border}`
                          : 'opacity-20 border-slate-850 bg-slate-900/20'
                      }`}
                    >
                      <span className="text-[9px] font-mono text-slate-400 leading-none">
                        {el.number}
                      </span>
                      <span className={`text-sm sm:text-base font-bold font-display text-center leading-none ${categoryStyle.text}`}>
                        {el.symbol}
                      </span>
                      <span className="truncate text-[8px] text-slate-300 leading-none text-center">
                        {el.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actinide row */}
            <div className="flex items-center gap-1">
              <div className="w-16 text-[10px] font-mono text-fuchsia-400/90 shrink-0 text-right pr-2">
                ** 89–103
              </div>
              <div className="grid grid-cols-15 gap-1 flex-1">
                {actinides.map((el) => {
                  const isSelected = selectedElement.number === el.number;
                  const isMatch = filteredElementsMap.has(el.number);
                  const categoryStyle = CATEGORY_COLORS[el.category];
                  return (
                    <button
                      key={el.number}
                      onClick={() => onSelectElement(el.number)}
                      onMouseEnter={() => setHoveredElement(el)}
                      onMouseLeave={() => setHoveredElement(null)}
                      className={`h-13 sm:h-15 rounded-lg p-1 flex flex-col justify-between text-left transition-all border ${
                        isSelected
                          ? 'ring-2 ring-fuchsia-400 border-fuchsia-400 bg-fuchsia-950/70 shadow-lg shadow-fuchsia-500/30 z-10 scale-105'
                          : isMatch
                          ? `${categoryStyle.bg} ${categoryStyle.border}`
                          : 'opacity-20 border-slate-850 bg-slate-900/20'
                      }`}
                    >
                      <span className="text-[9px] font-mono text-slate-400 leading-none">
                        {el.number}
                      </span>
                      <span className={`text-sm sm:text-base font-bold font-display text-center leading-none ${categoryStyle.text}`}>
                        {el.symbol}
                      </span>
                      <span className="truncate text-[8px] text-slate-300 leading-none text-center">
                        {el.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

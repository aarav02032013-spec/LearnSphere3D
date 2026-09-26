import React, { useState, useMemo } from 'react';
import {
  MICROSCOPY_SLIDES,
  MicroscopySlideItem,
  MicroscopicObjectItem
} from '../../data/microscopyData';
import {
  Search,
  Eye,
  Sliders,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ZoomIn,
  Layers
} from 'lucide-react';

interface MicroscopyLabProps {
  onAddNote: (
    title: string,
    subject: 'Biology' | 'Physics' | 'Chemistry' | 'Mathematics',
    content: string,
    tags: string[],
    labRef: string
  ) => void;
}

type StainMode = 'iodine' | 'safranin' | 'methylene_blue' | 'leishman' | 'fluorescence';

const STAIN_CONFIG: Record<
  StainMode,
  { label: string; bgRadial: string; tintColor: string; isDarkfield?: boolean }
> = {
  safranin: {
    label: 'Safranin Stain',
    bgRadial: 'radial-gradient(circle, #fff1f2 0%, #ffe4e6 72%, #fecdd3 92%, #0f172a 100%)',
    tintColor: '#e11d48'
  },
  iodine: {
    label: 'Lugol’s Iodine',
    bgRadial: 'radial-gradient(circle, #fefce8 0%, #fef3c7 72%, #fde68a 92%, #0f172a 100%)',
    tintColor: '#d97706'
  },
  methylene_blue: {
    label: 'Methylene Blue',
    bgRadial: 'radial-gradient(circle, #f0f9ff 0%, #e0f2fe 72%, #bae6fd 92%, #0f172a 100%)',
    tintColor: '#0284c7'
  },
  leishman: {
    label: 'Leishman (Eosin-Blue)',
    bgRadial: 'radial-gradient(circle, #fdf4ff 0%, #fae8ff 72%, #f5d0fe 92%, #0f172a 100%)',
    tintColor: '#9333ea'
  },
  fluorescence: {
    label: 'Darkfield Fluorescence',
    bgRadial: 'radial-gradient(circle, #091526 0%, #060d18 78%, #020617 95%, #000000 100%)',
    tintColor: '#22d3ee',
    isDarkfield: true
  }
};

export const MicroscopyLab: React.FC<MicroscopyLabProps> = ({ onAddNote }) => {
  const [selectedSlideId, setSelectedSlideId] = useState<string>(MICROSCOPY_SLIDES[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedObjectId, setSelectedObjectId] = useState<string>(
    MICROSCOPY_SLIDES[0].objects[0].id
  );
  const [magnification, setMagnification] = useState<40 | 100 | 400 | 1000>(
    MICROSCOPY_SLIDES[0].recommendedMag
  );
  const [stainMode, setStainMode] = useState<StainMode>(MICROSCOPY_SLIDES[0].defaultStain);
  const [fineFocus, setFineFocus] = useState<number>(0);
  const [showObjectMarkers, setShowObjectMarkers] = useState<boolean>(true);
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true);
  const [savedBanner, setSavedBanner] = useState<boolean>(false);

  const filteredSlides = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MICROSCOPY_SLIDES;
    return MICROSCOPY_SLIDES.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.ncertReference.toLowerCase().includes(q) ||
        s.objects.some(
          (o) =>
            o.name.toLowerCase().includes(q) ||
            o.category.toLowerCase().includes(q) ||
            o.description.toLowerCase().includes(q)
        )
    );
  }, [searchQuery]);

  const activeSlide: MicroscopySlideItem =
    MICROSCOPY_SLIDES.find((s) => s.id === selectedSlideId) || MICROSCOPY_SLIDES[0];

  const activeObject: MicroscopicObjectItem =
    activeSlide.objects.find((o) => o.id === selectedObjectId) || activeSlide.objects[0];

  const handleSelectSlide = (slide: MicroscopySlideItem) => {
    setSelectedSlideId(slide.id);
    setSelectedObjectId(slide.objects[0]?.id || '');
    setMagnification(slide.recommendedMag);
    setStainMode(slide.defaultStain);
    setFineFocus(0);
  };

  // Calculate zoom factor relative to the slide's recommended magnification
  const zoomScale = useMemo(() => {
    const ratio = magnification / activeSlide.recommendedMag;
    if (ratio <= 0.4) return 0.72;
    if (ratio <= 1) return 1.0;
    if (ratio <= 2.5) return 1.22;
    return 1.42;
  }, [magnification, activeSlide.recommendedMag]);

  const effectiveFieldMicrons = Math.round(
    (activeSlide.fieldDiameterMicrons * activeSlide.recommendedMag) / magnification
  );

  const blurPx = Math.abs(fineFocus) * 0.45;
  const activeStain = STAIN_CONFIG[stainMode];

  const handleSaveSlideToNotes = () => {
    const content = `### Virtual Microscopy Report: ${activeSlide.title}
**NCERT Reference**: ${activeSlide.ncertReference} (Class ${activeSlide.classGrade})
**Stain Used**: ${activeSlide.stainLabel} | **Magnification**: ${magnification}x

${activeSlide.description}

#### All Microscopic Objects Observed (${activeSlide.objects.length} Structures):
${activeSlide.objects
  .map(
    (obj, idx) =>
      `${idx + 1}. **${obj.name}** (${obj.category} · ${obj.sizeMicrons}): ${obj.description}\n   - *Function*: ${obj.functionOrRole}\n   - *NCERT Key Fact*: ${obj.ncertKeyFact}`
  )
  .join('\n\n')}

#### Slide Preparation Steps:
${activeSlide.slidePrepSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`;

    onAddNote(
      `Microscopy: ${activeSlide.title}`,
      activeSlide.subject,
      content,
      [`Class ${activeSlide.classGrade}`, 'Microscopy', activeSlide.subject, 'NCERT Practical'],
      `Virtual Microscopy: ${activeSlide.title}`
    );
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2600);
  };

  return (
    <div className="space-y-6">
      {/* Main 2-Column Layout: Left = Specimen Slide Tray, Right = Optical Eyepiece & Object Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (4 COLS): SPECIMEN SLIDE DIRECTORY */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Microscope Slide Tray</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {filteredSlides.length} specimens
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specimen, cell, organelle..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Slide Cards List */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredSlides.map((slide) => {
              const isSelected = slide.id === activeSlide.id;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => handleSelectSlide(slide)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/85 to-slate-900 border-cyan-400/80 ring-1 ring-cyan-500/40 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-cyan-300 font-semibold">
                      Class {slide.classGrade} · {slide.recommendedMag}x
                    </span>
                    <span className="text-slate-400">
                      {slide.objects.length} microscopic objects
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white leading-snug">{slide.title}</h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {slide.subtitle}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/60">
                    <span className="truncate">{slide.stainLabel}</span>
                    <span className="text-cyan-400 font-semibold shrink-0">
                      {isSelected ? 'Mounted on Stage' : 'Load Slide →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (8 COLS): OPTICAL EYEPIECE VIEWPORT + ALL OBJECTS INSPECTOR */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Compound Microscope Eyepiece Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
            {/* Top Bar: Slide Title & Save to Notes */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                  <span>{activeSlide.ncertReference}</span>
                  <span>·</span>
                  <span>Field: {effectiveFieldMicrons} µm</span>
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-white mt-0.5">
                  {activeSlide.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveSlideToNotes}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    savedBanner
                      ? 'bg-emerald-500 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                  }`}
                >
                  {savedBanner ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  <span>{savedBanner ? 'Saved to Notes!' : 'Save Slide Report'}</span>
                </button>
              </div>
            </div>

            {/* Microscope Controls Row: Objective Lens Turret + Stain Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3">
              {/* Objective Magnification Turret */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                  Objective:
                </span>
                {([40, 100, 400, 1000] as const).map((mag) => (
                  <button
                    key={mag}
                    type="button"
                    onClick={() => setMagnification(mag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      magnification === mag
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    {mag}x{mag === 1000 ? ' Oil' : ''}
                  </button>
                ))}
              </div>

              {/* Biological Stain Selector */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Stain:</span>
                {(Object.keys(STAIN_CONFIG) as StainMode[]).map((stKey) => (
                  <button
                    key={stKey}
                    type="button"
                    onClick={() => setStainMode(stKey)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      stainMode === stKey
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {STAIN_CONFIG[stKey].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Circular Optical Eyepiece Stage — Unobstructed Lens + External Callout Labels */}
            <div className="w-full bg-slate-950 rounded-2xl border border-slate-800/90 p-4 sm:p-5 flex flex-col items-center space-y-4">
              {/* Dedicated Header Bar Above the Lens (No Overlap with Circular Aperture) */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
                  <span>
                    Magnification:{' '}
                    <strong className="text-cyan-300">{magnification}x</strong> (10x ×{' '}
                    {magnification / 10}x)
                  </span>
                  <span className="text-slate-600">|</span>
                  <span>
                    Stain: <strong className="text-amber-300">{activeStain.label}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowObjectMarkers((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                      showObjectMarkers
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {showObjectMarkers ? 'Pin Dots: ON' : 'Pin Dots: OFF (Clean View)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCrosshair((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                      showCrosshair
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Reticle
                  </button>
                </div>
              </div>

              {/* 3-Part Scientific Diagram Layout: Left External Labels | Unobstructed Circular Eyepiece | Right External Labels */}
              <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 items-center">
                {/* Left External Callouts (Objects on the left side of the field) */}
                <div className="hidden xl:flex xl:col-span-3 flex-col gap-2.5 pr-1">
                  {activeSlide.objects
                    .map((obj, index) => ({ obj, index }))
                    .filter((_, i) => i % 2 === 0)
                    .map(({ obj, index }) => {
                      const isSelected = obj.id === activeObject.id;
                      return (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => setSelectedObjectId(obj.id)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-md'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold truncate">
                              {obj.name.split(' (')[0]}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {obj.sizeMicrons}
                            </div>
                          </div>
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                              isSelected
                                ? 'bg-cyan-400 text-slate-950'
                                : 'bg-slate-800 text-cyan-300 border border-slate-700'
                            }`}
                          >
                            {index + 1}
                          </span>
                        </button>
                      );
                    })}
                </div>

                {/* Center Circular Eyepiece Aperture (Zero Text Overlays Inside!) */}
                <div className="xl:col-span-6 flex flex-col items-center justify-center">
                  <div
                    className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] rounded-full border-[10px] border-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.85),inset_0_0_35px_rgba(0,0,0,0.65)] overflow-hidden flex items-center justify-center select-none"
                    style={{
                      background: activeStain.bgRadial
                    }}
                  >
                    {/* Zoom & Focus Transformed Specimen Layer */}
                    <div
                      className="w-full h-full relative transition-transform duration-300"
                      style={{
                        transform: `scale(${zoomScale})`,
                        filter: blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : 'none'
                      }}
                    >
                      <SpecimenMicroscopeSVG
                        slideId={activeSlide.id}
                        isDarkfield={Boolean(activeStain.isDarkfield)}
                        tintColor={activeStain.tintColor}
                      />

                      {/* Compact Numbered Target Dots ONLY (No Text Boxes Blocking the Image!) */}
                      {showObjectMarkers &&
                        activeSlide.objects.map((obj, index) => {
                          const isSelected = obj.id === activeObject.id;
                          const leftPct = 50 + obj.position[0] * 50;
                          const topPct = 50 + obj.position[1] * 50;

                          return (
                            <button
                              key={obj.id}
                              type="button"
                              onClick={() => setSelectedObjectId(obj.id)}
                              style={{
                                left: `${leftPct}%`,
                                top: `${topPct}%`,
                                transform: `translate(-50%, -50%) scale(${(1 / zoomScale).toFixed(3)})`
                              }}
                              className="absolute z-20 flex items-center justify-center cursor-pointer group"
                              title={`${index + 1}. ${obj.name} (${obj.sizeMicrons})`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                                  isSelected
                                    ? 'bg-cyan-400 text-slate-950 border-2 border-white ring-4 ring-cyan-400/50 scale-110 shadow-lg'
                                    : 'bg-slate-950/75 text-white border border-cyan-300/80 hover:bg-cyan-400 hover:text-slate-950'
                                }`}
                              >
                                {index + 1}
                              </span>
                            </button>
                          );
                        })}
                    </div>

                    {/* Ocular Micrometer Reticle Crosshair Overlay */}
                    {showCrosshair && (
                      <svg
                        viewBox="0 0 200 200"
                        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
                      >
                        <line
                          x1="20"
                          y1="100"
                          x2="180"
                          y2="100"
                          stroke={activeStain.isDarkfield ? '#38bdf8' : '#334155'}
                          strokeWidth="0.5"
                          strokeDasharray="2 2"
                        />
                        <line
                          x1="100"
                          y1="20"
                          x2="100"
                          y2="180"
                          stroke={activeStain.isDarkfield ? '#38bdf8' : '#334155'}
                          strokeWidth="0.5"
                          strokeDasharray="2 2"
                        />
                        {Array.from({ length: 21 }).map((_, idx) => {
                          const x = 70 + idx * 3;
                          const h = idx % 5 === 0 ? 5 : 2.5;
                          return (
                            <line
                              key={idx}
                              x1={x}
                              y1={100 - h}
                              x2={x}
                              y2={100 + h}
                              stroke={activeStain.isDarkfield ? '#38bdf8' : '#1e293b'}
                              strokeWidth="0.6"
                            />
                          );
                        })}
                      </svg>
                    )}

                    {/* Vignette Inner Ring */}
                    <div className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_0_45px_rgba(2,6,23,0.75)]" />
                  </div>
                </div>

                {/* Right External Callouts (Objects on the right side of the field) */}
                <div className="hidden xl:flex xl:col-span-3 flex-col gap-2.5 pl-1">
                  {activeSlide.objects
                    .map((obj, index) => ({ obj, index }))
                    .filter((_, i) => i % 2 === 1)
                    .map(({ obj, index }) => {
                      const isSelected = obj.id === activeObject.id;
                      return (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => setSelectedObjectId(obj.id)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-md'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                              isSelected
                                ? 'bg-cyan-400 text-slate-950'
                                : 'bg-slate-800 text-cyan-300 border border-slate-700'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold truncate">
                              {obj.name.split(' (')[0]}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {obj.sizeMicrons}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Compact Numbered Callout Bar Below Lens for Mobile/Tablet + Active Object Readout */}
              <div className="w-full flex flex-wrap items-center justify-center gap-1.5 xl:hidden pt-1">
                {activeSlide.objects.map((obj, idx) => {
                  const isSelected = obj.id === activeObject.id;
                  return (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => setSelectedObjectId(obj.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-semibold'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="font-mono font-bold text-cyan-400">{idx + 1}.</span>
                      <span>{obj.name.split(' (')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Pin Readout Strip Outside the Eyepiece */}
              <div className="w-full max-w-2xl px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                    {activeSlide.objects.findIndex((o) => o.id === activeObject.id) + 1}
                  </span>
                  <strong className="text-white">{activeObject.name}</strong>
                  <span className="text-slate-400 hidden sm:inline">· {activeObject.category}</span>
                </div>
                <span className="font-mono text-cyan-300">{activeObject.sizeMicrons}</span>
              </div>

              {/* Fine Adjustment Focus Knob Bar */}
              <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3">
                <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                    <span className="font-semibold">Fine Focus Adjustment Knob</span>
                    <span className="font-mono text-cyan-300">
                      {fineFocus === 0 ? 'Sharp Focus (0.0 µm)' : `${fineFocus > 0 ? '+' : ''}${fineFocus} µm`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.5"
                    value={fineFocus}
                    onChange={(e) => setFineFocus(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFineFocus(0)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-cyan-300 border border-slate-700 cursor-pointer shrink-0"
                  title="Snap to Sharp Optical Focus"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. All Microscopic Objects in View — Complete Directory & Inspector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>
                    All Objects in This Microscopic View ({activeSlide.objects.length} Structures)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any numbered object in the microscope eyepiece above or select from the complete object list below.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-300">
                Inspecting: {activeObject.name}
              </span>
            </div>

            {/* Active Microscopic Object Detailed Dossier Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/35 border border-cyan-500/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-cyan-300 font-semibold">
                  {activeObject.category} · Size: {activeObject.sizeMicrons}
                </span>
                <span className="text-slate-400">Abundance: {activeObject.abundance}</span>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/40"
                  style={{ backgroundColor: activeObject.color }}
                />
                <span>{activeObject.name}</span>
              </h4>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                <strong className="text-cyan-300">Microscopic Appearance: </strong>
                {activeObject.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  <div className="text-amber-300 font-semibold mb-1">
                    Biological / Structural Function:
                  </div>
                  {activeObject.functionOrRole}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  <div className="text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>NCERT High-Yield Fact:</span>
                  </div>
                  {activeObject.ncertKeyFact}
                </div>
              </div>
            </div>

            {/* Grid of ALL Objects Visible in This Specimen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeSlide.objects.map((obj, idx) => {
                const isSelected = obj.id === activeObject.id;
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => setSelectedObjectId(obj.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800/90 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-slate-800 text-cyan-300 border border-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{obj.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {obj.category} · {obj.sizeMicrons}
                        </div>
                        <div className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                          {obj.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 mt-1 ${
                        isSelected ? 'text-cyan-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Slide Wet-Mount Preparation Protocol */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Laboratory Slide Preparation Protocol ({activeSlide.stainLabel})
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                {activeSlide.slidePrepSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-mono font-bold text-cyan-400">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Detailed Procedural SVG Renderer for Each Microscopic Specimen
const SpecimenMicroscopeSVG: React.FC<{
  slideId: string;
  isDarkfield: boolean;
  tintColor: string;
}> = ({ slideId, isDarkfield, tintColor }) => {
  const strokeMain = isDarkfield ? '#22d3ee' : tintColor;
  const fillSoft = isDarkfield ? 'rgba(34,211,238,0.12)' : `${tintColor}22`;
  const nucleusColor = isDarkfield ? '#38bdf8' : tintColor;

  switch (slideId) {
    case 'onion_peel':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Brick-like rows of rectangular plant epidermal cells */}
          {[0, 1, 2, 3, 4, 5].map((row) => {
            const y = row * 68 - 10;
            const xOffset = row % 2 === 0 ? 0 : -55;
            return [0, 1, 2, 3, 4].map((col) => {
              const x = col * 115 + xOffset;
              return (
                <g key={`${row}-${col}`}>
                  {/* Outer Cellulose Cell Wall */}
                  <rect
                    x={x}
                    y={y}
                    width="112"
                    height="64"
                    rx="6"
                    fill={fillSoft}
                    stroke={strokeMain}
                    strokeWidth="3"
                  />
                  {/* Inner Plasma Membrane */}
                  <rect
                    x={x + 4}
                    y={y + 4}
                    width="104"
                    height="56"
                    rx="4"
                    fill="none"
                    stroke={strokeMain}
                    strokeWidth="1"
                    strokeDasharray="3 2"
                    opacity="0.7"
                  />
                  {/* Large Central Vacuole */}
                  <ellipse
                    cx={x + 58}
                    cy={y + 32}
                    rx="40"
                    ry="20"
                    fill={isDarkfield ? 'rgba(15,23,42,0.55)' : 'rgba(255,255,255,0.65)'}
                    stroke={strokeMain}
                    strokeWidth="1"
                    opacity="0.85"
                  />
                  {/* Peripheral Stained Nucleus */}
                  <circle
                    cx={x + 20}
                    cy={y + 16}
                    r="7.5"
                    fill={nucleusColor}
                    opacity="0.92"
                  />
                  <circle cx={x + 18} cy={y + 14} r="2.2" fill="#ffffff" opacity="0.7" />
                </g>
              );
            });
          })}
        </svg>
      );

    case 'cheek_cells':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Clusters of irregular polygonal squamous epithelial cells */}
          {[
            { cx: 155, cy: 175, r: 54, rot: 12 },
            { cx: 265, cy: 235, r: 58, rot: -18 },
            { cx: 130, cy: 280, r: 48, rot: 28 },
            { cx: 270, cy: 125, r: 50, rot: -8 },
            { cx: 95, cy: 105, r: 42, rot: 15 }
          ].map((c, idx) => (
            <g key={idx} transform={`translate(${c.cx}, ${c.cy}) rotate(${c.rot})`}>
              {/* Irregular polygonal animal plasma membrane */}
              <polygon
                points={`0,${-c.r} ${c.r * 0.85},${-c.r * 0.45} ${c.r * 0.95},${c.r * 0.4} ${c.r * 0.2},${c.r} ${-c.r * 0.8},${c.r * 0.65} ${-c.r * 0.95},${-c.r * 0.25}`}
                fill={isDarkfield ? 'rgba(56,189,248,0.16)' : 'rgba(56,189,248,0.25)'}
                stroke={isDarkfield ? '#38bdf8' : '#0284c7'}
                strokeWidth="2.2"
              />
              {/* Cytoplasmic Mitochondrial Granules */}
              {[-18, -8, 12, 22, -14, 16].map((gx, gi) => (
                <circle
                  key={gi}
                  cx={gx}
                  cy={(gi % 3 - 1) * 16}
                  r="1.8"
                  fill={isDarkfield ? '#7dd3fc' : '#0369a1'}
                  opacity="0.65"
                />
              ))}
              {/* Central Prominent Nucleus */}
              <circle
                cx="0"
                cy="0"
                r="11"
                fill={isDarkfield ? '#38bdf8' : '#1e3a8a'}
                opacity="0.95"
              />
              {/* Dense Nucleolus */}
              <circle cx="3" cy="-2" r="3.2" fill="#0f172a" />
            </g>
          ))}
        </svg>
      );

    case 'leaf_stomata':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Wavy interlocking epidermal pavement cells background */}
          {[0, 1, 2, 3, 4].map((r) => (
            <path
              key={r}
              d={`M 0 ${r * 85 + 30} Q 50 ${r * 85 + 10}, 100 ${r * 85 + 35} T 200 ${r * 85 + 30} T 300 ${r * 85 + 35} T 400 ${r * 85 + 25}`}
              fill="none"
              stroke={strokeMain}
              strokeWidth="2"
              opacity="0.45"
            />
          ))}
          {/* 3 Stomatal Apparatuses with Guard Cells & Chloroplasts */}
          {[
            { x: 200, y: 195, scale: 1.35 },
            { x: 105, y: 105, scale: 0.85 },
            { x: 295, y: 295, scale: 0.9 }
          ].map((st, idx) => (
            <g key={idx} transform={`translate(${st.x}, ${st.y}) scale(${st.scale})`}>
              {/* Subsidiary Cells */}
              <ellipse
                cx="0"
                cy="0"
                rx="62"
                ry="44"
                fill={isDarkfield ? 'rgba(244,114,182,0.12)' : 'rgba(251,113,133,0.18)'}
                stroke={strokeMain}
                strokeWidth="1.8"
              />
              {/* Left Kidney-Shaped Guard Cell */}
              <path
                d="M -4 -28 C -34 -28, -38 28, -4 28 C -12 14, -12 -14, -4 -28 Z"
                fill="#22c55e"
                fillOpacity="0.75"
                stroke="#15803d"
                strokeWidth="2.5"
              />
              {/* Right Kidney-Shaped Guard Cell */}
              <path
                d="M 4 -28 C 34 -28, 38 28, 4 28 C 12 14, 12 -14, 4 -28 Z"
                fill="#22c55e"
                fillOpacity="0.75"
                stroke="#15803d"
                strokeWidth="2.5"
              />
              {/* Central Stomatal Pore */}
              <ellipse cx="0" cy="0" rx="6.5" ry="16" fill="#064e3b" />
              {/* Green Chloroplasts inside both Guard Cells */}
              {[
                [-16, -14],
                [-20, 0],
                [-16, 14],
                [16, -14],
                [20, 0],
                [16, 14]
              ].map(([cx, cy], ci) => (
                <circle key={ci} cx={cx} cy={cy} r="3.2" fill="#047857" />
              ))}
            </g>
          ))}
        </svg>
      );

    case 'human_blood_smear':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Numerous Biconcave Pink Erythrocytes (RBCs) */}
          {[
            [95, 115],
            [140, 90],
            [200, 110],
            [255, 85],
            [310, 125],
            [80, 185],
            [135, 165],
            [190, 180],
            [295, 190],
            [90, 250],
            [155, 240],
            [215, 255],
            [315, 260],
            [130, 310],
            [195, 315],
            [260, 305]
          ].map(([rx, ry], idx) => (
            <g key={idx}>
              <circle
                cx={rx}
                cy={ry}
                r="17"
                fill="#f87171"
                fillOpacity="0.85"
                stroke="#dc2626"
                strokeWidth="1.5"
              />
              {/* Biconcave central pallor */}
              <circle cx={rx} cy={ry} r="7.5" fill="#fecaca" fillOpacity="0.7" />
            </g>
          ))}

          {/* Multi-lobed Neutrophil WBC */}
          <g transform="translate(236, 230)">
            <circle cx="0" cy="0" r="24" fill="#e9d5ff" stroke="#9333ea" strokeWidth="2" />
            <circle cx="-7" cy="-6" r="6.5" fill="#581c87" />
            <circle cx="7" cy="-4" r="6" fill="#581c87" />
            <circle cx="0" cy="8" r="6.5" fill="#581c87" />
            <path d="M -7 -6 L 7 -4 L 0 8" stroke="#581c87" strokeWidth="2.5" fill="none" />
          </g>

          {/* Lymphocyte WBC (Large spherical nucleus) */}
          <g transform="translate(150, 260)">
            <circle cx="0" cy="0" r="20" fill="#bae6fd" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="1" cy="0" r="14.5" fill="#312e81" />
          </g>

          {/* Bilobed Eosinophil WBC */}
          <g transform="translate(276, 152)">
            <circle cx="0" cy="0" r="23" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
            <circle cx="-7" cy="0" r="6.5" fill="#831843" />
            <circle cx="7" cy="0" r="6.5" fill="#831843" />
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#831843" strokeWidth="2.5" />
          </g>

          {/* Platelet (Thrombocyte) Clusters */}
          {[
            [200, 130],
            [208, 135],
            [196, 138],
            [212, 127]
          ].map(([px, py], pi) => (
            <polygon
              key={pi}
              points={`${px},${py - 4} ${px + 4},${py + 2} ${px - 3},${py + 3}`}
              fill="#7e22ce"
            />
          ))}
        </svg>
      );

    case 'mitosis_onion_root':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Grid of meristematic root tip cells in different stages of Mitosis */}
          {/* 1. Interphase Cell (Top-Left) */}
          <g transform="translate(80, 90)">
            <rect x="0" y="0" width="84" height="74" rx="6" fill={fillSoft} stroke={strokeMain} strokeWidth="2.5" />
            <circle cx="42" cy="37" r="19" fill={nucleusColor} opacity="0.8" />
            <circle cx="47" cy="32" r="5" fill="#881337" />
          </g>

          {/* 2. Prophase Cell (Top-Right) */}
          <g transform="translate(230, 90)">
            <rect x="0" y="0" width="84" height="74" rx="6" fill={fillSoft} stroke={strokeMain} strokeWidth="2.5" />
            <circle cx="42" cy="37" r="21" fill="none" stroke={strokeMain} strokeDasharray="3 3" />
            <path d="M 30 28 Q 45 20, 52 36 T 34 48 T 54 44" stroke="#be123c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>

          {/* 3. Metaphase Cell (Center — Equatorial Alignment) */}
          <g transform="translate(152, 168)">
            <rect x="0" y="0" width="92" height="78" rx="6" fill={fillSoft} stroke="#f59e0b" strokeWidth="3" />
            {/* Spindle fibers from poles */}
            <line x1="46" y1="8" x2="24" y2="39" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="46" y1="8" x2="46" y2="39" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="46" y1="8" x2="68" y2="39" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="46" y1="70" x2="24" y2="39" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="46" y1="70" x2="46" y2="39" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="46" y1="70" x2="68" y2="39" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            {/* Metaphase chromosomes lined up at equator */}
            {[22, 34, 46, 58, 70].map((cx, ci) => (
              <path
                key={ci}
                d={`M ${cx - 4} 32 L ${cx + 4} 46 M ${cx + 4} 32 L ${cx - 4} 46`}
                stroke="#be123c"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* 4. Anaphase Cell (Bottom-Left — Separating Daughter Chromatids) */}
          <g transform="translate(86, 252)">
            <rect x="0" y="0" width="90" height="76" rx="6" fill={fillSoft} stroke={strokeMain} strokeWidth="2.5" />
            {[24, 38, 52, 66].map((cx, ci) => (
              <g key={ci}>
                <path d={`M ${cx - 5} 26 L ${cx} 16 L ${cx + 5} 26`} stroke="#be123c" strokeWidth="2.8" fill="none" />
                <path d={`M ${cx - 5} 50 L ${cx} 60 L ${cx + 5} 50`} stroke="#be123c" strokeWidth="2.8" fill="none" />
              </g>
            ))}
          </g>

          {/* 5. Telophase & Cell Plate (Bottom-Right) */}
          <g transform="translate(226, 252)">
            <rect x="0" y="0" width="90" height="76" rx="6" fill={fillSoft} stroke={strokeMain} strokeWidth="2.5" />
            <ellipse cx="45" cy="20" rx="22" ry="11" fill={nucleusColor} opacity="0.85" />
            <line x1="8" y1="38" x2="82" y2="38" stroke="#0284c7" strokeWidth="2.5" strokeDasharray="4 2" />
            <ellipse cx="45" cy="56" rx="22" ry="11" fill={nucleusColor} opacity="0.85" />
          </g>
        </svg>
      );

    case 'neuron_histology':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Branching Dendrites */}
          <path
            d="M 150 205 L 95 150 M 95 150 L 65 130 M 95 150 L 75 170 M 150 205 L 85 215 M 85 215 L 55 205 M 85 215 L 60 235 M 150 205 L 115 265 M 115 265 L 90 295 M 150 205 L 135 135"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Long Axon Shaft */}
          <line x1="150" y1="205" x2="310" y2="185" stroke="#22d3ee" strokeWidth="5" />
          {/* Myelin Sheath Internode Segments */}
          {[
            [185, 199],
            [230, 194],
            [275, 189]
          ].map(([mx, my], mi) => (
            <rect
              key={mi}
              x={mx}
              y={my - 10}
              width="34"
              height="20"
              rx="8"
              transform="rotate(-7, 230, 194)"
              fill="#a855f7"
              fillOpacity="0.65"
              stroke="#c084fc"
              strokeWidth="2"
            />
          ))}
          {/* Axon Terminal Synaptic Knobs */}
          <path
            d="M 310 185 L 345 160 M 310 185 L 352 188 M 310 185 L 342 215"
            stroke="#34d399"
            strokeWidth="3"
          />
          <circle cx="348" cy="158" r="6" fill="#34d399" />
          <circle cx="355" cy="188" r="6" fill="#34d399" />
          <circle cx="345" cy="217" r="6" fill="#34d399" />

          {/* Stellate Soma (Cyton) */}
          <polygon
            points="150,165 172,185 190,202 170,222 152,245 132,224 112,205 132,185"
            fill="#0891b2"
            stroke="#22d3ee"
            strokeWidth="3"
          />
          {/* Nissl's Granules */}
          {[
            [140, 188],
            [162, 192],
            [142, 218],
            [164, 214]
          ].map(([nx, ny], ni) => (
            <circle key={ni} cx={nx} cy={ny} r="3" fill="#fbbf24" />
          ))}
          {/* Central Neuronal Nucleus */}
          <circle cx="152" cy="205" r="12" fill="#e0f2fe" />
          <circle cx="154" cy="204" r="4.5" fill="#0284c7" />
        </svg>
      );

    case 'vascular_bundle_ts':
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Wedge-shaped Conjoint Collateral Open Vascular Bundle */}
          <path
            d="M 200 330 L 115 120 Q 200 75, 285 120 Z"
            fill={fillSoft}
            stroke={strokeMain}
            strokeWidth="3"
          />
          {/* Sclerenchymatous Bundle Cap (Pericycle) */}
          <path
            d="M 120 120 Q 200 75, 280 120 L 268 145 Q 200 108, 132 145 Z"
            fill="#9f1239"
            fillOpacity="0.75"
            stroke="#881337"
            strokeWidth="2"
          />
          {/* Outer Phloem Tissue (Green) */}
          <path
            d="M 132 145 Q 200 110, 268 145 L 252 195 Q 200 175, 148 195 Z"
            fill="#10b981"
            fillOpacity="0.65"
            stroke="#047857"
            strokeWidth="2"
          />
          {/* Vascular Cambium Strip (Amber) */}
          <path
            d="M 148 195 Q 200 175, 252 195 L 246 210 Q 200 190, 154 210 Z"
            fill="#fbbf24"
            stroke="#d97706"
            strokeWidth="1.5"
          />
          {/* Wide Metaxylem Vessels (Toward Periphery) */}
          {[
            [170, 232, 16],
            [200, 226, 17],
            [230, 232, 16]
          ].map(([mx, my, mr], i) => (
            <circle
              key={i}
              cx={mx}
              cy={my}
              r={mr}
              fill="#ffe4e6"
              stroke="#e11d48"
              strokeWidth="4.5"
            />
          ))}
          {/* Narrow Protoxylem Vessels (Toward Center Pith — Endarch) */}
          {[
            [188, 272, 9],
            [212, 272, 9],
            [200, 298, 8]
          ].map(([px, py, pr], i) => (
            <circle
              key={i}
              cx={px}
              cy={py}
              r={pr}
              fill="#ffe4e6"
              stroke="#be123c"
              strokeWidth="3.5"
            />
          ))}
        </svg>
      );

    case 'pond_microorganisms':
    default:
      return (
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* 1. Filamentous Spirogyra with Spiral Ribbon Chloroplast (Top) */}
          <g transform="translate(65, 95)">
            {[0, 1, 2].map((seg) => (
              <g key={seg} transform={`translate(${seg * 90}, 0)`}>
                <rect
                  x="0"
                  y="0"
                  width="90"
                  height="42"
                  fill="rgba(34,197,94,0.18)"
                  stroke="#15803d"
                  strokeWidth="2.5"
                />
                <path
                  d="M 4 8 C 25 38, 45 4, 65 36 C 75 20, 82 10, 88 28"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>

          {/* 2. Amoeba proteus with Pseudopodia & Food Vacuoles (Bottom-Left) */}
          <g transform="translate(135, 235)">
            <path
              d="M -45 -20 C -65 -45, -20 -65, 5 -40 C 30 -65, 65 -35, 45 -5 C 75 15, 50 50, 15 35 C -5 65, -45 50, -35 20 C -70 15, -65 -10, -45 -20 Z"
              fill="rgba(56,189,248,0.32)"
              stroke="#0284c7"
              strokeWidth="2.8"
            />
            {/* Amoeba Nucleus */}
            <circle cx="-5" cy="-5" r="12" fill="#0369a1" />
            {/* Food Vacuole & Contractile Vacuole */}
            <circle cx="20" cy="10" r="8" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
            <circle cx="-22" cy="14" r="9" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
          </g>

          {/* 3. Slipper-Shaped Paramecium caudatum with Cilia (Bottom-Right) */}
          <g transform="translate(280, 245) rotate(-24)">
            <ellipse
              cx="0"
              cy="0"
              rx="26"
              ry="56"
              fill="rgba(168,85,247,0.28)"
              stroke="#7e22ce"
              strokeWidth="2.5"
              strokeDasharray="3 2"
            />
            {/* Kidney-shaped Macronucleus & Micronucleus */}
            <ellipse cx="0" cy="-6" rx="10" ry="16" fill="#6b21a8" />
            <circle cx="12" cy="-6" r="3.5" fill="#4c1d95" />
            {/* Star-shaped Contractile Vacuoles */}
            <circle cx="0" cy="-36" r="6" fill="#f3e8ff" stroke="#7e22ce" strokeWidth="1.5" />
            <circle cx="0" cy="36" r="6" fill="#f3e8ff" stroke="#7e22ce" strokeWidth="1.5" />
          </g>
        </svg>
      );
  }
};

import React, { useState } from 'react';
import { 
  Gauge, 
  Flame, 
  RotateCcw, 
  PlusCircle, 
  Check, 
  Zap, 
  Cpu, 
  Activity, 
  Sliders,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ADVANCED_MACHINES } from '../data/engineeringData';
import { AdvancedMachine, MachineComponent } from '../types';
import { AdvancedLabRenderer } from './AdvancedLabRenderer';

interface AdvancedLabProps {
  onAddNote: (title: string, subject: 'Engineering', content: string, tags: string[], labRef: string) => void;
}

export const AdvancedLab: React.FC<AdvancedLabProps> = ({ onAddNote }) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string>('ev_powertrain');
  const [throttle, setThrottle] = useState<number>(0.4);
  const [exploded, setExploded] = useState<number>(0);
  const [afterburner, setAfterburner] = useState<boolean>(false);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [noteCopied, setNoteCopied] = useState<boolean>(false);

  const activeMachine: AdvancedMachine =
    ADVANCED_MACHINES.find((m) => m.id === selectedMachineId) || ADVANCED_MACHINES[0];

  const activeComponent: MachineComponent | undefined =
    activeMachine.components.find((c) => c.id === selectedCompId) || activeMachine.components[0];

  // Dynamic telemetry calculations based on throttle & active machine
  const telemetry = calculateTelemetry(activeMachine.renderType, throttle, afterburner);

  const handleSaveToNotes = () => {
    const content = `### Engineering Analysis: ${activeMachine.name}
**Subsystem Category**: ${activeMachine.category}
**Overview**: ${activeMachine.description}

#### Real-time Operating Telemetry:
${telemetry.map((t) => `- **${t.label}**: ${t.value}`).join('\n')}

#### Specifications:
${activeMachine.specifications.map((s) => `- ${s.label}: ${s.value}`).join('\n')}

#### Key Components Examined:
${activeMachine.components.map((c) => `- **${c.name}** (${c.role}): ${c.detail}`).join('\n')}
`;

    onAddNote(
      `${activeMachine.name} Lab Report`,
      'Engineering',
      content,
      [activeMachine.category, 'Advanced 3D Lab', 'Telemetry'],
      `Advanced 3D Lab: ${activeMachine.name}`
    );

    setNoteCopied(true);
    setTimeout(() => setNoteCopied(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Header & Machine Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Advanced 3D Lab</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-world mechanical systems, automotive powertrains, aerospace turbines, and microelectronics.
          </p>
        </div>

        {/* Machine selection pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl no-scrollbar">
          {ADVANCED_MACHINES.map((machine) => {
            const isSel = machine.id === activeMachine.id;
            return (
              <button
                key={machine.id}
                onClick={() => {
                  setSelectedMachineId(machine.id);
                  setSelectedCompId(null);
                  setExploded(0);
                  setAfterburner(false);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {machine.name.split(' ')[0]} {machine.category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Stage & Realtime Controls */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col min-h-[560px]">
          {/* Top Title Overlay */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-cyan-400">{activeMachine.category}</span>
              <span aria-hidden="true">·</span>
              <span>{activeMachine.subtitle}</span>
            </div>
            <h3 className="text-xl font-bold text-white font-display mt-0.5">
              {activeMachine.name}
            </h3>
          </div>

          {/* Reset & Status Overlay (Right Top) */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            {activeMachine.renderType === 'jet_engine' && (
              <button
                onClick={() => setAfterburner(!afterburner)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  afterburner
                    ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-lg shadow-red-950/60 animate-pulse'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>{afterburner ? 'Afterburner ON' : 'Ignite Afterburner'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setThrottle(0.4);
                setExploded(0);
                setSelectedCompId(null);
                setAfterburner(false);
              }}
              title="Reset Sandbox"
              className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3D WebGL Canvas */}
          <div className="flex-1 w-full min-h-[460px] h-[460px] relative science-grid overflow-hidden">
            <AdvancedLabRenderer
              renderType={activeMachine.renderType}
              throttle={throttle}
              exploded={exploded}
              selectedComponentId={selectedCompId}
              onSelectComponent={(cId) => setSelectedCompId(cId)}
              afterburner={afterburner}
            />

            <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] text-slate-400 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rotate around machine · Click components to inspect · Adjust drive power</span>
            </div>
          </div>

          {/* Bottom Live Controls Deck */}
          <div className="bg-slate-950/95 border-t border-slate-800 px-5 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Throttle / Power Lever */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Drive Throttle / Cycle Power:</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold tabular-nums">
                    {Math.round(throttle * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={throttle}
                  onChange={(e) => setThrottle(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Exploded Disassembly View */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Exploded Assembly Separation:</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold tabular-nums">
                    {Math.round(exploded * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={exploded}
                  onChange={(e) => setExploded(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <span className="text-[11px] text-slate-500">
                Physics & thermodynamics simulated in real-time
              </span>
              <button
                onClick={handleSaveToNotes}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-cyan-600/20 border border-cyan-500/40 hover:bg-cyan-600/30 text-cyan-300 rounded-lg transition-all"
              >
                {noteCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <PlusCircle className="w-3.5 h-3.5" />}
                <span>{noteCopied ? 'Logged to Notes!' : 'Log Telemetry to Notes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-time Telemetry & Component Details */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Telemetry Gauges */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live System Telemetry</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {telemetry.map((metric, i) => (
                <div key={i} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {metric.label}
                  </span>
                  <span className="font-mono text-sm font-bold text-white tabular-nums">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Component Deep Dive */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Engineering Component Inspector
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                {activeMachine.components.length} Subsystems
              </span>
            </div>

            {activeComponent ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block">
                    {activeComponent.role}
                  </span>
                  <h4 className="font-display text-base font-bold text-white">
                    {activeComponent.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeComponent.detail}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select a component below to inspect engineering specs.</p>
            )}

            {/* Subsystem Quick Links */}
            <div className="space-y-1 pt-1">
              {activeMachine.components.map((c) => {
                const isSelected = activeComponent?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCompId(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Machine Benchmark Specifications */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Manufacturer Benchmarks
            </span>
            <div className="space-y-2 text-xs">
              {activeMachine.specifications.map((spec, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">{spec.label}</span>
                  <span className="font-mono text-slate-200 font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: Calculate telemetry
function calculateTelemetry(type: string, throttle: number, afterburner: boolean) {
  if (type === 'ev_powertrain') {
    const speedKmh = Math.round(throttle * 320);
    const speedMph = Math.round(speedKmh * 0.621371);
    const motorRpm = Math.round(throttle * 21500);
    const currentA = Math.round(throttle * 650);
    const powerKw = Math.round(throttle * 750);
    const battTemp = (25 + throttle * 28).toFixed(1);

    return [
      { label: 'Ground Speed', value: `${speedKmh} km/h · ${speedMph} mph` },
      { label: 'Motor Speed', value: `${motorRpm.toLocaleString()} RPM` },
      { label: 'Pack Power', value: `${powerKw} kW` },
      { label: 'Phase Current', value: `${currentA} A` },
      { label: 'Battery Temp', value: `${battTemp} °C` },
      { label: 'SiC Frequency', value: '40 kHz' }
    ];
  } else if (type === 'jet_engine') {
    const n1 = Math.round(1800 + throttle * 11500);
    const thrustKn = Math.round(40 + throttle * 310 * (afterburner ? 1.45 : 1.0));
    const egt = Math.round(350 + throttle * 980 + (afterburner ? 380 : 0));
    const fuelFlow = (0.2 + throttle * 2.8 * (afterburner ? 2.5 : 1.0)).toFixed(2);

    return [
      { label: 'N1 Fan Speed', value: `${n1.toLocaleString()} RPM` },
      { label: 'Gross Thrust', value: `${thrustKn} kN` },
      { label: 'Exhaust Gas Temp', value: `${egt} °C` },
      { label: 'Fuel Flow', value: `${fuelFlow} kg/s` },
      { label: 'Bypass Ratio', value: '12.5 : 1' },
      { label: 'Pressure Ratio', value: `${(10 + throttle * 40).toFixed(1)} : 1` }
    ];
  } else if (type === 'robot_arm') {
    const reachMm = (1200 + throttle * 620).toFixed(0);
    const cycleTimeS = (0.9 - throttle * 0.45).toFixed(2);
    const currentDraw = (2.5 + throttle * 12.0).toFixed(1);

    return [
      { label: 'End Reach', value: `${reachMm} mm` },
      { label: 'Cycle Period', value: `${cycleTimeS} s` },
      { label: 'Torque Load', value: `${Math.round(throttle * 100)}% Nominal` },
      { label: 'Total Current', value: `${currentDraw} A` },
      { label: 'Repeatability', value: '± 0.015 mm' },
      { label: 'Bus EtherCAT', value: '1,000 Hz' }
    ];
  } else {
    // Motherboard
    const clockGhz = (2.4 + throttle * 3.6).toFixed(2);
    const vcore = (0.95 + throttle * 0.38).toFixed(3);
    const wattage = Math.round(45 + throttle * 205);
    const dieTemp = (32 + throttle * 56).toFixed(1);

    return [
      { label: 'Boost Frequency', value: `${clockGhz} GHz` },
      { label: 'Core Voltage (Vcore)', value: `${vcore} V` },
      { label: 'Package Power', value: `${wattage} W` },
      { label: 'Die Junction Temp', value: `${dieTemp} °C` },
      { label: 'Memory Bus', value: 'DDR5-7200' },
      { label: 'VRM Efficiency', value: '95.2%' }
    ];
  }
}

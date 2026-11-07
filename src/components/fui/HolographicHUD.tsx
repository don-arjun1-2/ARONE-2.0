import React, { useState } from 'react';
import { WireframeGlobe } from './WireframeGlobe';
import { HolographicRingAssembly } from './HolographicRingAssembly';
import { DataStreamCircuit } from './DataStreamCircuit';
import { CpuCoreGrid } from './CpuCoreGrid';
import { BottomMetricsCluster } from './BottomMetricsCluster';
import { Send, Terminal, Sparkles } from 'lucide-react';
import { playAcousticCue } from '../../utils/soundFx';

interface HolographicHUDProps {
  onIssueDirective: (text: string) => void;
  onOpenConsole: () => void;
}

export const HolographicHUD: React.FC<HolographicHUDProps> = ({
  onIssueDirective,
  onOpenConsole,
}) => {
  const [hudInput, setHudInput] = useState('');
  const [opticalAlert, setOpticalAlert] = useState(false);

  const handleDirectiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hudInput.trim()) return;
    playAcousticCue('affirmative');
    onIssueDirective(hudInput.trim());
    setHudInput('');
    onOpenConsole();
  };

  const handleRingInteract = () => {
    setOpticalAlert(true);
    setTimeout(() => setOpticalAlert(false), 800);
  };

  return (
    <div className="relative w-full h-[calc(100vh-68px)] max-h-[832px] bg-[#02040e] text-slate-100 overflow-hidden select-none p-2.5 lg:px-4 lg:py-2 flex flex-col justify-between">
      {/* 1. Global Holographic Background Grid & Scanning Light Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0, 229, 255, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Holographic Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 25% 45%, rgba(0, 85, 255, 0.12) 0%, rgba(2, 4, 14, 0.7) 70%, #02040e 100%)',
        }}
        aria-hidden="true"
      />

      {/* Soft Glowing Scanning Light Beam */}
      <div
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30 animate-pulse pointer-events-none"
        style={{
          top: '22%',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
        }}
        aria-hidden="true"
      />

      {/* TOP BAR / HEADER ROW */}
      <div className="relative z-10 flex items-center justify-between gap-4 mb-3">
        {/* Extreme Top-Left Corner: 3D Wireframe Globe */}
        <div className="flex-shrink-0">
          <WireframeGlobe size={95} />
        </div>

        {/* Center Top HUD Telemetry Title / Status Banner */}
        <div className="hidden md:flex flex-col items-center justify-center p-2 px-6 bg-[#030718]/80 border border-cyan-800/40 rounded-xl backdrop-blur-md text-center">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>ARONE // ADVANCED HOLOGRAPHIC PROJECTION HUD</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
            <span>INTERFACE MODE: REALTIME FUI</span>
            <span aria-hidden="true">·</span>
            <span>POLARITY: DUAL-BAND POLARIZED</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">CARRIER LOCK 100%</span>
          </div>
        </div>

        {/* Top-Right Quick Console Trigger */}
        <button
          type="button"
          onClick={() => {
            playAcousticCue('processing');
            onOpenConsole();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/50 transition-colors"
          aria-label="Open Executive AI Channel"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Executive AI Console</span>
        </button>
      </div>

      {/* MAIN 3-ZONE FUI COMPOSITION GRID */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1">
        {/* FAR-LEFT ZONE (4 Cols): Dominant Complex Holographic Ring Assembly */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative p-3 bg-[#03071a]/60 border border-cyan-950/70 rounded-xl backdrop-blur-sm">
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-cyan-400/80 mb-2 px-1">
            <span>HOLOGRAPHIC CORE // AZ-312</span>
            <span className="text-slate-400">FOCAL DEPTH: 1.48λ</span>
          </div>

          <div className="flex-1 flex items-center justify-center my-1">
            <HolographicRingAssembly onInteract={handleRingInteract} />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono mt-2">
            <span
              className={`w-2 h-2 rounded-full ${
                opticalAlert ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'
              }`}
            />
            <span className="text-cyan-200 text-[11px]">
              {opticalAlert ? 'OPTICAL CALIBRATION IN PROGRESS' : 'PRIMARY CORE RESONANCE STABLE'}
            </span>
          </div>
        </div>

        {/* CENTER ZONE (4 Cols): Horizontal Data Stream Flowing from Left Ring */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          <div className="flex-1">
            <DataStreamCircuit />
          </div>

          {/* Direct Holographic Command Bar */}
          <form
            onSubmit={handleDirectiveSubmit}
            className="flex items-center gap-2 bg-[#03081c]/90 border border-cyan-800/60 rounded-xl px-3 py-2 shadow-inner focus-within:border-cyan-400 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={hudInput}
              onChange={(e) => setHudInput(e.target.value)}
              placeholder="Issue directive directly to ARONE Holographic Matrix..."
              className="flex-1 bg-transparent text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
              aria-label="Direct HUD command input"
            />
            <button
              type="submit"
              disabled={!hudInput.trim()}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold font-mono text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-40"
              aria-label="Transmit Directive"
            >
              <span>Transmit</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>

        {/* RIGHT ZONE (4 Cols): Top-Right Quadrant Structured Data + Bottom-Right Area Key Metrics */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          {/* Top-Right Quadrant: Structured Data Widgets */}
          <div>
            <CpuCoreGrid />
          </div>

          {/* Bottom-Right Area: Key Metrics (Clock 2:50 PM, RAM USAGE 27%, Segmented Timestamp 02:9...) */}
          <div>
            <BottomMetricsCluster />
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { WireframeGlobe } from './WireframeGlobe';
import { HolographicRingAssembly } from './HolographicRingAssembly';
import { DataStreamCircuit } from './DataStreamCircuit';
import { CpuCoreGrid } from './CpuCoreGrid';
import { BottomMetricsCluster } from './BottomMetricsCluster';
import { Send, Terminal, Sparkles, Radio, Activity, Mail } from 'lucide-react';
import { playAcousticCue } from '../../utils/soundFx';

interface HolographicHUDProps {
  onIssueDirective: (text: string) => void;
  onOpenConsole: () => void;
  onOpenWorkspace?: () => void;
  onOpenTelemetry?: () => void;
  onRunDiagnostics?: () => void;
  workspaceStats?: {
    eventsCount: number;
    unreadEmails: number;
    isConnected: boolean;
  };
}

export const HolographicHUD: React.FC<HolographicHUDProps> = ({
  onIssueDirective,
  onOpenConsole,
  onOpenWorkspace,
  onOpenTelemetry,
  onRunDiagnostics,
  workspaceStats,
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
    <div className="relative w-full min-h-screen bg-[#02040e] text-slate-100 flex flex-col justify-between p-3 md:p-5 pb-8 select-none overflow-x-hidden">
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
            'radial-gradient(ellipse at 25% 40%, rgba(0, 85, 255, 0.12) 0%, rgba(2, 4, 14, 0.7) 75%, #02040e 100%)',
        }}
        aria-hidden="true"
      />

      {/* Soft Glowing Scanning Light Beam */}
      <div
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-25 animate-pulse pointer-events-none"
        style={{
          top: '26%',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
        }}
        aria-hidden="true"
      />

      {/* ============================================================== */}
      {/* SECTION 1: TOP HUD HEADER (Filling the full viewport header space) */}
      {/* ============================================================== */}
      <header className="relative z-20 flex items-center justify-between gap-4 pb-3 border-b border-cyan-950/60">
        {/* Extreme Top-Left Corner: 3D Wireframe Globe with telemetry coordinates */}
        <div className="flex-shrink-0">
          <WireframeGlobe size={84} />
        </div>

        {/* Center Top HUD Telemetry Title / Status Banner */}
        <div className="flex flex-col items-center justify-center p-2 px-5 bg-[#030718]/90 border border-cyan-800/50 rounded-2xl backdrop-blur-md text-center shadow-[0_0_20px_rgba(0,229,255,0.08)]">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>ARONE // ADVANCED HOLOGRAPHIC PROJECTION HUD</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
            <span>INTERFACE MODE: REALTIME FUI</span>
            <span aria-hidden="true">·</span>
            <span>POLARITY: DUAL-BAND POLARIZED</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">CARRIER LOCK 100%</span>
          </div>
        </div>

        {/* Top-Right Integrated HUD Control Strip (Unobtrusive quick channels) */}
        <div className="flex items-center gap-2">
          {onOpenWorkspace && (
            <button
              type="button"
              onClick={onOpenWorkspace}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-xl border transition-colors ${
                workspaceStats?.isConnected
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 hover:bg-cyan-900/60'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Open Google Workspace & Communications Bridge"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Workspace</span>
              {workspaceStats?.isConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playAcousticCue('processing');
              onOpenConsole();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 rounded-xl hover:bg-cyan-900/50 transition-colors shadow-sm"
            aria-label="Open Executive AI Channel"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Executive Console</span>
          </button>

          {onRunDiagnostics && (
            <button
              type="button"
              onClick={() => {
                playAcousticCue('affirmative');
                onRunDiagnostics();
              }}
              className="p-1.5 rounded-xl border border-cyan-800/80 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/50 transition-colors"
              title="Run Diagnostics"
            >
              <Activity className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ============================================================== */}
      {/* SECTION 2: MAIN 3-ZONE MIDDLE FUI COMPOSITION GRID */}
      {/* ============================================================== */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 my-4 items-stretch flex-1">
        {/* FAR-LEFT ZONE (4 Cols): Dominant Complex Holographic Ring Assembly */}
        <div className="lg:col-span-4 flex flex-col items-center justify-between relative p-3.5 bg-[#03071a]/70 border border-cyan-950/80 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(0,229,255,0.06)]">
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-cyan-400/80 mb-2 px-1">
            <span>HOLOGRAPHIC CORE // AZ-312</span>
            <span className="text-slate-400">FOCAL DEPTH: 1.48λ</span>
          </div>

          <div className="flex-1 flex items-center justify-center my-2">
            <HolographicRingAssembly onInteract={handleRingInteract} />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono mt-2 px-3 py-1 bg-black/40 border border-cyan-950 rounded-lg">
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

        {/* CENTER ZONE (4 Cols): Interactive Real-time Network Waveforms & Clickable Circuit Traces */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          <div className="flex-1 min-h-[300px]">
            <DataStreamCircuit />
          </div>

          {/* Workspace Comms Link Status Strip */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-cyan-950 bg-[#020512]/90 text-[10px] font-mono">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  workspaceStats?.isConnected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span className="text-slate-300">
                {workspaceStats?.isConnected
                  ? `WORKSPACE SYNC: ${workspaceStats.eventsCount} EVENTS · ${workspaceStats.unreadEmails} UNREAD`
                  : 'WORKSPACE COMMS: STANDBY'}
              </span>
            </div>
            {onOpenWorkspace && (
              <button
                type="button"
                onClick={onOpenWorkspace}
                className="text-cyan-400 hover:text-cyan-200 underline decoration-cyan-500/50"
              >
                {workspaceStats?.isConnected ? 'Open Bridge →' : 'Connect Workspace →'}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT ZONE (4 Cols): Top-Right Quadrant Structured Data Widgets */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <CpuCoreGrid />
        </div>
      </main>

      {/* ============================================================== */}
      {/* SECTION 3: DEDICATED BOTTOM FOOTER AREA (No Overlaps, Clean pb-4) */}
      {/* ============================================================== */}
      <footer className="relative z-20 w-full space-y-3 pt-2">
        {/* Row A: Non-overlapping Bottom Metrics Cluster (Clock, RAM 27%, Segmented Timestamp) */}
        <div className="w-full">
          <BottomMetricsCluster />
        </div>

        {/* Row B: "Speak to ARONE" Direct Command Input Bar Cleanly Positioned Beneath All Telemetry */}
        <div className="w-full">
          <form
            onSubmit={handleDirectiveSubmit}
            className="flex items-center gap-3 bg-[#03081c]/95 border border-cyan-800/70 rounded-2xl px-4 py-2.5 shadow-[0_0_20px_rgba(0,229,255,0.1)] focus-within:border-cyan-400 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
            <input
              type="text"
              value={hudInput}
              onChange={(e) => setHudInput(e.target.value)}
              placeholder="Talk with ARONE (e.g. 'What are we working on today, boss?', 'Brainstorm 3 creative concepts', 'Streamline my schedule')..."
              className="flex-1 bg-transparent text-xs md:text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
              aria-label="Direct HUD command input"
            />
            <button
              type="submit"
              disabled={!hudInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold font-mono text-slate-950 bg-cyan-400 rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-40 shadow-sm"
              aria-label="Transmit Directive"
            >
              <span>Transmit</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-2 mt-1">
            <span>Press Enter to transmit directive directly to ARONE Executive Neural Core</span>
            <span>Acoustic feedback active · Zero clipping layout</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

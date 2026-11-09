import React, { useState, useEffect, useRef } from 'react';
import { generateCircuitNetwork } from '../../utils/fuiData';
import { ArrowUpRight, ArrowDownRight, Activity, Zap, RefreshCw, Radio } from 'lucide-react';
import { playAcousticCue } from '../../utils/soundFx';

interface TraceNodeState {
  id: string;
  label: string;
  x: number;
  y: number;
  status: 'ONLINE' | 'BOOST' | 'ISOLATED' | 'DIAGNOSTIC';
  latency: number;
  connections: string[];
}

export const DataStreamCircuit: React.FC = () => {
  const [phase, setPhase] = useState(0);
  const [txRate, setTxRate] = useState(842.4);
  const [rxRate, setRxRate] = useState(1420.8);
  const [streamMode, setStreamMode] = useState<'NOMINAL' | 'BURST' | 'OPTIMIZED'>('NOMINAL');
  const [activeNodeId, setActiveNodeId] = useState<string | null>('n4');
  const [pulseProgress, setPulseProgress] = useState(0);
  const [busImpedance, setBusImpedance] = useState(50.2);
  const [pingActive, setPingActive] = useState(false);

  // Trace nodes state
  const circuitBase = generateCircuitNetwork();
  const [nodeStates, setNodeStates] = useState<Record<string, TraceNodeState>>(() => {
    const map: Record<string, TraceNodeState> = {};
    const labels = ['IN_0', 'BUS_A', 'BUS_B', 'CORE_1', 'MUX_4', 'CORE_2', 'ETH_A', 'ETH_B', 'OUT_X'];
    circuitBase.nodes.forEach((n, idx) => {
      map[n.id] = {
        id: n.id,
        label: labels[idx] || `N_${idx}`,
        x: n.x,
        y: n.y,
        status: idx === 4 ? 'BOOST' : 'ONLINE',
        latency: 0.8 + idx * 0.2,
        connections: n.connections,
      };
    });
    return map;
  });

  // Continuous 60fps real-time data animation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setPhase((prev) => (prev + (streamMode === 'BURST' ? 0.08 : 0.04)) % (Math.PI * 40));
      setPulseProgress((prev) => (prev + (streamMode === 'BURST' ? 0.012 : 0.007)) % 1);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [streamMode]);

  // Network rate streaming jitter
  useEffect(() => {
    const timer = setInterval(() => {
      const multiplier = streamMode === 'BURST' ? 1.6 : streamMode === 'OPTIMIZED' ? 1.1 : 1.0;
      setTxRate(
        Math.round(
          (780 * multiplier + Math.sin(Date.now() / 800) * 80 + (Math.random() * 30 - 15)) * 10
        ) / 10
      );
      setRxRate(
        Math.round(
          (1350 * multiplier + Math.cos(Date.now() / 900) * 120 + (Math.random() * 40 - 20)) * 10
        ) / 10
      );
      setBusImpedance(Math.round((50.0 + (Math.random() * 0.4 - 0.2)) * 10) / 10);
    }, 600);
    return () => clearInterval(timer);
  }, [streamMode]);

  // Click handler to toggle trace node diagnostic states
  const handleNodeClick = (nodeId: string) => {
    playAcousticCue('affirmative');
    setActiveNodeId(nodeId);
    setNodeStates((prev) => {
      const current = prev[nodeId];
      if (!current) return prev;
      const nextStatus: TraceNodeState['status'] =
        current.status === 'ONLINE'
          ? 'BOOST'
          : current.status === 'BOOST'
          ? 'DIAGNOSTIC'
          : current.status === 'DIAGNOSTIC'
          ? 'ISOLATED'
          : 'ONLINE';

      return {
        ...prev,
        [nodeId]: {
          ...current,
          status: nextStatus,
          latency:
            nextStatus === 'BOOST'
              ? 0.4
              : nextStatus === 'DIAGNOSTIC'
              ? 2.8
              : nextStatus === 'ISOLATED'
              ? 99.9
              : 1.1,
        },
      };
    });
  };

  const handlePingBus = () => {
    playAcousticCue('processing');
    setPingActive(true);
    setTimeout(() => {
      setPingActive(false);
      playAcousticCue('chime');
    }, 700);
  };

  const handleToggleMode = () => {
    playAcousticCue('affirmative');
    setStreamMode((prev) =>
      prev === 'NOMINAL' ? 'BURST' : prev === 'BURST' ? 'OPTIMIZED' : 'NOMINAL'
    );
  };

  // Generate continuous waveform coordinates for SVG
  const generateLiveWaveform = (
    width: number,
    height: number,
    harmonicPhase: number,
    freq: number
  ) => {
    const steps = 48;
    const points: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const normX = i / steps;
      const h1 = Math.sin(normX * Math.PI * 4 * freq + harmonicPhase);
      const h2 = Math.cos(normX * Math.PI * 7 * freq - harmonicPhase * 1.3) * 0.35;
      const noise = Math.sin(normX * 28 + harmonicPhase * 2.5) * 0.15;
      const combined = (h1 + h2 + noise) * 0.45;
      const y = height / 2 + combined * (height * 0.4);
      points.push(`${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`);
    }
    return points.join(' ');
  };

  const upWavePoints = generateLiveWaveform(
    480,
    52,
    phase,
    streamMode === 'BURST' ? 1.8 : 1.2
  );
  const downWavePoints = generateLiveWaveform(
    480,
    52,
    phase * 1.25,
    streamMode === 'BURST' ? 2.2 : 1.5
  );

  const activeNode = activeNodeId ? nodeStates[activeNodeId] : null;

  return (
    <div className="relative flex flex-col justify-between h-full w-full bg-[#020512]/80 border-y border-r border-cyan-500/30 rounded-r-2xl overflow-hidden backdrop-blur-md p-3">
      {/* Background Faint Blue Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0, 229, 255, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
        aria-hidden="true"
      />

      {/* Horizontal glowing connector line tying to left ring */}
      <div className="absolute top-1/2 left-0 w-8 h-[2px] bg-gradient-to-r from-cyan-400 to-transparent pointer-events-none" />

      {/* 1. TOP-ALIGNED: NETWORK TRAFFIC UP (Interactive Functional Graph) */}
      <div className="relative z-10 p-2.5 bg-slate-950/85 border border-cyan-900/60 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.06)]">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold tracking-wider">
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>NETWORK TRAFFIC UP</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>
              TX: <strong className="text-cyan-300 font-mono tabular-nums">{txRate} KB/s</strong>
            </span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleToggleMode}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-colors ${
                streamMode === 'BURST'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
              }`}
              title="Click to toggle network simulation mode"
            >
              {streamMode}
            </button>
          </div>
        </div>

        {/* Real-time Streaming Waveform Canvas */}
        <div className="relative h-12 w-full bg-[#030919] border border-cyan-950 rounded-lg overflow-hidden cursor-crosshair">
          <svg className="w-full h-full" viewBox="0 0 480 52" preserveAspectRatio="none">
            <defs>
              <linearGradient id="upWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0, 240, 255, 0.45)" />
                <stop offset="100%" stopColor="rgba(0, 85, 255, 0.02)" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="26"
              x2="480"
              y2="26"
              stroke="rgba(0, 119, 255, 0.25)"
              strokeDasharray="4 4"
            />
            <polygon points={`0,52 ${upWavePoints} 480,52`} fill="url(#upWaveGrad)" />
            <polyline points={upWavePoints} fill="none" stroke="#00f0ff" strokeWidth="1.75" />
          </svg>
          {/* Vertical dynamic scanning bar */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-300 shadow-[0_0_10px_#00f0ff] opacity-80"
            style={{ left: `${(phase * 15) % 100}%` }}
          />
        </div>
      </div>

      {/* 2. MIDDLE: INTERACTIVE BLUE-ELECTRIC CIRCUIT TRACE LINES & CLICKABLE NODES */}
      <div className="relative z-10 my-2 flex-1 flex flex-col justify-center bg-black/40 border border-cyan-950/70 rounded-xl p-2">
        {/* Trace Header & Diagnostic Action Controls */}
        <div className="flex items-center justify-between text-[10px] font-mono px-2 mb-1">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold tracking-widest uppercase">
            <Zap className={`w-3.5 h-3.5 text-cyan-400 ${pingActive ? 'animate-spin' : ''}`} />
            <span>BUS ROUTING // TRACE ARRAY 0x4B</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePingBus}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-[9px] text-cyan-300 hover:bg-cyan-900/60 transition-colors"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${pingActive ? 'animate-spin' : ''}`} />
              <span>Diagnostic Ping</span>
            </button>
            <span className="text-slate-500">IMPEDANCE: {busImpedance}Ω</span>
          </div>
        </div>

        {/* Interactive Circuit SVG Canvas */}
        <div className="relative w-full h-[120px] flex items-center justify-center">
          <svg
            className="w-full h-full max-h-[120px]"
            viewBox="0 0 340 100"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Static Bus Traces */}
            {circuitBase.paths.map((p, idx) => (
              <path
                key={idx}
                d={p}
                fill="none"
                stroke="rgba(0, 102, 255, 0.4)"
                strokeWidth="1.5"
              />
            ))}

            {/* Kinetic Moving Pulse Traces */}
            {circuitBase.paths.map((p, idx) => (
              <path
                key={`active-${idx}`}
                d={p}
                fill="none"
                stroke={pingActive ? '#38bdf8' : '#00f0ff'}
                strokeWidth="1.75"
                strokeDasharray="14 36"
                strokeDashoffset={-phase * (20 + idx * 2)}
                filter="url(#circuitGlow)"
                opacity={pingActive ? 1 : 0.85}
              />
            ))}

            {/* Clickable Circuit Nodes */}
            {Object.values(nodeStates).map((node) => {
              const isSelected = activeNodeId === node.id;
              const nodeColor =
                node.status === 'BOOST'
                  ? '#38bdf8'
                  : node.status === 'DIAGNOSTIC'
                  ? '#f59e0b'
                  : node.status === 'ISOLATED'
                  ? '#ef4444'
                  : '#00f0ff';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => handleNodeClick(node.id)}
                  className="cursor-pointer group"
                >
                  {/* Outer Click Target Area */}
                  <circle cx="0" cy="0" r="12" fill="transparent" />

                  {/* Pulsing Selection Ring */}
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="0"
                      r="9"
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      className="animate-spin"
                      style={{ animationDuration: '4s' }}
                    />
                  )}

                  {/* Node Outer Halo */}
                  <circle
                    cx="0"
                    cy="0"
                    r="5.5"
                    fill="rgba(3, 7, 24, 0.95)"
                    stroke={nodeColor}
                    strokeWidth={isSelected ? '2' : '1.25'}
                    className="transition-all group-hover:scale-125"
                  />

                  {/* Center Core LED */}
                  <circle cx="0" cy="0" r="2.5" fill={nodeColor} />

                  {/* Node Label Text */}
                  <text
                    x="0"
                    y="-8"
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#64748b'}
                    fontSize="7"
                    fontFamily="monospace"
                    className="pointer-events-none select-none transition-colors group-hover:fill-cyan-300"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}

            {/* Traveling Data Packet Pulses */}
            <circle
              cx={20 + pulseProgress * 300}
              cy={50 + Math.sin(pulseProgress * Math.PI * 6) * 22}
              r="3.5"
              fill="#00f0ff"
              filter="url(#circuitGlow)"
            />
            <circle
              cx={320 - pulseProgress * 300}
              cy={50 + Math.cos(pulseProgress * Math.PI * 4) * 20}
              r="2.5"
              fill="#38bdf8"
              filter="url(#circuitGlow)"
            />
          </svg>
        </div>

        {/* Selected Node Status Readout Bar */}
        {activeNode && (
          <div className="flex items-center justify-between px-3 py-1 bg-cyan-950/40 border border-cyan-800/40 rounded-lg text-[10px] font-mono mt-1">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-semibold">{activeNode.label}</span>
              <span className="text-slate-400">STATUS:</span>
              <span
                className={`font-semibold ${
                  activeNode.status === 'BOOST'
                    ? 'text-cyan-300'
                    : activeNode.status === 'DIAGNOSTIC'
                    ? 'text-amber-400'
                    : activeNode.status === 'ISOLATED'
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {activeNode.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span>LATENCY: <strong className="text-slate-200">{activeNode.latency}ms</strong></span>
              <span className="text-cyan-400 text-[9px] underline cursor-pointer" onClick={() => handleNodeClick(activeNode.id)}>
                Toggle State ↺
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM-ALIGNED: NETWORK TRAFFIC DOWN (Interactive Functional Graph) */}
      <div className="relative z-10 p-2.5 bg-slate-950/85 border border-cyan-900/60 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.06)]">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold tracking-wider">
            <ArrowDownRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>NETWORK TRAFFIC DOWN</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>
              RX: <strong className="text-cyan-300 font-mono tabular-nums">{rxRate} KB/s</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono">NOMINAL</span>
          </div>
        </div>

        {/* Real-time Streaming Waveform Canvas */}
        <div className="relative h-12 w-full bg-[#030919] border border-cyan-950 rounded-lg overflow-hidden cursor-crosshair">
          <svg className="w-full h-full" viewBox="0 0 480 52" preserveAspectRatio="none">
            <defs>
              <linearGradient id="downWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0, 119, 255, 0.45)" />
                <stop offset="100%" stopColor="rgba(0, 240, 255, 0.02)" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="26"
              x2="480"
              y2="26"
              stroke="rgba(0, 119, 255, 0.25)"
              strokeDasharray="4 4"
            />
            <polygon points={`0,52 ${downWavePoints} 480,52`} fill="url(#downWaveGrad)" />
            <polyline points={downWavePoints} fill="none" stroke="#00d8ff" strokeWidth="1.75" />
          </svg>
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_10px_#00f0ff] opacity-80"
            style={{ left: `${(phase * 18) % 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

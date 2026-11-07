import React, { useState, useEffect } from 'react';
import { generateWaveformPoints, generateCircuitNetwork } from '../../utils/fuiData';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export const DataStreamCircuit: React.FC = () => {
  const [phase, setPhase] = useState(0);
  const [txRate, setTxRate] = useState(842.4);
  const [rxRate, setRxRate] = useState(1420.8);
  const [pulsePos, setPulsePos] = useState(0);

  useEffect(() => {
    let animId: number;
    const animate = () => {
      setPhase(prev => (prev + 0.05) % (Math.PI * 20));
      setPulsePos(prev => (prev + 0.008) % 1);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Periodic random micro-fluctuations in network metrics
  useEffect(() => {
    const timer = setInterval(() => {
      setTxRate(prev => Math.round((prev + (Math.random() * 40 - 20)) * 10) / 10);
      setRxRate(prev => Math.round((prev + (Math.random() * 60 - 30)) * 10) / 10);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const circuit = generateCircuitNetwork();
  const upPoints = generateWaveformPoints(480, 54, phase, 1.2, 0.3);
  const downPoints = generateWaveformPoints(480, 54, phase * 1.3, 1.6, 0.4);

  return (
    <div className="relative flex flex-col justify-between h-full w-full min-h-[220px] bg-[#020512]/70 border-y border-r border-cyan-500/30 rounded-r-xl overflow-hidden backdrop-blur-md p-2.5">
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

      {/* 1. TOP-ALIGNED: NETWORK TRAFFIC UP */}
      <div className="relative z-10 p-3 bg-slate-950/80 border border-cyan-900/50 rounded-lg">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold tracking-wider">
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>NETWORK TRAFFIC UP</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>TX: <strong className="text-cyan-300 font-mono tabular-nums">{txRate} KB/s</strong></span>
            <span aria-hidden="true">·</span>
            <span>PKT/S: <strong className="text-slate-200 font-mono">1,248</strong></span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">STABLE</span>
          </div>
        </div>

        {/* Real-time Waveform Canvas/SVG */}
        <div className="relative h-14 w-full bg-[#030919] border border-cyan-950 rounded overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 480 54" preserveAspectRatio="none">
            <defs>
              <linearGradient id="upWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0, 240, 255, 0.4)" />
                <stop offset="100%" stopColor="rgba(0, 85, 255, 0.02)" />
              </linearGradient>
            </defs>
            {/* Grid markers inside waveform */}
            <line x1="0" y1="27" x2="480" y2="27" stroke="rgba(0, 119, 255, 0.2)" strokeDasharray="4 4" />
            {/* Filled area */}
            <polygon points={`0,54 ${upPoints} 480,54`} fill="url(#upWaveGrad)" />
            {/* Waveform stroke line */}
            <polyline points={upPoints} fill="none" stroke="#00f0ff" strokeWidth="1.75" />
          </svg>
          {/* Vertical scanning bar */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-300 shadow-[0_0_8px_#00f0ff] opacity-75"
            style={{ left: `${(phase * 12) % 100}%` }}
          />
        </div>
      </div>

      {/* 2. MIDDLE: INTERCONNECTED BLUE-ELECTRIC CIRCUIT TRACE LINES & NODES */}
      <div className="relative z-10 my-3 flex-1 flex items-center justify-center min-h-[140px] px-2">
        <svg className="w-full h-full max-h-[160px]" viewBox="0 0 340 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Circuit Traces */}
          {circuit.paths.map((p, idx) => (
            <path
              key={idx}
              d={p}
              fill="none"
              stroke="rgba(0, 102, 255, 0.45)"
              strokeWidth="1.5"
            />
          ))}

          {/* Active Glowing Data Traces */}
          {circuit.paths.slice(0, 4).map((p, idx) => (
            <path
              key={`active-${idx}`}
              d={p}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="1.5"
              strokeDasharray="12 40"
              strokeDashoffset={-phase * 25}
              filter="url(#circuitGlow)"
            />
          ))}

          {/* Circuit Nodes */}
          {circuit.nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              {/* Outer node halo */}
              <circle cx="0" cy="0" r="5" fill="rgba(2, 6, 20, 0.9)" stroke="#00f0ff" strokeWidth="1.2" />
              {/* Center contact point */}
              <circle cx="0" cy="0" r="2" fill="#00f0ff" />
            </g>
          ))}

          {/* Data packet pulses traveling across circuit */}
          <circle
            cx={20 + pulsePos * 300}
            cy={50 + Math.sin(pulsePos * Math.PI * 4) * 20}
            r="3"
            fill="#00f0ff"
            filter="url(#circuitGlow)"
          />
        </svg>

        {/* Text Annotation Overlay */}
        <div className="absolute top-2 left-4 text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase">
          BUS ROUTING // TRACE ARRAY 0x4B
        </div>
        <div className="absolute bottom-2 right-4 text-[10px] font-mono text-slate-400">
          IMPEDANCE: 50.2Ω · LOCK 100%
        </div>
      </div>

      {/* 3. BOTTOM-ALIGNED: NETWORK TRAFFIC DOWN */}
      <div className="relative z-10 p-3 bg-slate-950/80 border border-cyan-900/50 rounded-lg">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold tracking-wider">
            <ArrowDownRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>NETWORK TRAFFIC DOWN</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>RX: <strong className="text-cyan-300 font-mono tabular-nums">{rxRate} KB/s</strong></span>
            <span aria-hidden="true">·</span>
            <span>PKT/S: <strong className="text-slate-200 font-mono">2,192</strong></span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">NOMINAL</span>
          </div>
        </div>

        {/* Real-time Waveform Canvas/SVG */}
        <div className="relative h-14 w-full bg-[#030919] border border-cyan-950 rounded overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 480 54" preserveAspectRatio="none">
            <defs>
              <linearGradient id="downWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0, 119, 255, 0.4)" />
                <stop offset="100%" stopColor="rgba(0, 240, 255, 0.02)" />
              </linearGradient>
            </defs>
            <line x1="0" y1="27" x2="480" y2="27" stroke="rgba(0, 119, 255, 0.2)" strokeDasharray="4 4" />
            <polygon points={`0,54 ${downPoints} 480,54`} fill="url(#downWaveGrad)" />
            <polyline points={downPoints} fill="none" stroke="#00d8ff" strokeWidth="1.75" />
          </svg>
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_8px_#00f0ff] opacity-75"
            style={{ left: `${(phase * 16) % 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Database, Layers, CheckCircle2 } from 'lucide-react';

interface CoreStat {
  id: string;
  label: string;
  load: number;
  temp: number;
  freq: string;
}

const INITIAL_CORES: CoreStat[] = [
  { id: 'c1', label: 'CORE 01', load: 42, temp: 38, freq: '4.2 GHz' },
  { id: 'c2', label: 'CORE 02', load: 38, temp: 37, freq: '4.2 GHz' },
  { id: 'c3', label: 'CORE 03', load: 65, temp: 41, freq: '4.4 GHz' },
  { id: 'c4', label: 'CORE 04', load: 29, temp: 36, freq: '4.1 GHz' },
  { id: 'c5', label: 'CORE 05', load: 51, temp: 39, freq: '4.3 GHz' },
  { id: 'c6', label: 'CORE 06', load: 33, temp: 37, freq: '4.2 GHz' },
  { id: 'c7', label: 'CORE 07', load: 48, temp: 40, freq: '4.3 GHz' },
  { id: 'c8', label: 'CORE 08', load: 24, temp: 35, freq: '4.0 GHz' },
];

const SYSTEM_CHECKLIST = [
  { code: 'SYS_KERNEL_OK', label: 'Base Substrate Core', status: 'VERIFIED' },
  { code: 'OPTICAL_BUS_SYNC', label: 'Photonic Interconnect', status: 'LOCKED' },
  { code: 'MEM_PARITY_VERIFIED', label: 'DRAM Invariant Cache', status: 'STABLE' },
  { code: 'QUANTUM_ENTROPY_LOCKED', label: 'PRNG Seed Cryptography', status: 'OPTIMAL' },
  { code: 'SUB_ROUTINE_ONLINE', label: 'Neural Task Pipeline', status: 'ACTIVE' },
  { code: 'FIREWALL_STRICT', label: 'Egress Packet Invariants', status: 'ARMED' },
];

export const CpuCoreGrid: React.FC = () => {
  const [cores, setCores] = useState<CoreStat[]>(INITIAL_CORES);

  // Micro-fluctuations for living UI feel
  useEffect(() => {
    const timer = setInterval(() => {
      setCores(prev =>
        prev.map(c => ({
          ...c,
          load: Math.min(95, Math.max(15, Math.round(c.load + (Math.random() * 8 - 4)))),
        }))
      );
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-2 bg-[#030718]/75 border border-cyan-900/40 rounded-xl p-2.5 backdrop-blur-md">
      {/* 1. CPU CORE Statistics with tiny bar graphs */}
      <div className="p-2 bg-slate-950/70 border border-slate-800/80 rounded-lg">
        <div className="flex items-center justify-between text-xs font-mono text-cyan-300 mb-2 pb-1.5 border-b border-cyan-950">
          <div className="flex items-center gap-1.5 font-semibold">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>CPU CORE CLUSTER // x86-OCTA</span>
          </div>
          <span className="text-[11px] text-slate-400">LOAD AVG: 41.5%</span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {cores.map(core => (
            <div key={core.id} className="text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-slate-300 font-semibold">{core.label}</span>
                <span className="tabular-nums text-cyan-300">{core.load}%</span>
              </div>
              {/* Tiny Bar Graph */}
              <div className="w-full h-1.5 bg-slate-900 rounded-sm overflow-hidden flex items-center mt-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 rounded-sm"
                  style={{ width: `${core.load}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5">
                <span>{core.freq}</span>
                <span>{core.temp}°C</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. System Status Checklist */}
      <div className="p-2 bg-slate-950/70 border border-slate-800/80 rounded-lg">
        <div className="flex items-center justify-between text-xs font-mono text-cyan-300 mb-1.5 pb-1 border-b border-cyan-950">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SYSTEM INVARIANT CHECKLIST</span>
          </div>
          <span className="text-[10px] text-emerald-400">6/6 PASS</span>
        </div>

        <div className="space-y-0.5 font-mono text-[9px]">
          {SYSTEM_CHECKLIST.slice(0, 4).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-cyan-950/20 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 text-xs">✓</span>
                <span className="text-slate-200 font-semibold">{item.code}</span>
              </div>
              <span className="text-cyan-300 px-1 py-0.2 bg-cyan-950/60 border border-cyan-800/60 rounded text-[9px]">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Multi-Panel "DATA TRANSFER" Status Grid & Icon Cluster */}
      <div className="p-2 bg-slate-950/70 border border-slate-800/80 rounded-lg">
        <div className="flex items-center justify-between text-xs font-mono text-cyan-300 mb-1.5 pb-1 border-b border-cyan-950">
          <div className="flex items-center gap-1.5 font-semibold">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>DATA TRANSFER MATRIX</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>LINK SYNC</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
          <div className="p-1.5 bg-slate-900/80 border border-slate-800 rounded text-center">
            <div className="text-[9px] text-slate-400">CIPHER</div>
            <div className="text-[11px] font-bold text-cyan-200 mt-0.5">AES-256</div>
          </div>
          <div className="p-1.5 bg-slate-900/80 border border-slate-800 rounded text-center">
            <div className="text-[9px] text-slate-400">LOSS</div>
            <div className="text-[11px] font-bold text-emerald-400 mt-0.5 tabular-nums">0.00%</div>
          </div>
          <div className="p-1.5 bg-slate-900/80 border border-slate-800 rounded text-center">
            <div className="text-[9px] text-slate-400">RATE</div>
            <div className="text-[11px] font-bold text-cyan-200 mt-0.5 tabular-nums">1.84M</div>
          </div>
          <div className="p-1.5 bg-slate-900/80 border border-slate-800 rounded text-center">
            <div className="text-[9px] text-slate-400">HOPS</div>
            <div className="text-[11px] font-bold text-slate-200 mt-0.5 tabular-nums">3 NODES</div>
          </div>
        </div>
      </div>
    </div>
  );
};

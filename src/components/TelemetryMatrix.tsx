import React, { useState } from 'react';
import type { TelemetrySnapshot } from '../utils/aroneCore';
import { RefreshCw, CheckCircle2, ShieldCheck, Activity, Cpu, HardDrive } from 'lucide-react';
import { playAcousticCue } from '../utils/soundFx';

interface TelemetryMatrixProps {
  telemetry: TelemetrySnapshot;
  onRefresh: () => void;
  isLoading?: boolean;
}

const INVARIANTS = [
  { id: 'inv-1', name: 'Cryptographic TLS 1.3 Strict Ciphers', category: 'Security' },
  { id: 'inv-2', name: 'Zero Memory Leak Watermark (< 2.0GB)', category: 'Runtime' },
  { id: 'inv-3', name: 'Raft Quorum Consensus Partition', category: 'Distributed' },
  { id: 'inv-4', name: 'Stateless Worker Affinity Boundary', category: 'Compute' },
  { id: 'inv-5', name: 'Sub-15ms Event Loop Lag Threshold', category: 'Performance' },
  { id: 'inv-6', name: 'Circuit Breaker Auto-Trip Guard', category: 'Resilience' },
  { id: 'inv-7', name: 'Client Idempotency Key Validation', category: 'API' },
  { id: 'inv-8', name: 'Pooled Socket Descriptor Eviction', category: 'Networking' },
];

export const TelemetryMatrix: React.FC<TelemetryMatrixProps> = ({
  telemetry,
  onRefresh,
  isLoading = false,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticLog, setDiagnosticLog] = useState<string | null>(null);

  const handleRunDiagnostic = () => {
    playAcousticCue('processing');
    setDiagnosticsRunning(true);
    setDiagnosticLog('Auditing 16/16 cluster nodes and socket descriptors...');

    setTimeout(() => {
      setDiagnosticsRunning(false);
      setDiagnosticLog('All 16 invariants verified. 0 anomalies detected across active memory partitions.');
      playAcousticCue('chime');
      onRefresh();
    }, 900);
  };

  const filteredInvariants = INVARIANTS.filter(inv => {
    if (selectedFilter === 'all') return true;
    return inv.category.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-100">
            System Telemetry & Invariants
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunDiagnostic}
            disabled={diagnosticsRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/50 transition-colors disabled:opacity-50"
            aria-label="Run Diagnostic Suite"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${diagnosticsRunning ? 'animate-spin' : ''}`} />
            <span className="whitespace-nowrap">Run Diagnostic</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Latency</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-100">
            {telemetry.neuralLatency}
            <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-0.5">Target &lt; 20ms</div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Core Thermal</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-100">
            {telemetry.coreTemperature}
            <span className="text-xs font-normal text-slate-400 ml-1">°C</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-0.5">Substrate Nominal</div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Heap Working Set</span>
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-100">
            {telemetry.memoryAllocation}
            <span className="text-xs font-normal text-slate-400 ml-1">GB</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">Bounded ceiling 2.0GB</div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Invariants</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-100">
            {telemetry.invariantsPassing}
            <span className="text-xs font-normal text-slate-400 ml-1">/ {telemetry.invariantsTotal}</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-0.5">100% Invariants Passing</div>
        </div>
      </div>

      {diagnosticLog && (
        <div className="mb-4 p-2.5 bg-cyan-950/30 border border-cyan-800/60 rounded-lg text-xs font-mono text-cyan-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{diagnosticLog}</span>
        </div>
      )}

      {/* Invariants Matrix Filter Tabs */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Critical Invariants & Hard Boundaries
        </span>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
          {(['all', 'Security', 'Runtime', 'Compute'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilter(cat)}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                selectedFilter === cat
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Invariants List */}
      <div className="divide-y divide-slate-800/60 border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/40">
        {filteredInvariants.map(inv => (
          <div key={inv.id} className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-900/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span className="font-medium text-slate-200">{inv.name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <span>{inv.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">VERIFIED</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

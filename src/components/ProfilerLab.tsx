import React, { useState } from 'react';
import { Code2, Play, Copy, Check, Terminal, Cpu } from 'lucide-react';
import { playAcousticCue } from '../utils/soundFx';

const SAMPLE_PRESETS = [
  {
    name: 'Distributed Mutex Lease',
    lang: 'typescript',
    code: `// Distributed Mutex with Heartbeat Lease
export class DistributedLeaseManager {
  private activeLeases = new Map<string, number>();

  async acquire(key: string, ttlMs: number): Promise<boolean> {
    const expiresAt = Date.now() + ttlMs;
    if (this.activeLeases.has(key)) {
      if (this.activeLeases.get(key)! > Date.now()) {
        return false;
      }
    }
    this.activeLeases.set(key, expiresAt);
    return true;
  }
}`,
  },
  {
    name: 'LRU Cache with Leak Vector',
    lang: 'typescript',
    code: `// High-frequency cache without bounded eviction
export class UnboundedSessionCache {
  private cache = new Map<string, any>();
  private listeners: Function[] = [];

  store(key: string, data: any) {
    this.cache.set(key, data);
    this.listeners.push(() => console.log('Updated', key));
  }
}`,
  },
  {
    name: 'Async Batch Ingestion',
    lang: 'typescript',
    code: `// Unthrottled Promise.all batch processing
export async function processBatchItems(items: any[]) {
  return Promise.all(items.map(async (item) => {
    return await fetch('/api/process', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }));
}`,
  },
];

export const ProfilerLab: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [code, setCode] = useState(SAMPLE_PRESETS[0].code);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setCode(SAMPLE_PRESETS[idx].code);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    playAcousticCue('processing');
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/arone/analyze-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, targetLanguage: 'typescript' }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        playAcousticCue('affirmative');
      }
    } catch {
      setAnalysisResult('ARONE profiler: Execution timed out. Standby.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    playAcousticCue('affirmative');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-100">
            Systems Architecture & Code Profiler
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50"
            aria-label="Profile and optimize code"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${analyzing ? 'animate-pulse' : ''}`} />
            <span className="whitespace-nowrap">{analyzing ? 'Profiling...' : 'Profile & Optimize'}</span>
          </button>
        </div>
      </div>

      {/* Preset selection tabs */}
      <div className="my-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400">Presets:</span>
        {SAMPLE_PRESETS.map((preset, idx) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleSelectPreset(idx)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              selectedPreset === idx
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Code input textarea */}
      <div className="relative border border-slate-800 rounded-lg overflow-hidden bg-slate-950/80">
        <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Subroutine</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">TypeScript</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={7}
          className="w-full p-3 font-mono text-xs text-slate-200 bg-transparent resize-y focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
          placeholder="Paste code or system architecture specification here..."
          aria-label="Target code input for profiling"
        />
      </div>

      {/* Analysis Output */}
      {analysisResult && (
        <div className="mt-4 p-4 border border-cyan-800/40 bg-slate-950/90 rounded-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                ARONE Technical Optimization Report
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(analysisResult)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
              aria-label="Copy analysis report"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>
          <div className="prose prose-invert max-w-none text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );
};

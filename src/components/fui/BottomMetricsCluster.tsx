import React, { useState, useEffect } from 'react';
import { formatSegmentedTimestamp } from '../../utils/fuiData';
import { Zap, Clock, HardDrive } from 'lucide-react';

export const BottomMetricsCluster: React.FC = () => {
  const [timeData, setTimeData] = useState(() => formatSegmentedTimestamp());
  const [ramUsage, setRamUsage] = useState(27);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData(formatSegmentedTimestamp());
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Micro-fluctuations for RAM usage around 27%
  useEffect(() => {
    const ramTimer = setInterval(() => {
      setRamUsage(27 + (Math.random() > 0.7 ? 1 : 0));
    }, 4000);
    return () => clearInterval(ramTimer);
  }, []);

  // Gauge circumference math (radius = 34)
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const ramOffset = circumference - (ramUsage / 100) * circumference;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#030718]/90 border border-cyan-900/50 rounded-2xl p-2.5 backdrop-blur-md shadow-[0_0_25px_rgba(0,229,255,0.08)]">
      {/* 1. Circular Digital Clock Widget ("2:50 PM") */}
      <div className="flex items-center gap-3 p-2 bg-slate-950/80 border border-cyan-950/80 rounded-xl">
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Outer dial ring */}
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(0, 119, 255, 0.3)"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="1.5"
              strokeDasharray="3 6"
            />

            {/* 12 Hour Ticks */}
            {Array.from({ length: 12 }).map((_, i) => {
              const deg = (i * 360) / 12;
              const rad = (deg * Math.PI) / 180;
              const x1 = 50 + Math.cos(rad) * 35;
              const y1 = 50 + Math.sin(rad) * 35;
              const x2 = 50 + Math.cos(rad) * 39;
              const y2 = 50 + Math.sin(rad) * 39;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={i % 3 === 0 ? '#00f0ff' : 'rgba(0, 119, 255, 0.5)'}
                  strokeWidth={i % 3 === 0 ? 1.5 : 1}
                />
              );
            })}

            {/* Pulsing Seconds Indicator Dot */}
            <circle
              cx={50 + Math.cos((parseInt(timeData.secondsStr, 10) * 6 * Math.PI) / 180) * 36}
              cy={50 + Math.sin((parseInt(timeData.secondsStr, 10) * 6 * Math.PI) / 180) * 36}
              r="2.5"
              fill="#00f0ff"
              className="animate-pulse"
            />
          </svg>

          {/* Center Digital Clock Typography */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold font-mono tracking-tight text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
              {timeData.formatted12}
            </span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 leading-tight">
          <div className="text-cyan-300 font-semibold tracking-wider">CHRONO SYNC</div>
          <div className="text-slate-300 text-[11px] font-bold">{timeData.formatted12}</div>
          <div className="text-emerald-400 text-[9px] mt-0.5">NTP JITTER: 0.2ms · LOCKED</div>
        </div>
      </div>

      {/* 2. Distinct Circular Gauge ("RAM USAGE 27%") */}
      <div className="flex items-center gap-3 p-2 bg-slate-950/80 border border-cyan-950/80 rounded-xl">
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(0, 85, 255, 0.25)"
              strokeWidth="6"
            />
            {/* Active RAM 27% Cyan Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={ramOffset}
              strokeLinecap="round"
              className="transition-all duration-700 drop-shadow-[0_0_6px_#00f0ff]"
            />
          </svg>

          {/* Centered Typography: RAM USAGE 27% */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center rotate-0">
            <span className="text-sm font-extrabold font-mono tabular-nums text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
              {ramUsage}%
            </span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 leading-tight">
          <div className="text-cyan-300 font-semibold tracking-wider">RAM USAGE 27%</div>
          <div className="text-slate-300 text-[11px] font-bold">4.32 GB / 16.0 GB</div>
          <div className="text-emerald-400 text-[9px] mt-0.5">DRAM SUBSYSTEM NOMINAL</div>
        </div>
      </div>

      {/* 3. Larger, Clear, Segmented Digital Timestamp ("02:9...") */}
      <div className="flex flex-col justify-center p-2.5 bg-slate-950/90 border border-cyan-800/70 rounded-xl">
        <div className="text-[9px] font-mono text-cyan-400/90 tracking-widest uppercase flex items-center justify-between mb-0.5">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            SEGMENTED TIMESTAMP
          </span>
          <span className="text-slate-500">FRAME · {timeData.millisStr}</span>
        </div>
        {/* Large segmented digital timestamp e.g. 02:9... */}
        <div
          className="text-xl md:text-2xl font-black font-mono tracking-widest text-cyan-300 drop-shadow-[0_0_10px_rgba(0,240,255,0.7)] select-all truncate"
          style={{ letterSpacing: '0.14em' }}
        >
          {timeData.fuiTicker}
        </div>
        <div className="text-[9px] font-mono text-slate-400 mt-0.5 flex justify-between">
          <span>CHRONO_REF // 0x4E</span>
          <span className="text-cyan-400">ACTIVE TICK</span>
        </div>
      </div>
    </div>
  );
};

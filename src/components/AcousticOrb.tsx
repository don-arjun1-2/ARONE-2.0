import React, { useEffect, useRef } from 'react';
import type { CoreState } from '../utils/aroneCore';
import { Volume2, VolumeX, Mic } from 'lucide-react';

interface AcousticOrbProps {
  state: CoreState;
  isMuted: boolean;
  onToggleMute: () => void;
  onVoiceTrigger?: () => void;
  isListening?: boolean;
}

export const AcousticOrb: React.FC<AcousticOrbProps> = ({
  state,
  isMuted,
  onToggleMute,
  onVoiceTrigger,
  isListening = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // State-driven color parameters
      let primaryColor = 'rgba(0, 229, 255, '; // Cyan
      let secondaryColor = 'rgba(0, 119, 255, '; // Sapphire
      let waveAmplitude = 8;
      let rotationSpeed = 0.015;

      if (state === 'PROCESSING') {
        primaryColor = 'rgba(56, 189, 248, ';
        secondaryColor = 'rgba(99, 102, 241, ';
        waveAmplitude = 16;
        rotationSpeed = 0.04;
      } else if (state === 'SPEAKING') {
        primaryColor = 'rgba(34, 211, 238, ';
        secondaryColor = 'rgba(14, 165, 233, ';
        waveAmplitude = 22;
        rotationSpeed = 0.025;
      } else if (state === 'ALERT') {
        primaryColor = 'rgba(244, 63, 94, '; // Rose / warning
        secondaryColor = 'rgba(239, 68, 68, ';
        waveAmplitude = 18;
        rotationSpeed = 0.035;
      } else if (isListening) {
        primaryColor = 'rgba(52, 211, 153, '; // Emerald
        secondaryColor = 'rgba(16, 185, 129, ';
        waveAmplitude = 14;
        rotationSpeed = 0.02;
      }

      angle += rotationSpeed;

      // 1. Outer Reticle Ring (dashed)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 88, 0, Math.PI * 2);
      ctx.strokeStyle = primaryColor + '0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Segmented Rotating Arc Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, 76, (i * Math.PI) / 2 + 0.15, ((i + 1) * Math.PI) / 2 - 0.15);
        ctx.strokeStyle = primaryColor + '0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      // 3. Counter-rotating inner ring with tick marks
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-angle * 1.4);
      for (let i = 0; i < 24; i++) {
        const rad = (i * Math.PI * 2) / 24;
        const x1 = Math.cos(rad) * 62;
        const y1 = Math.sin(rad) * 62;
        const x2 = Math.cos(rad) * 66;
        const y2 = Math.sin(rad) * 66;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = i % 6 === 0 ? primaryColor + '0.8)' : secondaryColor + '0.3)';
        ctx.lineWidth = i % 6 === 0 ? 1.5 : 1;
        ctx.stroke();
      }
      ctx.restore();

      // 4. Acoustic Sine Waveform Nodes
      const pointCount = 64;
      const baseRadius = 48;
      ctx.beginPath();
      for (let i = 0; i <= pointCount; i++) {
        const theta = (i / pointCount) * Math.PI * 2;
        const freqOffset = Math.sin(theta * 6 + angle * 4) * waveAmplitude;
        const currentR = baseRadius + freqOffset;
        const x = centerX + Math.cos(theta) * currentR;
        const y = centerY + Math.sin(theta) * currentR;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = primaryColor + '0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Subtle center radial core glow
      const grad = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, 38);
      grad.addColorStop(0, primaryColor + '0.35)');
      grad.addColorStop(0.7, secondaryColor + '0.12)');
      grad.addColorStop(1, 'rgba(5, 8, 17, 0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Core point
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = primaryColor + '1)';
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, isListening]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 border border-slate-800/80 rounded-xl relative overflow-hidden backdrop-blur-sm">
      {/* Background gridlines for HUD feel */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 229, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

      {/* Canvas Orb */}
      <div className="relative cursor-pointer group" onClick={onVoiceTrigger} title="Click to activate voice directive">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="relative z-10 transition-transform duration-300 group-hover:scale-105"
          aria-label="ARONE Acoustic Core Visualizer"
        />

        {/* Status ring pulsing */}
        <div className="absolute inset-4 rounded-full border border-cyan-500/20 animate-ping opacity-25 pointer-events-none" />
      </div>

      {/* State label */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-semibold">
          {state === 'PROCESSING' && 'Calculating Directive'}
          {state === 'SPEAKING' && 'Synthesizing Audio Output'}
          {state === 'LISTENING' && 'Capturing Voice Directive'}
          {state === 'ALERT' && 'Thermal Caution'}
          {state === 'IDLE' && 'Core Nominal // Standby'}
        </span>
      </div>

      <div className="mt-1 text-[11px] text-slate-400 font-mono">
        Executive Neural Core · v3.8.0
      </div>

      {/* Audio controls */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            isMuted
              ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50'
          }`}
          aria-label={isMuted ? 'Unmute ARONE Voice' : 'Mute ARONE Voice'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="whitespace-nowrap">{isMuted ? 'Muted' : 'Acoustics Active'}</span>
        </button>

        {onVoiceTrigger && (
          <button
            type="button"
            onClick={onVoiceTrigger}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isListening
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 animate-pulse'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200'
            }`}
            aria-label="Voice Directive Dictation"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{isListening ? 'Listening...' : 'Voice Directive'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { playAcousticCue } from '../../utils/soundFx';

interface HolographicRingAssemblyProps {
  onInteract?: () => void;
}

export const HolographicRingAssembly: React.FC<HolographicRingAssemblyProps> = ({ onInteract }) => {
  const [rotation, setRotation] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let animId: number;
    const animate = () => {
      setRotation(prev => (prev + 0.3) % 360);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleClick = () => {
    setPulse(true);
    playAcousticCue('chime');
    onInteract?.();
    setTimeout(() => setPulse(false), 500);
  };

  return (
    <div
      onClick={handleClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      title="Holographic Core Ring Assembly - Click to trigger optical calibration"
      aria-label="Dominant Holographic Ring Assembly"
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
          pulse ? 'opacity-80 scale-105' : 'opacity-25'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(0, 85, 255, 0.08) 60%, transparent 80%)',
        }}
      />

      {/* SVG Multi-Layered Assembly */}
      <svg
        width="270"
        height="270"
        viewBox="0 0 360 360"
        className="w-[250px] h-[250px] lg:w-[270px] lg:h-[270px] overflow-visible"
      >
        <defs>
          <linearGradient id="cyanBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0055ff" />
          </linearGradient>

          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Outermost Static Graduation Ring */}
        <circle
          cx="180"
          cy="180"
          r="170"
          fill="none"
          stroke="rgba(0, 119, 255, 0.25)"
          strokeWidth="1"
        />

        {/* Outer 72-tick graduation marks */}
        {Array.from({ length: 72 }).map((_, i) => {
          const angle = (i * 360) / 72;
          const rad = (angle * Math.PI) / 180;
          const r1 = i % 6 === 0 ? 162 : 166;
          const r2 = 170;
          const x1 = 180 + Math.cos(rad) * r1;
          const y1 = 180 + Math.sin(rad) * r1;
          const x2 = 180 + Math.cos(rad) * r2;
          const y2 = 180 + Math.sin(rad) * r2;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 6 === 0 ? '#00f0ff' : 'rgba(0, 119, 255, 0.4)'}
              strokeWidth={i % 6 === 0 ? 1.5 : 1}
            />
          );
        })}

        {/* Perimeter Intricate Text Readouts */}
        <text x="180" y="24" textAnchor="middle" fill="#00f0ff" fontSize="8" fontFamily="monospace" letterSpacing="2">
          AZIMUTH 000° // APERTURE ACTIVE
        </text>
        <text x="348" y="183" textAnchor="end" fill="#00f0ff" fontSize="8" fontFamily="monospace" letterSpacing="1">
          FLUX: 94.2%
        </text>
        <text x="180" y="348" textAnchor="middle" fill="#00f0ff" fontSize="8" fontFamily="monospace" letterSpacing="2">
          RAD-88 // OPTICAL MATRIX
        </text>
        <text x="12" y="183" textAnchor="start" fill="#00f0ff" fontSize="8" fontFamily="monospace" letterSpacing="1">
          SYS_LOCK: 0x7E
        </text>

        {/* Perimeter Circular Gauge 1: SIGMA-4 (Top Right) */}
        <g transform="translate(290, 65)">
          <circle cx="0" cy="0" r="16" fill="rgba(3, 9, 25, 0.8)" stroke="#0055ff" strokeWidth="1" />
          <path
            d="M 0 -13 A 13 13 0 1 1 -11 7"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text x="0" y="3" textAnchor="middle" fill="#00f0ff" fontSize="7" fontFamily="monospace" fontWeight="bold">
            86%
          </text>
          <text x="0" y="25" textAnchor="middle" fill="rgba(0, 240, 255, 0.7)" fontSize="6" fontFamily="monospace">
            SIGMA-4
          </text>
        </g>

        {/* Perimeter Circular Gauge 2: ALPHA-1 (Bottom Left) */}
        <g transform="translate(70, 295)">
          <circle cx="0" cy="0" r="16" fill="rgba(3, 9, 25, 0.8)" stroke="#0055ff" strokeWidth="1" />
          <path
            d="M 0 -13 A 13 13 0 0 1 12 5"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text x="0" y="3" textAnchor="middle" fill="#00f0ff" fontSize="7" fontFamily="monospace" fontWeight="bold">
            52%
          </text>
          <text x="0" y="25" textAnchor="middle" fill="rgba(0, 240, 255, 0.7)" fontSize="6" fontFamily="monospace">
            ALPHA-1
          </text>
        </g>

        {/* Perimeter Square Status Icons */}
        {[
          { x: 330, y: 120, label: 'TRK' },
          { x: 330, y: 240, label: 'VEC' },
          { x: 30, y: 120, label: 'PWR' },
          { x: 30, y: 240, label: 'MOD' },
        ].map((icon, idx) => (
          <g key={idx} transform={`translate(${icon.x}, ${icon.y})`}>
            <rect x="-8" y="-8" width="16" height="16" fill="rgba(3, 9, 25, 0.8)" stroke="#00f0ff" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#00f0ff" fontSize="6" fontFamily="monospace">
              {icon.label}
            </text>
          </g>
        ))}

        {/* 2. Rotating Segmented Outer Ring */}
        <g transform={`rotate(${rotation}, 180, 180)`}>
          <circle
            cx="180"
            cy="180"
            r="145"
            fill="none"
            stroke="url(#cyanBlueGrad)"
            strokeWidth="3"
            strokeDasharray="40 15 20 15 80 20"
            filter="url(#cyanGlow)"
          />
          {/* Cyan Chevron Markers */}
          {[0, 90, 180, 270].map(deg => (
            <g key={deg} transform={`rotate(${deg}, 180, 180)`}>
              <polygon points="180,32 176,38 184,38" fill="#00f0ff" />
            </g>
          ))}
        </g>

        {/* 3. Counter-Rotating Gear Ring */}
        <g transform={`rotate(${-rotation * 1.5}, 180, 180)`}>
          <circle
            cx="180"
            cy="180"
            r="125"
            fill="none"
            stroke="#0055ff"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const deg = (i * 360) / 12;
            return (
              <g key={i} transform={`rotate(${deg}, 180, 180)`}>
                <rect x="178" y="52" width="4" height="6" fill="#00f0ff" opacity="0.8" />
              </g>
            );
          })}
        </g>

        {/* 4. Mid Segmented Gauge Track */}
        <circle
          cx="180"
          cy="180"
          r="105"
          fill="none"
          stroke="rgba(0, 240, 255, 0.3)"
          strokeWidth="6"
          strokeDasharray="4 8"
        />

        {/* 5. Center Complex Lens Assembly */}
        <g className="transition-transform duration-300 group-hover:scale-105" style={{ transformOrigin: '180px 180px' }}>
          {/* Lens Barrel Reticle */}
          <circle cx="180" cy="180" r="75" fill="rgba(2, 6, 18, 0.85)" stroke="#00f0ff" strokeWidth="1.5" />
          <circle cx="180" cy="180" r="62" fill="none" stroke="#0055ff" strokeWidth="1" strokeDasharray="8 6" />

          {/* Rotating Iris Petals */}
          <g transform={`rotate(${rotation * 2}, 180, 180)`}>
            {Array.from({ length: 6 }).map((_, i) => {
              const deg = (i * 360) / 6;
              return (
                <path
                  key={i}
                  d="M 180 118 Q 195 145 180 156 Q 165 145 180 118"
                  fill="rgba(0, 240, 255, 0.25)"
                  stroke="#00f0ff"
                  strokeWidth="1"
                  transform={`rotate(${deg}, 180, 180)`}
                />
              );
            })}
          </g>

          {/* Lens Focal Aperture Rings */}
          <circle cx="180" cy="180" r="42" fill="none" stroke="#00f0ff" strokeWidth="2" />
          <circle cx="180" cy="180" r="28" fill="rgba(0, 85, 255, 0.3)" stroke="#00f0ff" strokeWidth="1" />

          {/* Crosshairs */}
          <line x1="140" y1="180" x2="168" y2="180" stroke="#00f0ff" strokeWidth="1.5" />
          <line x1="192" y1="180" x2="220" y2="180" stroke="#00f0ff" strokeWidth="1.5" />
          <line x1="180" y1="140" x2="180" y2="168" stroke="#00f0ff" strokeWidth="1.5" />
          <line x1="180" y1="192" x2="180" y2="220" stroke="#00f0ff" strokeWidth="1.5" />

          {/* Central Pulsing Holographic Core Point */}
          <circle
            cx="180"
            cy="180"
            r={pulse ? 12 : 7}
            fill="#00f0ff"
            filter="url(#cyanGlow)"
            className="transition-all duration-300 animate-pulse"
          />
        </g>
      </svg>
    </div>
  );
};

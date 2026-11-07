import React, { useEffect, useRef } from 'react';
import { generateSphereWireframe, project3DTo2D } from '../../utils/fuiData';

interface WireframeGlobeProps {
  size?: number;
}

export const WireframeGlobe: React.FC<WireframeGlobeProps> = ({ size = 110 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const wireframe = generateSphereWireframe(7, 10);
    let angleY = 0;
    const angleX = 0.28; // Tilted axis
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = size * 0.38;

      angleY += 0.008;

      // Outer targeting frame
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
      ctx.stroke();

      // Dashed outer ring
      ctx.strokeStyle = 'rgba(0, 119, 255, 0.4)';
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 13, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw 3D globe wireframe lines
      ctx.lineWidth = 1;
      for (const line of wireframe) {
        let first = true;
        ctx.beginPath();
        for (const pt of line) {
          const proj = project3DTo2D(pt, angleY, angleX, radius, centerX, centerY);
          if (proj.visible) {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
            if (first) {
              ctx.moveTo(proj.x, proj.y);
              first = false;
            } else {
              ctx.lineTo(proj.x, proj.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // Orbital satellite ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angleY * 1.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius + 10, (radius + 10) * 0.35, Math.PI / 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Satellite blip
      const satAngle = angleY * 2.5;
      const satX = Math.cos(satAngle) * (radius + 10);
      const satY = Math.sin(satAngle) * (radius + 10) * 0.35;
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(satX, satY, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Center crosshair
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 4, centerY);
      ctx.lineTo(centerX + 4, centerY);
      ctx.moveTo(centerX, centerY - 4);
      ctx.lineTo(centerX, centerY + 4);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [size]);

  return (
    <div className="flex items-center gap-3 bg-[#030919]/60 border border-cyan-900/40 rounded-lg p-2.5 backdrop-blur-md">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="block"
          aria-label="3D Wireframe Planetary Globe"
        />
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
      </div>

      <div className="text-[11px] font-mono text-cyan-300/80 leading-tight">
        <div className="font-bold text-cyan-200 tracking-wider">GEO-SYNC // ORBIT</div>
        <div className="text-slate-400 text-[10px] mt-0.5">37.7749° N, 122.4194° W</div>
        <div className="text-emerald-400 text-[10px] mt-0.5">TELEMETRY LOCK · ACTIVE</div>
      </div>
    </div>
  );
};

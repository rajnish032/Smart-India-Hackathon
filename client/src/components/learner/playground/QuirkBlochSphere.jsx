"use client";

import React from 'react';

/**
 * QuirkBlochSphere
 * Vector-accurate projection of the Bloch Sphere showing state orientation (x, y, z)
 */
export default function QuirkBlochSphere({ vector = { x: 0, y: 0, z: 1, length: 1 }, size = 110, qubitIndex = 0 }) {
  const { x = 0, y = 0, z = 1, length = 1 } = vector;
  const radius = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;

  // Orthographic projection with slight 3D tilt
  // Isometric perspective: X goes down-left, Y goes right, Z goes up
  const tiltX = -0.5 * x + 0.866 * y;
  const tiltY = -z + 0.288 * x + 0.166 * y;

  const tipX = cx + radius * Math.min(1, Math.max(-1, tiltX * length));
  const tipY = cy + radius * Math.min(1, Math.max(-1, tiltY * length));

  // Phase color on HSV wheel
  const phase = Math.atan2(y, x);
  const hue = ((phase * 180 / Math.PI) + 360) % 360;

  return (
    <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
      <div className="flex items-center justify-between w-full px-1 text-[10px] font-mono">
        <span className="font-bold text-cyan-400">q[{qubitIndex}]</span>
        <span className="text-[var(--color-muted)]">|r| = {length.toFixed(2)}</span>
      </div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            {/* Radial glow for sphere */}
            <radialGradient id={`bloch-glow-${qubitIndex}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#0f172a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </radialGradient>
            {/* Arrow marker */}
            <marker
              id={`arrow-${qubitIndex}`}
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Sphere Body */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill={`url(#bloch-glow-${qubitIndex})`}
            stroke="var(--color-border)"
            strokeWidth="1.5"
            strokeDasharray="none"
          />

          {/* Equator Ellipse */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={radius}
            ry={radius * 0.35}
            fill="none"
            stroke="rgba(148, 163, 184, 0.3)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Z Axis Line (Vertical) */}
          <line
            x1={cx}
            y1={cy - radius}
            x2={cx}
            y2={cy + radius}
            stroke="rgba(148, 163, 184, 0.4)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* X Axis Line (Tilted) */}
          <line
            x1={cx - radius * 0.7}
            y1={cy + radius * 0.35}
            x2={cx + radius * 0.7}
            y2={cy - radius * 0.35}
            stroke="rgba(148, 163, 184, 0.3)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Basis Labels */}
          <text x={cx} y={cy - radius - 3} textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">|0⟩</text>
          <text x={cx} y={cy + radius + 10} textAnchor="middle" fill="#f43f5e" fontSize="9" fontWeight="bold" fontFamily="monospace">|1⟩</text>
          <text x={cx + radius + 4} y={cy + 3} textAnchor="start" fill="#94a3b8" fontSize="8" fontFamily="monospace">+Y</text>
          <text x={cx - radius * 0.7 - 5} y={cy + radius * 0.35 + 8} textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">+X</text>

          {/* Center Origin Dot */}
          <circle cx={cx} cy={cy} r="2" fill="#64748b" />

          {/* Statevector Vector Arrow */}
          <line
            x1={cx}
            y1={cy}
            x2={tipX}
            y2={tipY}
            stroke={`hsl(${hue}, 85%, 60%)`}
            strokeWidth="2.5"
            strokeLinecap="round"
            markerEnd={`url(#arrow-${qubitIndex})`}
          />

          {/* Endpoint Tip Glow */}
          <circle
            cx={tipX}
            cy={tipY}
            r="3.5"
            fill={`hsl(${hue}, 90%, 65%)`}
            stroke="#ffffff"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Vector Coordinates Breakdown */}
      <div className="grid grid-cols-3 gap-1 w-full text-[9px] font-mono text-center pt-0.5 border-t border-[var(--color-border)]">
        <span className="text-cyan-400">X: {x.toFixed(2)}</span>
        <span className="text-violet-400">Y: {y.toFixed(2)}</span>
        <span className="text-emerald-400">Z: {z.toFixed(2)}</span>
      </div>
    </div>
  );
}

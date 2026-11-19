'use client';

import React from 'react';
import { GanttSegment } from '@/types/cpu-scheduling';

interface GanttChartProps {
  segments: GanttSegment[];
  currentTime?: number;
  totalTime: number;
  processColors?: Record<string, string>;
}

const DEFAULT_COLORS: Record<string, string> = {
  P1: '#38bdf8', // sky
  P2: '#9cf944', // lime
  P3: '#fbbf24', // amber
  P4: '#f43f5e', // rose
  P5: '#a855f7', // purple
  P6: '#34d399', // emerald
  IDLE: '#1e2433', // dark slate
};

export function GanttChart({
  segments,
  currentTime,
  totalTime,
  processColors = {},
}: GanttChartProps) {
  if (segments.length === 0 || totalTime === 0) {
    return (
      <div className="flex h-28 items-center justify-center rounded border border-[#1e2433] bg-[#0c0e14] text-xs font-mono text-slate-500">
        No execution timeline available. Add processes and run simulation.
      </div>
    );
  }

  // Calculate unique timestamps along the timeline for axis ticks
  const timeMarkers = Array.from(
    new Set([0, ...segments.map((s) => s.startTime), ...segments.map((s) => s.endTime)])
  ).sort((a, b) => a - b);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#9cf944]"></span>
          EXECUTION GANTT TIMELINE
        </span>
        <span className="text-[11px] text-slate-500">
          Total Duration: <strong className="text-white">{totalTime} ms</strong>
        </span>
      </div>

      <div className="relative overflow-x-auto rounded border border-[#1e2433] bg-[#0c0e14] p-4">
        {/* SVG Gantt Chart */}
        <div className="min-w-[600px] space-y-1">
          <div className="flex h-12 w-full rounded overflow-hidden border border-[#232a3b] bg-[#10131a]">
            {segments.map((seg, idx) => {
              const duration = seg.endTime - seg.startTime;
              const widthPct = (duration / totalTime) * 100;
              const isIdle = seg.processId === 'IDLE';
              const color = processColors[seg.processId] || DEFAULT_COLORS[seg.processId] || '#60a5fa';

              const isActive =
                currentTime !== undefined &&
                currentTime >= seg.startTime &&
                currentTime < seg.endTime;

              return (
                <div
                  key={idx}
                  style={{ width: `${widthPct}%` }}
                  className={`relative flex h-full items-center justify-center border-r border-[#0c0e14] transition-all text-xs font-mono font-bold select-none ${
                    isIdle
                      ? 'bg-[#151922] text-slate-500 pattern-diagonal-lines'
                      : 'text-slate-950 shadow-inner'
                  } ${isActive ? 'ring-2 ring-white ring-inset' : ''}`}
                >
                  {!isIdle && (
                    <div
                      className="absolute inset-0 opacity-90"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center">
                    <span className={isIdle ? 'text-slate-400 font-normal text-[11px]' : 'text-slate-900 font-bold'}>
                      {seg.processId}
                    </span>
                    <span className={`text-[9px] ${isIdle ? 'text-slate-400' : 'text-slate-800'}`}>
                      {duration}ms
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time axis ticks */}
          <div className="relative h-6 w-full text-[10px] font-mono text-slate-400">
            {timeMarkers.map((time, idx) => {
              const posPct = (time / totalTime) * 100;
              return (
                <div
                  key={idx}
                  className="absolute -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${posPct}%` }}
                >
                  <div className="h-1.5 w-[1px] bg-slate-600 mb-0.5"></div>
                  <span>{time}</span>
                </div>
              );
            })}
          </div>

          {/* Active playhead indicator */}
          {currentTime !== undefined && currentTime <= totalTime && (
            <div
              className="absolute top-4 bottom-7 w-[2px] bg-white shadow-[0_0_8px_#ffffff] transition-all duration-100 pointer-events-none z-20"
              style={{
                left: `calc(1rem + ${(currentTime / totalTime) * 100}% * (100% - 2rem) / 100)`,
              }}
            >
              <div className="absolute -top-1 -left-1.5 h-3 w-3 rounded-full bg-white shadow-md"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

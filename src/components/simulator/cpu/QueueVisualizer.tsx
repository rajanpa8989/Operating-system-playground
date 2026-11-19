'use client';

import React from 'react';
import { Cpu, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface QueueVisualizerProps {
  runningProcessId: string | null;
  readyQueue: string[];
  completedProcessIds: string[];
  remainingBurstTimes: Record<string, number>;
  currentTime: number;
  eventDescription: string;
  processColors?: Record<string, string>;
}

const DEFAULT_COLORS: Record<string, string> = {
  P1: '#38bdf8',
  P2: '#9cf944',
  P3: '#fbbf24',
  P4: '#f43f5e',
  P5: '#a855f7',
  P6: '#34d399',
};

export function QueueVisualizer({
  runningProcessId,
  readyQueue,
  completedProcessIds,
  remainingBurstTimes,
  currentTime,
  eventDescription,
  processColors = {},
}: QueueVisualizerProps) {
  return (
    <div className="space-y-4">
      {/* Event banner */}
      <div className="rounded border border-[#1e2433] bg-[#0d1017] p-3 text-xs font-mono text-slate-300 flex items-start gap-2.5">
        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1b251c] text-[#9cf944] border border-[#2d3f2e]">
          <span className="text-[10px]">i</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold">[t={currentTime}ms] Kernel Trace: </span>
          <span className="text-white">{eventDescription || 'Simulation initialized.'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Ready Queue */}
        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              READY QUEUE
            </span>
            <span className="rounded bg-[#161a24] px-1.5 py-0.2 text-[10px] text-slate-400">
              {readyQueue.length} waiting
            </span>
          </div>

          <div className="flex min-h-[58px] items-center gap-1.5 overflow-x-auto rounded border border-[#1e2433] bg-[#10131a] p-2">
            {readyQueue.length === 0 ? (
              <span className="text-[11px] font-mono text-slate-400 italic">Queue is empty</span>
            ) : (
              readyQueue.map((pid, idx) => {
                const color = processColors[pid] || DEFAULT_COLORS[pid] || '#60a5fa';
                const rem = remainingBurstTimes[pid] ?? 0;
                return (
                  <div
                    key={pid}
                    className="flex shrink-0 items-center gap-1 rounded border border-[#232a3b] bg-[#161b26] px-2 py-1 text-xs font-mono text-white shadow-sm"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-bold">{pid}</span>
                    <span className="text-[10px] text-slate-400">({rem}ms)</span>
                    {idx < readyQueue.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-slate-400 ml-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Running CPU Core */}
        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <Cpu className="h-3.5 w-3.5 text-[#9cf944]" />
              CPU EXECUTION CORE
            </span>
            <span
              className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                runningProcessId
                  ? 'border border-[#2d402e] bg-[#142215] text-[#9cf944]'
                  : 'border border-[#232a3b] bg-[#161a24] text-slate-400'
              }`}
            >
              {runningProcessId ? 'DISPATCHED' : 'IDLE'}
            </span>
          </div>

          <div className="flex min-h-[58px] items-center justify-center rounded border border-[#1e2433] bg-[#10131a] p-2">
            {runningProcessId ? (
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded border border-white/20 text-sm font-mono font-bold text-slate-950 shadow-md animate-pulse"
                  style={{
                    backgroundColor:
                      processColors[runningProcessId] ||
                      DEFAULT_COLORS[runningProcessId] ||
                      '#9cf944',
                  }}
                >
                  {runningProcessId}
                </div>
                <div className="text-xs font-mono">
                  <div className="text-white font-semibold">Executing on Core 0</div>
                  <div className="text-slate-400 text-[11px]">
                    Remaining Burst: <strong className="text-[#9cf944]">{remainingBurstTimes[runningProcessId] ?? 0} ms</strong>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-[11px] font-mono text-slate-400 italic">
                CPU Core is currently IDLE
              </span>
            )}
          </div>
        </div>

        {/* Completed Processes */}
        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              TERMINATED PROCESSES
            </span>
            <span className="rounded bg-[#161a24] px-1.5 py-0.2 text-[10px] text-slate-400">
              {completedProcessIds.length} done
            </span>
          </div>

          <div className="flex min-h-[58px] items-center gap-1.5 overflow-x-auto rounded border border-[#1e2433] bg-[#10131a] p-2">
            {completedProcessIds.length === 0 ? (
              <span className="text-[11px] font-mono text-slate-400 italic">No terminated processes yet</span>
            ) : (
              completedProcessIds.map((pid) => (
                <span
                  key={pid}
                  className="rounded border border-[#232a3b] bg-[#141822] px-2 py-1 text-xs font-mono font-medium text-slate-300"
                >
                  {pid} ✓
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

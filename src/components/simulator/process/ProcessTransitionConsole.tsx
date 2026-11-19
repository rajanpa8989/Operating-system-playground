'use client';

import React from 'react';
import { ProcessControlBlock, ProcessTransitionEvent } from '@/types/process';
import { Play, Pause, Zap, ArrowRight, CornerDownRight, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

interface ProcessTransitionConsoleProps {
  selectedPcb: ProcessControlBlock | null;
  currentRunningPid: string | null;
  onTriggerEvent: (event: ProcessTransitionEvent, ioReason?: string) => void;
  onSpawnProcess: () => void;
  lastLog: { type: 'success' | 'error'; message: string; osAction: string } | null;
}

export function ProcessTransitionConsole({
  selectedPcb,
  currentRunningPid,
  onTriggerEvent,
  onSpawnProcess,
  lastLog,
}: ProcessTransitionConsoleProps) {
  const currentState = selectedPcb?.state;

  return (
    <div className="space-y-4 rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2433] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white font-sans">
            Kernel Transition Console
          </h3>
          <p className="text-[11px] text-slate-400">
            Dispatch scheduling events, simulate interrupts, and observe context switching.
          </p>
        </div>

        <button
          onClick={onSpawnProcess}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded border border-[#232a3b] bg-[#141822] px-2.5 py-1 text-slate-200 hover:text-white transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-[#9cf944]" />
          <span>Spawn New Process</span>
        </button>
      </div>

      {/* Action Buttons for Selected Process */}
      {selectedPcb ? (
        <div className="space-y-2">
          <div className="text-[11px] text-slate-400">
            Target Process: <strong className="text-white">{selectedPcb.pid}</strong> | State:{' '}
            <strong className="text-sky-400">{selectedPcb.state}</strong>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <button
              onClick={() => onTriggerEvent('ADMIT')}
              disabled={currentState !== 'NEW'}
              className="flex flex-col items-center justify-center rounded border border-[#232a3b] bg-[#121620] p-2 hover:border-[#9cf944] hover:bg-[#152016] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="font-bold text-white">ADMIT</span>
              <span className="text-[9px] text-slate-400">NEW → READY</span>
            </button>

            <button
              onClick={() => onTriggerEvent('DISPATCH')}
              disabled={currentState !== 'READY' || (currentRunningPid !== null && currentRunningPid !== selectedPcb.pid)}
              className="flex flex-col items-center justify-center rounded border border-[#2d402e] bg-[#142215] p-2 text-[#9cf944] hover:bg-[#1a2d1c] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="font-bold">DISPATCH</span>
              <span className="text-[9px] text-slate-400">READY → RUNNING</span>
            </button>

            <button
              onClick={() => onTriggerEvent('TIMER_INTERRUPT')}
              disabled={currentState !== 'RUNNING'}
              className="flex flex-col items-center justify-center rounded border border-[#232a3b] bg-[#121620] p-2 hover:border-amber-400 hover:bg-amber-950/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="font-bold text-amber-400">TIMER INTR</span>
              <span className="text-[9px] text-slate-400">RUNNING → READY</span>
            </button>

            <button
              onClick={() => onTriggerEvent('IO_REQUEST', 'Disk Read (sys_read)')}
              disabled={currentState !== 'RUNNING'}
              className="flex flex-col items-center justify-center rounded border border-[#232a3b] bg-[#121620] p-2 hover:border-sky-400 hover:bg-sky-950/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="font-bold text-sky-400">I/O WAIT</span>
              <span className="text-[9px] text-slate-400">RUNNING → WAITING</span>
            </button>

            <button
              onClick={() => onTriggerEvent('IO_COMPLETION')}
              disabled={currentState !== 'WAITING'}
              className="flex flex-col items-center justify-center rounded border border-[#232a3b] bg-[#121620] p-2 hover:border-emerald-400 hover:bg-emerald-950/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="font-bold text-emerald-400">I/O COMPLETE</span>
              <span className="text-[9px] text-slate-400">WAITING → READY</span>
            </button>

            <button
              onClick={() => onTriggerEvent('EXIT')}
              disabled={currentState !== 'RUNNING'}
              className="flex flex-col items-center justify-center rounded border border-rose-900/40 bg-rose-950/20 p-2 text-rose-400 hover:bg-rose-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="font-bold">EXIT</span>
              <span className="text-[9px] text-slate-400">RUNNING → TERMINATED</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="py-2 text-slate-500 italic">
          Select a process token above to activate transition controls.
        </div>
      )}

      {/* Kernel Trace Log */}
      {lastLog && (
        <div
          className={`rounded border p-3 text-xs space-y-1 ${
            lastLog.type === 'success'
              ? 'border-[#2d402e] bg-[#121c13] text-[#9cf944]'
              : 'border-rose-900/60 bg-rose-950/20 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold">
            {lastLog.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{lastLog.message}</span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            <strong>OS Hardware / Kernel Action: </strong>
            {lastLog.osAction}
          </div>
        </div>
      )}
    </div>
  );
}

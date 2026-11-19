'use client';

import React from 'react';
import { ProcessControlBlock } from '@/types/process';
import { Terminal, Shield, HardDrive, Cpu } from 'lucide-react';

interface PCBInspectorProps {
  pcb: ProcessControlBlock | null;
}

export function PCBInspector({ pcb }: PCBInspectorProps) {
  if (!pcb) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono text-slate-500">
        Select an active process token from the state machine to inspect its Process Control Block (PCB).
      </div>
    );
  }

  const stateColors: Record<string, string> = {
    NEW: 'text-slate-400 bg-slate-900 border-slate-700',
    READY: 'text-sky-400 bg-sky-950/40 border-sky-800',
    RUNNING: 'text-[#9cf944] bg-[#142215] border-[#2d402e]',
    WAITING: 'text-amber-400 bg-amber-950/40 border-amber-800',
    TERMINATED: 'text-rose-400 bg-rose-950/40 border-rose-800',
  };

  return (
    <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono space-y-3">
      {/* Header with PID & State */}
      <div className="flex items-center justify-between border-b border-[#1e2433] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded border border-[#232a3b] bg-[#141822] text-[#9cf944]">
            <Terminal className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">{pcb.pid}</span>
            <span className="text-slate-400 text-[11px] ml-1.5 font-sans">({pcb.name})</span>
          </div>
        </div>

        <span
          className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
            stateColors[pcb.state] || 'text-slate-400'
          }`}
        >
          {pcb.state}
        </span>
      </div>

      {/* Primary Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div className="rounded border border-[#1e2433] bg-[#10131a] p-2">
          <span className="text-[10px] text-slate-400 block uppercase">Priority</span>
          <span className="font-bold text-white">{pcb.priority}</span>
        </div>
        <div className="rounded border border-[#1e2433] bg-[#10131a] p-2">
          <span className="text-[10px] text-slate-400 block uppercase">Program Counter (PC)</span>
          <span className="font-bold text-[#9cf944]">
            0x{pcb.programCounter.toString(16).toUpperCase().padStart(8, '0')}
          </span>
        </div>
        <div className="rounded border border-[#1e2433] bg-[#10131a] p-2">
          <span className="text-[10px] text-slate-400 block uppercase">CPU Time Used</span>
          <span className="font-bold text-sky-400">{pcb.cpuTimeUsed} ticks</span>
        </div>
        <div className="rounded border border-[#1e2433] bg-[#10131a] p-2">
          <span className="text-[10px] text-slate-400 block uppercase">Memory Limit</span>
          <span className="font-bold text-amber-400">
            0x{pcb.memoryLimit.base.toString(16)} - 0x
            {(pcb.memoryLimit.base + pcb.memoryLimit.limit).toString(16)}
          </span>
        </div>
      </div>

      {/* CPU Hardware Registers */}
      <div className="rounded border border-[#1e2433] bg-[#10131a] p-3 space-y-1.5">
        <span className="text-[10px] uppercase text-slate-400 font-semibold block">
          Saved CPU Register Context:
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-[11px]">
          <div className="bg-[#151924] p-1.5 rounded border border-[#232a3b]">
            <span className="text-slate-400 block text-[9px]">EAX</span>
            <span className="text-white font-mono">0x{pcb.registers.eax.toString(16).padStart(4, '0')}</span>
          </div>
          <div className="bg-[#151924] p-1.5 rounded border border-[#232a3b]">
            <span className="text-slate-400 block text-[9px]">EBX</span>
            <span className="text-white font-mono">0x{pcb.registers.ebx.toString(16).padStart(4, '0')}</span>
          </div>
          <div className="bg-[#151924] p-1.5 rounded border border-[#232a3b]">
            <span className="text-slate-400 block text-[9px]">ECX</span>
            <span className="text-white font-mono">0x{pcb.registers.ecx.toString(16).padStart(4, '0')}</span>
          </div>
          <div className="bg-[#151924] p-1.5 rounded border border-[#232a3b]">
            <span className="text-slate-400 block text-[9px]">EDX</span>
            <span className="text-white font-mono">0x{pcb.registers.edx.toString(16).padStart(4, '0')}</span>
          </div>
          <div className="bg-[#151924] p-1.5 rounded border border-[#232a3b]">
            <span className="text-slate-400 block text-[9px]">ESP (Stack)</span>
            <span className="text-white font-mono">0x{pcb.registers.esp.toString(16).padStart(4, '0')}</span>
          </div>
        </div>
      </div>

      {pcb.waitingReason && (
        <div className="rounded border border-amber-900/60 bg-amber-950/20 p-2 text-[11px] text-amber-300">
          <strong>Blocked Condition: </strong>
          <span>Waiting on {pcb.waitingReason}</span>
        </div>
      )}
    </div>
  );
}

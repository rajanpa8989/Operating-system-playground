'use client';

import React, { useState } from 'react';
import { ProcessControlBlock, ProcessTransitionEvent } from '@/types/process';
import {
  createDefaultProcessList,
  createProcessPCB,
  executeTransition,
} from '@/algorithms/process-management';
import { StateDiagram } from '@/components/simulator/process/StateDiagram';
import { PCBInspector } from '@/components/simulator/process/PCBInspector';
import { ProcessTransitionConsole } from '@/components/simulator/process/ProcessTransitionConsole';
import { Activity, Info, RotateCcw } from 'lucide-react';

export default function ProcessManagementPage() {
  const [processes, setProcesses] = useState<ProcessControlBlock[]>(createDefaultProcessList());
  const [selectedPid, setSelectedPid] = useState<string | null>('P1');
  const [lastLog, setLastLog] = useState<{
    type: 'success' | 'error';
    message: string;
    osAction: string;
  } | null>(null);

  const selectedPcb = processes.find((p) => p.pid === selectedPid) || null;
  const runningProcess = processes.find((p) => p.state === 'RUNNING');
  const currentRunningPid = runningProcess ? runningProcess.pid : null;

  const handleTriggerEvent = (event: ProcessTransitionEvent, ioReason?: string) => {
    if (!selectedPcb) return;

    const pcbCopy = { ...selectedPcb, registers: { ...selectedPcb.registers } };
    const res = executeTransition(pcbCopy, event, currentRunningPid, { ioReason });

    setLastLog({
      type: res.success ? 'success' : 'error',
      message: res.message,
      osAction: res.osActionDescription,
    });

    if (res.success) {
      setProcesses((prev) =>
        prev.map((p) => (p.pid === pcbCopy.pid ? pcbCopy : p))
      );
    }
  };

  const handleSpawnProcess = () => {
    const nextPid = `P${processes.length + 1}`;
    const newProc = createProcessPCB(
      nextPid,
      `Daemon Task ${processes.length + 1}`,
      (processes.length % 3) + 1,
      0x1000 * (processes.length + 1)
    );
    setProcesses((prev) => [...prev, newProc]);
    setSelectedPid(nextPid);
    setLastLog({
      type: 'success',
      message: `Created process ${nextPid} in NEW state. Initialized stack & registers.`,
      osAction: `Kernel assigned PID ${nextPid}, allocated PCB, and set state to NEW.`,
    });
  };

  const handleReset = () => {
    const fresh = createDefaultProcessList();
    setProcesses(fresh);
    setSelectedPid('P1');
    setLastLog(null);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2433] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#2d3a2e] bg-[#142015] text-[#9cf944]">
              <Activity className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Process Lifecycle & Context Switch Lab
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Directly control the 5-state process machine, trigger interrupts, and inspect hardware PCB registers.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 self-start md:self-auto rounded border border-[#232a3b] bg-[#0c0e14] px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Laboratory</span>
        </button>
      </div>

      {/* Interactive State Machine Diagram */}
      <StateDiagram
        processes={processes}
        selectedPid={selectedPid}
        onSelectProcess={setSelectedPid}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Kernel Transition Controls */}
        <ProcessTransitionConsole
          selectedPcb={selectedPcb}
          currentRunningPid={currentRunningPid}
          onTriggerEvent={handleTriggerEvent}
          onSpawnProcess={handleSpawnProcess}
          lastLog={lastLog}
        />

        {/* Process Control Block (PCB) Inspector */}
        <PCBInspector pcb={selectedPcb} />
      </div>

      {/* Contextual Educational Deep Theory Note */}
      <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Info className="h-4 w-4 text-[#9cf944]" />
          <span>Kernel Mechanics: Context Switching & The Process Control Block</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans text-xs">
          A <strong>Context Switch</strong> represents the computational overhead of storing the hardware state of a process so that execution can be resumed from the exact same point later. When an interrupt occurs (e.g. Timer Quantum or I/O), the OS switches to Kernel Mode, pushes the current register set (EAX, ESP, PC) into the running process&apos;s PCB, selects the next process from the Ready Queue, reloads the new process&apos;s registers from its PCB into the CPU, and executes a return-from-interrupt (IRET) instruction to restore User Mode.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px]">
          <div className="rounded border border-[#1b2230] bg-[#10131a] p-3 text-slate-400 space-y-1">
            <strong className="text-slate-200 block text-[10px] uppercase">
              The 5 Primary States:
            </strong>
            <p>
              NEW (being created) → READY (waiting in RAM queue) → RUNNING (executing on core) → WAITING (blocked on I/O) → TERMINATED (finished execution).
            </p>
          </div>
          <div className="rounded border border-[#1b2230] bg-[#10131a] p-3 text-slate-400 space-y-1">
            <strong className="text-slate-200 block text-[10px] uppercase">
              Invariant Transition Rules:
            </strong>
            <p>
              A process can never transition directly from WAITING to RUNNING; it must always be transferred by the I/O Interrupt Service Routine back into the Ready Queue first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

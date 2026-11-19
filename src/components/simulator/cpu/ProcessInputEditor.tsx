'use client';

import React, { useState } from 'react';
import { ProcessInput, CPUSchedulerType } from '@/types/cpu-scheduling';
import { CPU_PRESETS } from '@/content/presets';
import { Plus, Trash2, RotateCcw, Sparkles } from 'lucide-react';

interface ProcessInputEditorProps {
  processes: ProcessInput[];
  selectedAlgorithm: CPUSchedulerType;
  timeQuantum: number;
  lowerPriorityIsHigher: boolean;
  onProcessesChange: (processes: ProcessInput[]) => void;
  onAlgorithmChange: (algo: CPUSchedulerType) => void;
  onTimeQuantumChange: (q: number) => void;
  onPriorityOrderChange: (lowerIsHigher: boolean) => void;
  onReset: () => void;
}

const ALGORITHMS: { id: CPUSchedulerType; name: string; tag: string }[] = [
  { id: 'fcfs', name: 'First Come First Serve (FCFS)', tag: 'Non-Preemptive' },
  { id: 'sjf', name: 'Shortest Job First (SJF)', tag: 'Non-Preemptive' },
  { id: 'srtf', name: 'Shortest Remaining Time First (SRTF)', tag: 'Preemptive' },
  { id: 'rr', name: 'Round Robin (RR)', tag: 'Preemptive / Slices' },
  { id: 'priority-non-preemptive', name: 'Priority (Non-Preemptive)', tag: 'Priority' },
  { id: 'priority-preemptive', name: 'Priority (Preemptive)', tag: 'Preemptive' },
];

const PROCESS_COLORS = ['#38bdf8', '#9cf944', '#fbbf24', '#f43f5e', '#a855f7', '#34d399', '#f97316'];

export function ProcessInputEditor({
  processes,
  selectedAlgorithm,
  timeQuantum,
  lowerPriorityIsHigher,
  onProcessesChange,
  onAlgorithmChange,
  onTimeQuantumChange,
  onPriorityOrderChange,
  onReset,
}: ProcessInputEditorProps) {
  const isPriorityAlgo = selectedAlgorithm.startsWith('priority');
  const isRoundRobin = selectedAlgorithm === 'rr';

  const handleUpdate = (index: number, field: keyof ProcessInput, val: any) => {
    const updated = [...processes];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onProcessesChange(updated);
  };

  const handleAdd = () => {
    const nextNum = processes.length + 1;
    const color = PROCESS_COLORS[(nextNum - 1) % PROCESS_COLORS.length];
    const newProcess: ProcessInput = {
      id: `P${nextNum}`,
      arrivalTime: 0,
      burstTime: 4,
      priority: 2,
      color,
    };
    onProcessesChange([...processes, newProcess]);
  };

  const handleDelete = (index: number) => {
    if (processes.length <= 1) return;
    const updated = processes.filter((_, idx) => idx !== index);
    onProcessesChange(updated);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = CPU_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onProcessesChange(preset.processes);
      if (preset.defaultQuantum && isRoundRobin) {
        onTimeQuantumChange(preset.defaultQuantum);
      }
    }
  };

  return (
    <div className="space-y-4 rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono">
      {/* Algorithm Selector & Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
            Scheduling Algorithm
          </label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => onAlgorithmChange(e.target.value as CPUSchedulerType)}
            className="w-full rounded border border-[#232a3b] bg-[#121620] px-3 py-2 text-xs text-white focus:border-[#9cf944] focus:outline-none"
          >
            {ALGORITHMS.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Quantum (Round Robin only) */}
        {isRoundRobin && (
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
              Time Quantum (q in ms)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={timeQuantum}
              onChange={(e) => onTimeQuantumChange(Math.max(1, Number(e.target.value)))}
              className="w-full rounded border border-[#232a3b] bg-[#121620] px-3 py-2 text-xs text-white focus:border-[#9cf944] focus:outline-none"
            />
          </div>
        )}

        {/* Priority direction toggle */}
        {isPriorityAlgo && (
          <div>
            <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
              Priority Interpretation
            </label>
            <div className="flex rounded border border-[#232a3b] bg-[#121620] p-0.5">
              <button
                type="button"
                onClick={() => onPriorityOrderChange(true)}
                className={`flex-1 rounded py-1.5 text-[10px] transition-colors ${
                  lowerPriorityIsHigher
                    ? 'bg-[#1b271d] text-[#9cf944] font-bold border border-[#2d402e]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Lower # = Higher Prio
              </button>
              <button
                type="button"
                onClick={() => onPriorityOrderChange(false)}
                className={`flex-1 rounded py-1.5 text-[10px] transition-colors ${
                  !lowerPriorityIsHigher
                    ? 'bg-[#1b271d] text-[#9cf944] font-bold border border-[#2d402e]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Higher # = Higher Prio
              </button>
            </div>
          </div>
        )}

        {/* Presets dropdown */}
        <div>
          <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
            Load Educational Presets
          </label>
          <div className="flex gap-1.5">
            <select
              onChange={(e) => {
                if (e.target.value) handleLoadPreset(e.target.value);
              }}
              defaultValue=""
              className="w-full rounded border border-[#232a3b] bg-[#121620] px-3 py-2 text-xs text-slate-300 focus:border-[#9cf944] focus:outline-none"
            >
              <option value="" disabled>
                Select scenario preset...
              </option>
              {CPU_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={onReset}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#232a3b] bg-[#121620] text-slate-400 hover:text-white"
              title="Reset default processes"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Process Table Input */}
      <div className="overflow-x-auto rounded border border-[#1e2433] bg-[#10131a]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-[#1e2433] bg-[#0c0e14] text-slate-400 text-[10px] uppercase">
            <tr>
              <th className="py-2 px-3">Process ID</th>
              <th className="py-2 px-3">Arrival Time (ms)</th>
              <th className="py-2 px-3">Burst Time (ms)</th>
              {isPriorityAlgo && <th className="py-2 px-3">Priority</th>}
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181d28]">
            {processes.map((proc, index) => (
              <tr key={index} className="hover:bg-[#121620]">
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: proc.color || '#60a5fa' }}
                    />
                    <input
                      type="text"
                      value={proc.id}
                      onChange={(e) => handleUpdate(index, 'id', e.target.value)}
                      className="w-20 rounded border border-[#232a3b] bg-[#161b26] px-2 py-1 text-xs text-white font-bold focus:border-[#9cf944] focus:outline-none"
                    />
                  </div>
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    min={0}
                    value={proc.arrivalTime}
                    onChange={(e) =>
                      handleUpdate(index, 'arrivalTime', Math.max(0, Number(e.target.value)))
                    }
                    className="w-24 rounded border border-[#232a3b] bg-[#161b26] px-2 py-1 text-xs text-white focus:border-[#9cf944] focus:outline-none"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="number"
                    min={1}
                    value={proc.burstTime}
                    onChange={(e) =>
                      handleUpdate(index, 'burstTime', Math.max(1, Number(e.target.value)))
                    }
                    className="w-24 rounded border border-[#232a3b] bg-[#161b26] px-2 py-1 text-xs text-white focus:border-[#9cf944] focus:outline-none"
                  />
                </td>
                {isPriorityAlgo && (
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={proc.priority ?? 1}
                      onChange={(e) =>
                        handleUpdate(index, 'priority', Number(e.target.value))
                      }
                      className="w-24 rounded border border-[#232a3b] bg-[#161b26] px-2 py-1 text-xs text-white focus:border-[#9cf944] focus:outline-none"
                    />
                  </td>
                )}
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => handleDelete(index)}
                    disabled={processes.length <= 1}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Delete Process"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Process Button */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded border border-[#232a3b] bg-[#131722] px-3 py-1.5 text-xs text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-[#9cf944]" />
          <span>Add Process</span>
        </button>

        <span className="text-[11px] text-slate-400">
          Deterministic tie-breaking: Arrival order, then numerical Process ID
        </span>
      </div>
    </div>
  );
}

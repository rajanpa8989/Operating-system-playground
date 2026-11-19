'use client';

import React, { useState, useMemo } from 'react';
import { ProcessInput, CPUSchedulerType, CPUSimulationResult } from '@/types/cpu-scheduling';
import { runCPUScheduler } from '@/algorithms/cpu-scheduling';
import { simulatePageReplacement } from '@/algorithms/memory-management';
import { CPU_PRESETS, MEMORY_PRESETS } from '@/content/presets';
import { GitCompare, Trophy, Cpu, Layers, HelpCircle } from 'lucide-react';

type ComparisonMode = 'cpu' | 'memory';

export default function ComparisonPage() {
  const [mode, setMode] = useState<ComparisonMode>('cpu');

  // CPU Benchmark Configuration
  const [cpuProcesses, setCpuProcesses] = useState<ProcessInput[]>(CPU_PRESETS[0].processes);
  const [rrQuantum, setRrQuantum] = useState<number>(3);

  // Memory Benchmark Configuration
  const [refInput, setRefInput] = useState<string>('7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1');
  const [frames, setFrames] = useState<number>(3);

  // 1. Run all CPU algorithms on identical inputs
  const cpuResults = useMemo(() => {
    const algos: { id: CPUSchedulerType; label: string }[] = [
      { id: 'fcfs', label: 'FCFS' },
      { id: 'sjf', label: 'SJF (Non-Preemptive)' },
      { id: 'srtf', label: 'SRTF (Preemptive)' },
      { id: 'rr', label: `Round Robin (q=${rrQuantum})` },
      { id: 'priority-non-preemptive', label: 'Priority (Non-Preemptive)' },
      { id: 'priority-preemptive', label: 'Priority (Preemptive)' },
    ];

    return algos.map((algo) => ({
      ...algo,
      result: runCPUScheduler(algo.id, cpuProcesses, { timeQuantum: rrQuantum, lowerPriorityIsHigher: true }),
    }));
  }, [cpuProcesses, rrQuantum]);

  // Find lowest average waiting time
  const bestWaiting = useMemo(() => {
    return Math.min(...cpuResults.map((r) => r.result.avgWaitingTime));
  }, [cpuResults]);

  // 2. Run all Memory algorithms on identical inputs
  const memRefString = useMemo(() => {
    return refInput
      .split(/[\s,]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n >= 0);
  }, [refInput]);

  const memResults = useMemo(() => {
    return [
      { id: 'fifo', label: 'FIFO', result: simulatePageReplacement('fifo', memRefString, frames) },
      { id: 'lru', label: 'LRU', result: simulatePageReplacement('lru', memRefString, frames) },
      { id: 'optimal', label: 'Optimal (OPT)', result: simulatePageReplacement('optimal', memRefString, frames) },
    ];
  }, [memRefString, frames]);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2433] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#2d3a2e] bg-[#142015] text-[#9cf944]">
              <GitCompare className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Algorithm Benchmarking & Comparative Analysis
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Execute algorithms on identical workloads to objectively measure trade-offs.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 rounded border border-[#1e2433] bg-[#0c0e14] p-1 text-xs font-mono">
          <button
            onClick={() => setMode('cpu')}
            className={`rounded px-3 py-1.5 transition-colors ${
              mode === 'cpu'
                ? 'bg-[#182319] text-[#9cf944] font-bold border border-[#2d402e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CPU Scheduling Benchmarks
          </button>
          <button
            onClick={() => setMode('memory')}
            className={`rounded px-3 py-1.5 transition-colors ${
              mode === 'memory'
                ? 'bg-[#182319] text-[#9cf944] font-bold border border-[#2d402e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Page Replacement Benchmarks
          </button>
        </div>
      </div>

      {/* CPU BENCHMARKS SECTION */}
      {mode === 'cpu' && (
        <div className="space-y-4">
          {/* Workload presets */}
          <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-3 text-xs font-mono flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase text-[10px] font-semibold">Test Workload:</span>
              <select
                onChange={(e) => {
                  const preset = CPU_PRESETS.find((p) => p.id === e.target.value);
                  if (preset) {
                    setCpuProcesses(preset.processes);
                    if (preset.defaultQuantum) setRrQuantum(preset.defaultQuantum);
                  }
                }}
                className="rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1 text-xs text-white"
              >
                {CPU_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase text-[10px] font-semibold">RR Quantum:</span>
              <input
                type="number"
                min={1}
                max={20}
                value={rrQuantum}
                onChange={(e) => setRrQuantum(Math.max(1, Number(e.target.value)))}
                className="w-16 rounded border border-[#232a3b] bg-[#121620] px-2 py-1 text-center text-xs text-white"
              />
            </div>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="overflow-x-auto rounded border border-[#1e2433] bg-[#0c0e14]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#1e2433] bg-[#10131a] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">Avg Waiting Time</th>
                  <th className="py-2.5 px-3">Avg Turnaround</th>
                  <th className="py-2.5 px-3">Avg Response</th>
                  <th className="py-2.5 px-3">CPU Utilization</th>
                  <th className="py-2.5 px-3">Throughput</th>
                  <th className="py-2.5 px-3">Context Switches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171b26]">
                {cpuResults.map(({ id, label, result }) => {
                  const isBestWait = result.avgWaitingTime === bestWaiting;
                  return (
                    <tr
                      key={id}
                      className={`hover:bg-[#121620] transition-colors ${
                        isBestWait ? 'bg-[#121c13]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                        {isBestWait && <Trophy className="h-3.5 w-3.5 text-[#9cf944] shrink-0" />}
                        <span>{label}</span>
                      </td>
                      <td className={`py-2.5 px-3 font-semibold ${isBestWait ? 'text-[#9cf944]' : 'text-slate-200'}`}>
                        {result.avgWaitingTime} ms
                      </td>
                      <td className="py-2.5 px-3 text-sky-400">{result.avgTurnaroundTime} ms</td>
                      <td className="py-2.5 px-3 text-amber-400">{result.avgResponseTime} ms</td>
                      <td className="py-2.5 px-3 text-emerald-400">{result.cpuUtilization}%</td>
                      <td className="py-2.5 px-3 text-purple-400">{result.throughput} p/ms</td>
                      <td className="py-2.5 px-3 text-rose-400">{result.contextSwitches}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Stacked Comparative Gantt Timelines */}
          <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono space-y-3">
            <span className="text-[11px] uppercase text-slate-400 font-semibold block">
              Aligned Execution Timelines:
            </span>
            <div className="space-y-2.5">
              {cpuResults.map(({ id, label, result }) => {
                const maxTime = Math.max(...cpuResults.map((r) => r.result.totalTime));
                return (
                  <div key={id} className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-white">{label}</span>
                      <span>Total: {result.totalTime} ms</span>
                    </div>
                    <div className="flex h-7 w-full rounded overflow-hidden border border-[#232a3b] bg-[#10131a]">
                      {result.gantt.map((seg, idx) => {
                        const widthPct = ((seg.endTime - seg.startTime) / maxTime) * 100;
                        const isIdle = seg.processId === 'IDLE';
                        return (
                          <div
                            key={idx}
                            style={{ width: `${widthPct}%` }}
                            className={`flex items-center justify-center border-r border-[#0c0e14] text-[9px] font-bold ${
                              isIdle ? 'bg-[#161a24] text-slate-500' : 'bg-sky-500/80 text-slate-950'
                            }`}
                          >
                            {seg.processId} ({seg.endTime - seg.startTime})
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MEMORY BENCHMARKS SECTION */}
      {mode === 'memory' && (
        <div className="space-y-4">
          <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-3 text-xs font-mono flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Shared Page Reference String
              </label>
              <input
                type="text"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Physical Frames
              </label>
              <select
                value={frames}
                onChange={(e) => setFrames(Number(e.target.value))}
                className="rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1 text-xs text-white"
              >
                <option value={3}>3 Frames</option>
                <option value={4}>4 Frames</option>
                <option value={5}>5 Frames</option>
              </select>
            </div>
          </div>

          {/* Memory Results Table */}
          <div className="overflow-x-auto rounded border border-[#1e2433] bg-[#0c0e14]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#1e2433] bg-[#10131a] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">Total Faults</th>
                  <th className="py-2.5 px-3">Total Hits</th>
                  <th className="py-2.5 px-3">Hit Ratio</th>
                  <th className="py-2.5 px-3">Fault Ratio</th>
                  <th className="py-2.5 px-3">Theoretical Property</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171b26]">
                {memResults.map(({ id, label, result }) => {
                  const isOptimal = id === 'optimal';
                  return (
                    <tr
                      key={id}
                      className={`hover:bg-[#121620] transition-colors ${
                        isOptimal ? 'bg-[#121c13]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                        {isOptimal && <Trophy className="h-3.5 w-3.5 text-[#9cf944] shrink-0" />}
                        <span>{label}</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-rose-400">{result.totalFaults}</td>
                      <td className="py-2.5 px-3 font-bold text-[#9cf944]">{result.totalHits}</td>
                      <td className="py-2.5 px-3 text-sky-400">{result.hitRatio}%</td>
                      <td className="py-2.5 px-3 text-amber-400">{result.faultRatio}%</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {id === 'fifo' && "Non-stack algo; vulnerable to Belady's Anomaly"}
                        {id === 'lru' && 'Stack algorithm; approximates future via locality'}
                        {id === 'optimal' && 'Provably minimal page faults (Lower Bound)'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { ProcessMetric } from '@/types/cpu-scheduling';
import { BarChart3, HelpCircle } from 'lucide-react';

interface MetricsTableProps {
  metrics: ProcessMetric[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  cpuUtilization: number;
  throughput: number;
  contextSwitches: number;
  processColors?: Record<string, string>;
}

export function MetricsTable({
  metrics,
  avgWaitingTime,
  avgTurnaroundTime,
  avgResponseTime,
  cpuUtilization,
  throughput,
  contextSwitches,
  processColors = {},
}: MetricsTableProps) {
  return (
    <div className="space-y-4">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-3">
          <div className="text-[10px] font-mono uppercase text-slate-400">Avg Waiting Time</div>
          <div className="mt-1 text-lg font-mono font-bold text-[#9cf944]">
            {avgWaitingTime.toFixed(2)} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
        </div>

        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-3">
          <div className="text-[10px] font-mono uppercase text-slate-400">Avg Turnaround</div>
          <div className="mt-1 text-lg font-mono font-bold text-sky-400">
            {avgTurnaroundTime.toFixed(2)} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
        </div>

        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-3">
          <div className="text-[10px] font-mono uppercase text-slate-400">Avg Response</div>
          <div className="mt-1 text-lg font-mono font-bold text-amber-400">
            {avgResponseTime.toFixed(2)} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
        </div>

        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-3">
          <div className="text-[10px] font-mono uppercase text-slate-400">CPU Utilization</div>
          <div className="mt-1 text-lg font-mono font-bold text-emerald-400">
            {cpuUtilization.toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
          </div>
        </div>

        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-3">
          <div className="text-[10px] font-mono uppercase text-slate-400">Throughput</div>
          <div className="mt-1 text-lg font-mono font-bold text-purple-400">
            {throughput.toFixed(3)} <span className="text-xs font-normal text-slate-400">p/ms</span>
          </div>
        </div>

        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-3">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
            <span>Context Switches</span>
          </div>
          <div className="mt-1 text-lg font-mono font-bold text-rose-400">
            {contextSwitches}
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="overflow-x-auto rounded border border-[#1e2433] bg-[#0c0e14]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-[#1e2433] bg-[#10131a] text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Process</th>
              <th className="py-2.5 px-3">Arrival (AT)</th>
              <th className="py-2.5 px-3">Burst (BT)</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Completion (CT)</th>
              <th className="py-2.5 px-3">Turnaround (TAT)</th>
              <th className="py-2.5 px-3">Waiting (WT)</th>
              <th className="py-2.5 px-3">Response (RT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#171b26] text-slate-200">
            {metrics.map((m) => {
              const color = processColors[m.id] || '#60a5fa';
              return (
                <tr key={m.id} className="hover:bg-[#121620] transition-colors">
                  <td className="py-2.5 px-3 font-bold flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span>{m.id}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{m.arrivalTime} ms</td>
                  <td className="py-2.5 px-3">{m.burstTime} ms</td>
                  <td className="py-2.5 px-3 text-slate-400">{m.priority ?? '—'}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{m.completionTime} ms</td>
                  <td className="py-2.5 px-3 text-sky-400">{m.turnaroundTime} ms</td>
                  <td className="py-2.5 px-3 text-[#9cf944]">{m.waitingTime} ms</td>
                  <td className="py-2.5 px-3 text-amber-400">{m.responseTime} ms</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Notation & Convention Documentation footnote */}
      <div className="rounded border border-[#1b2230] bg-[#0a0d14] p-3 text-[11px] font-mono text-slate-400 space-y-1">
        <div className="text-slate-400 font-semibold uppercase">Formulas & Counting Conventions:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
          <div>• Turnaround Time (TAT) = Completion Time (CT) − Arrival Time (AT)</div>
          <div>• Waiting Time (WT) = Turnaround Time (TAT) − Burst Time (BT)</div>
          <div>• Response Time (RT) = First CPU Time − Arrival Time (AT)</div>
          <div>• Context Switches: Incremented each time CPU switches between different user processes.</div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CPU_PRESETS, MEMORY_PRESETS, DEADLOCK_PRESETS } from '@/content/presets';
import { FolderArchive, Play, Download, Upload, Trash2, Cpu, Layers, ShieldAlert } from 'lucide-react';

interface SavedExperiment {
  id: string;
  title: string;
  category: 'cpu' | 'memory' | 'deadlock';
  timestamp: string;
  notes: string;
}

const DEFAULT_EXPERIMENTS: SavedExperiment[] = [
  {
    id: 'exp-1',
    title: 'The Convoy Effect Investigation',
    category: 'cpu',
    timestamp: '2026-11-18 20:30',
    notes: 'Comparison between FCFS (17.0ms wait) and SJF (3.0ms wait) with compute-heavy P1.',
  },
  {
    id: 'exp-2',
    title: "Belady's Anomaly Verification",
    category: 'memory',
    timestamp: '2026-11-18 20:35',
    notes: 'Reference string [1,2,3,4,1,2,5,1,2,3,4,5] causing 10 faults on 4 frames vs 9 on 3 frames.',
  },
  {
    id: 'exp-3',
    title: "Classic Banker's Safety Test",
    category: 'deadlock',
    timestamp: '2026-11-18 20:40',
    notes: '5 processes, 3 resource types evaluating safe sequence <P1, P3, P4, P0, P2>.',
  },
];

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<SavedExperiment[]>(DEFAULT_EXPERIMENTS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('os_playground_experiments');
      if (saved) {
        setExperiments(JSON.parse(saved));
      }
    } catch {
      // storage fallback
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = experiments.filter((e) => e.id !== id);
    setExperiments(updated);
    try {
      localStorage.setItem('os_playground_experiments', JSON.stringify(updated));
    } catch {
      // storage fallback
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(experiments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'os_playground_experiments.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2433] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#2d3a2e] bg-[#142015] text-[#9cf944]">
              <FolderArchive className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Saved Experiments & Canonical Lab Scenarios
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Revisit prior simulations, inspect historical findings, and export configurations.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 self-start md:self-auto rounded border border-[#232a3b] bg-[#0c0e14] px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors"
        >
          <Download className="h-3.5 w-3.5 text-[#9cf944]" />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Experiments List */}
      <div className="space-y-3">
        {experiments.map((exp) => {
          const targetUrl =
            exp.category === 'cpu'
              ? '/cpu-scheduling'
              : exp.category === 'memory'
              ? '/memory-management'
              : '/deadlock-management';

          return (
            <div
              key={exp.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono transition-colors hover:border-slate-700"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      exp.category === 'cpu'
                        ? 'bg-sky-950/40 text-sky-400 border border-sky-800/40'
                        : exp.category === 'memory'
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                        : 'bg-emerald-950/40 text-[#9cf944] border border-[#2d402e]'
                    }`}
                  >
                    {exp.category}
                  </span>
                  <h3 className="font-bold text-white text-sm font-sans">{exp.title}</h3>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                  {exp.notes}
                </p>
                <div className="text-[10px] text-slate-500">Recorded: {exp.timestamp}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={targetUrl}
                  className="flex items-center gap-1.5 rounded border border-[#2d3a2e] bg-[#142015] px-3 py-1.5 text-xs font-semibold text-[#9cf944] hover:bg-[#1a2c1b] transition-colors"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Open in Lab</span>
                </Link>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-1.5 rounded text-slate-500 hover:text-rose-400"
                  title="Delete experiment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { PageReplacementAlgorithm } from '@/types/memory';
import { simulatePageReplacement } from '@/algorithms/memory-management';
import { MEMORY_PRESETS } from '@/content/presets';
import { Check, X, RotateCcw } from 'lucide-react';

export function PageReplacementVisualizer() {
  const [algo, setAlgo] = useState<PageReplacementAlgorithm>('fifo');
  const [frameCount, setFrameCount] = useState<number>(3);
  const [refInput, setRefInput] = useState<string>('7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1');
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const referenceString = useMemo(() => {
    return refInput
      .split(/[\s,]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n >= 0);
  }, [refInput]);

  const result = useMemo(() => {
    return simulatePageReplacement(algo, referenceString, frameCount);
  }, [algo, referenceString, frameCount]);

  const loadPreset = (type: 'textbook' | 'belady' | 'locality') => {
    if (type === 'textbook') {
      setRefInput(MEMORY_PRESETS.textbookRefString.join(', '));
      setFrameCount(3);
    } else if (type === 'belady') {
      setRefInput(MEMORY_PRESETS.beladyString.join(', '));
      setAlgo('fifo');
    } else if (type === 'locality') {
      setRefInput(MEMORY_PRESETS.localityRefString.join(', '));
    }
  };

  return (
    <div className="space-y-4 rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2433] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white font-sans">
            Page Replacement Simulator
          </h3>
          <p className="text-[11px] text-slate-400">
            Compare FIFO, LRU, and Optimal replacement policies across custom memory frames.
          </p>
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => loadPreset('textbook')}
            className="rounded border border-[#232a3b] bg-[#141822] px-2 py-1 text-[10px] text-slate-300 hover:text-white"
          >
            Classic Textbook
          </button>
          <button
            onClick={() => loadPreset('belady')}
            className="rounded border border-[#2d402e] bg-[#142215] px-2 py-1 text-[10px] text-[#9cf944] hover:bg-[#1a2c1b]"
          >
            Belady&apos;s Anomaly Demo
          </button>
          <button
            onClick={() => loadPreset('locality')}
            className="rounded border border-[#232a3b] bg-[#141822] px-2 py-1 text-[10px] text-slate-300 hover:text-white"
          >
            Locality Pattern
          </button>
        </div>
      </div>

      {/* Control Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-1">Algorithm</label>
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as PageReplacementAlgorithm)}
            className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
          >
            <option value="fifo">FIFO (First-In, First-Out)</option>
            <option value="lru">LRU (Least Recently Used)</option>
            <option value="optimal">Optimal (Belady&apos;s Min / Furthest in Future)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-1">
            Number of Frames (M)
          </label>
          <select
            value={frameCount}
            onChange={(e) => setFrameCount(Number(e.target.value))}
            className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
          >
            <option value={3}>3 Frames</option>
            <option value={4}>4 Frames (Test Belady with FIFO!)</option>
            <option value={5}>5 Frames</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-1">
            Page Reference String
          </label>
          <input
            type="text"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
            placeholder="e.g. 7, 0, 1, 2, 0, 3..."
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded border border-[#1e2433] bg-[#10131a] p-2.5">
          <div className="text-[10px] uppercase text-slate-400">Total Faults</div>
          <div className="text-lg font-bold text-rose-400">{result.totalFaults}</div>
        </div>
        <div className="rounded border border-[#1e2433] bg-[#10131a] p-2.5">
          <div className="text-[10px] uppercase text-slate-400">Total Hits</div>
          <div className="text-lg font-bold text-[#9cf944]">{result.totalHits}</div>
        </div>
        <div className="rounded border border-[#1e2433] bg-[#10131a] p-2.5">
          <div className="text-[10px] uppercase text-slate-400">Fault Ratio</div>
          <div className="text-lg font-bold text-amber-400">{result.faultRatio}%</div>
        </div>
        <div className="rounded border border-[#1e2433] bg-[#10131a] p-2.5">
          <div className="text-[10px] uppercase text-slate-400">Hit Ratio</div>
          <div className="text-lg font-bold text-sky-400">{result.hitRatio}%</div>
        </div>
      </div>

      {/* Step-by-Step Frame Matrix Table */}
      <div className="overflow-x-auto rounded border border-[#1e2433] bg-[#10131a] p-3">
        <div className="text-[10px] text-slate-400 mb-2 uppercase font-semibold">
          Execution Frame Grid (Hover on step to view details):
        </div>

        <table className="w-full text-center text-xs font-mono">
          <thead>
            <tr className="border-b border-[#1e2433] text-slate-400">
              <th className="py-1 px-2 text-left text-[10px]">Reference</th>
              {result.steps.map((step, idx) => (
                <th
                  key={idx}
                  className={`py-1 px-2 font-bold ${
                    activeStepIndex === idx ? 'text-[#9cf944] bg-[#152016]' : 'text-white'
                  }`}
                >
                  {step.pageRef}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181d28]">
            {Array.from({ length: frameCount }).map((_, frameIdx) => (
              <tr key={frameIdx}>
                <td className="py-1 px-2 text-left text-[10px] text-slate-400 font-semibold">
                  Frame {frameIdx}
                </td>
                {result.steps.map((step, idx) => {
                  const val = step.frames[frameIdx];
                  const isReferencedNow = val === step.pageRef;
                  return (
                    <td
                      key={idx}
                      onMouseEnter={() => setActiveStepIndex(idx)}
                      className={`py-1 px-2 transition-colors ${
                        activeStepIndex === idx ? 'bg-[#152016]' : ''
                      } ${
                        isReferencedNow
                          ? 'font-bold text-[#9cf944] bg-[#121c13]'
                          : val !== null
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {val !== null ? val : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Hit / Fault Indicator Row */}
            <tr className="border-t border-[#1e2433]">
              <td className="py-1.5 px-2 text-left text-[10px] text-slate-400 uppercase font-bold">
                Outcome
              </td>
              {result.steps.map((step, idx) => (
                <td
                  key={idx}
                  className={`py-1.5 px-2 font-bold text-[11px] ${
                    step.isHit ? 'text-[#9cf944]' : 'text-rose-400'
                  }`}
                >
                  {step.isHit ? 'H' : 'F'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Active step explanation */}
      {activeStepIndex !== null && result.steps[activeStepIndex] && (
        <div className="rounded border border-[#2d402e] bg-[#121a13] p-2.5 text-xs text-slate-200">
          <span className="text-[#9cf944] font-bold">
            Step {activeStepIndex + 1} (Page {result.steps[activeStepIndex].pageRef}):{' '}
          </span>
          <span>{result.steps[activeStepIndex].explanation}</span>
        </div>
      )}
    </div>
  );
}

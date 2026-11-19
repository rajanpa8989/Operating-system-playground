'use client';

import React, { useState } from 'react';
import { MemoryBlock, ContiguousAlgorithm } from '@/types/memory';
import { allocateMemory, deallocateMemory } from '@/algorithms/memory-management';
import { MEMORY_PRESETS } from '@/content/presets';
import { Plus, Trash2, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

const PROCESS_COLORS: Record<string, string> = {
  P1: '#38bdf8',
  P2: '#9cf944',
  P3: '#fbbf24',
  P4: '#f43f5e',
  P5: '#a855f7',
};

export function ContiguousVisualizer() {
  const [blocks, setBlocks] = useState<MemoryBlock[]>(MEMORY_PRESETS.contiguousInitialBlocks);
  const [algo, setAlgo] = useState<ContiguousAlgorithm>('first-fit');
  const [newPid, setNewPid] = useState<string>('P1');
  const [requestSize, setRequestSize] = useState<number>(212);
  const [selectedDeallocPid, setSelectedDeallocPid] = useState<string>('');
  const [log, setLog] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const totalMemory = blocks.reduce((acc, b) => acc + b.size, 0);
  const totalFree = blocks.filter((b) => b.processId === null).reduce((acc, b) => acc + b.size, 0);
  const totalAlloc = totalMemory - totalFree;

  const allocatedPids = Array.from(
    new Set(blocks.map((b) => b.processId).filter((p): p is string => p !== null))
  );

  const handleAllocate = () => {
    if (!newPid.trim() || requestSize <= 0) return;
    const res = allocateMemory(blocks, newPid.trim(), requestSize, algo);
    setBlocks(res.blocks);
    setLog({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    if (res.success) {
      const nextNum = allocatedPids.length + 2;
      setNewPid(`P${nextNum}`);
    }
  };

  const handleDeallocate = () => {
    if (!selectedDeallocPid) return;
    const res = deallocateMemory(blocks, selectedDeallocPid);
    setBlocks(res.blocks);
    setLog({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setSelectedDeallocPid('');
  };

  const handleReset = () => {
    setBlocks(MEMORY_PRESETS.contiguousInitialBlocks);
    setNewPid('P1');
    setRequestSize(212);
    setLog(null);
  };

  return (
    <div className="space-y-4 rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2433] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white font-sans">Contiguous Memory Allocation</h3>
          <p className="text-[11px] text-slate-400">
            Compare First Fit, Best Fit, and Worst Fit algorithms & examine External Fragmentation.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded border border-[#232a3b] bg-[#141822] px-2.5 py-1 text-slate-300 hover:text-white"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Memory</span>
        </button>
      </div>

      {/* Memory Allocation Strip Visualizer */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Physical Address Space (0 to {totalMemory} KB)</span>
          <span>
            Free: <strong className="text-[#9cf944]">{totalFree} KB</strong> | Allocated:{' '}
            <strong className="text-sky-400">{totalAlloc} KB</strong>
          </span>
        </div>

        <div className="flex h-16 w-full rounded overflow-hidden border border-[#232a3b] bg-[#10131a]">
          {blocks.map((block, idx) => {
            const widthPct = (block.size / totalMemory) * 100;
            const isFree = block.processId === null;
            const color = block.processId
              ? PROCESS_COLORS[block.processId] || '#60a5fa'
              : '#161c28';

            return (
              <div
                key={idx}
                style={{ width: `${widthPct}%` }}
                className={`relative flex h-full flex-col justify-between border-r border-[#0c0e14] p-1.5 select-none transition-all ${
                  isFree ? 'bg-[#121622] text-slate-400' : 'text-slate-950 font-bold'
                }`}
              >
                {!isFree && (
                  <div
                    className="absolute inset-0 opacity-85"
                    style={{ backgroundColor: color }}
                  />
                )}
                <div className="relative z-10 flex items-center justify-between text-[10px]">
                  <span>{block.processId || 'FREE'}</span>
                  <span>{block.size} KB</span>
                </div>
                <div className="relative z-10 text-[9px] opacity-75">
                  @{block.startAddress}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-1">Algorithm</label>
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as ContiguousAlgorithm)}
            className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
          >
            <option value="first-fit">First Fit (First hole that fits)</option>
            <option value="best-fit">Best Fit (Smallest hole that fits)</option>
            <option value="worst-fit">Worst Fit (Largest hole)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-1">Process ID</label>
          <input
            type="text"
            value={newPid}
            onChange={(e) => setNewPid(e.target.value)}
            className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
            placeholder="e.g. P1"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-1">Size (KB)</label>
          <input
            type="number"
            min={1}
            value={requestSize}
            onChange={(e) => setRequestSize(Math.max(1, Number(e.target.value)))}
            className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleAllocate}
            className="w-full flex items-center justify-center gap-1.5 rounded border border-[#2d3a2e] bg-[#162217] py-2 text-xs font-semibold text-[#9cf944] hover:bg-[#1c2c1d] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Allocate Process</span>
          </button>
        </div>
      </div>

      {/* Deallocate Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-[#1e2433] pt-3">
        <span className="text-[11px] text-slate-400 shrink-0">Deallocate Process:</span>
        <select
          value={selectedDeallocPid}
          onChange={(e) => setSelectedDeallocPid(e.target.value)}
          className="flex-1 rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-rose-400 focus:outline-none"
        >
          <option value="">Select allocated process to release...</option>
          {allocatedPids.map((pid) => (
            <option key={pid} value={pid}>
              {pid}
            </option>
          ))}
        </select>
        <button
          onClick={handleDeallocate}
          disabled={!selectedDeallocPid}
          className="flex items-center gap-1.5 rounded border border-rose-900/50 bg-rose-950/30 px-3 py-1.5 text-rose-300 hover:bg-rose-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Release & Coalesce</span>
        </button>
      </div>

      {/* Event/Log message */}
      {log && (
        <div
          className={`flex items-start gap-2 rounded border p-3 text-xs ${
            log.type === 'success'
              ? 'border-[#2d402e] bg-[#121a13] text-[#9cf944]'
              : 'border-rose-900/60 bg-rose-950/20 text-rose-300'
          }`}
        >
          {log.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span>{log.message}</span>
        </div>
      )}
    </div>
  );
}

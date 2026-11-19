'use client';

import React, { useState } from 'react';
import { BankersVisualizer } from '@/components/simulator/deadlock/BankersVisualizer';
import { RAGVisualizer } from '@/components/simulator/deadlock/RAGVisualizer';
import { TOPIC_GUIDES } from '@/content/topics';
import { ShieldAlert, Info, GitBranch, Cpu } from 'lucide-react';

type DeadlockTab = 'bankers' | 'rag';

export default function DeadlockManagementPage() {
  const [activeTab, setActiveTab] = useState<DeadlockTab>('bankers');
  const guide = TOPIC_GUIDES['bankers'];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2433] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#2d3a2e] bg-[#142015] text-[#9cf944]">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Deadlock Management Laboratory
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Dijkstra&apos;s Banker&apos;s Algorithm, safe sequence derivation, and Resource Allocation Graph cycles.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 rounded border border-[#1e2433] bg-[#0c0e14] p-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab('bankers')}
            className={`rounded px-3 py-1.5 transition-colors ${
              activeTab === 'bankers'
                ? 'bg-[#182319] text-[#9cf944] font-bold border border-[#2d402e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Banker&apos;s Algorithm
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`rounded px-3 py-1.5 transition-colors ${
              activeTab === 'rag'
                ? 'bg-[#182319] text-[#9cf944] font-bold border border-[#2d402e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resource Allocation Graph (RAG)
          </button>
        </div>
      </div>

      {/* Active Tab Component */}
      {activeTab === 'bankers' && <BankersVisualizer />}
      {activeTab === 'rag' && <RAGVisualizer />}

      {/* Deep Educational Theory Card */}
      {guide && (
        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Info className="h-4 w-4 text-[#9cf944]" />
            <span>Deadlock Avoidance Theory: {guide.title}</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            {guide.conceptIntro}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px]">
            <div className="rounded border border-[#1b2230] bg-[#10131a] p-3 text-slate-400 space-y-1">
              <strong className="text-slate-200 block text-[10px] uppercase">
                Coffman&apos;s 4 Necessary Conditions:
              </strong>
              <p>
                1. Mutual Exclusion • 2. Hold and Wait • 3. No Preemption • 4. Circular Wait. Eliminating even one condition renders deadlock impossible.
              </p>
            </div>
            <div className="rounded border border-[#1b2230] bg-[#10131a] p-3 text-slate-400 space-y-1">
              <strong className="text-slate-200 block text-[10px] uppercase">
                Banker&apos;s Invariant:
              </strong>
              <p>
                Resources are never granted unless the hypothetical resulting state preserves at least one safe sequence ensuring all processes can terminate.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

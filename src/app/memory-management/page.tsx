'use client';

import React, { useState } from 'react';
import { ContiguousVisualizer } from '@/components/simulator/memory/ContiguousVisualizer';
import { PagingVisualizer } from '@/components/simulator/memory/PagingVisualizer';
import { PageReplacementVisualizer } from '@/components/simulator/memory/PageReplacementVisualizer';
import { SegmentationVisualizer } from '@/components/simulator/memory/SegmentationVisualizer';
import { TOPIC_GUIDES } from '@/content/topics';
import { Layers, Info, HardDrive, Cpu, Compass } from 'lucide-react';

type MemoryTab = 'contiguous' | 'paging' | 'replacement' | 'segmentation';

export default function MemoryManagementPage() {
  const [activeTab, setActiveTab] = useState<MemoryTab>('replacement');

  const guide = TOPIC_GUIDES['pageReplacement'];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2433] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#2d3a2e] bg-[#142015] text-[#9cf944]">
              <Layers className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Memory Management Laboratory
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Interactive simulation of physical allocation, paging, segmentation, and page eviction.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded border border-[#1e2433] bg-[#0c0e14] p-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab('replacement')}
            className={`rounded px-3 py-1.5 transition-colors ${
              activeTab === 'replacement'
                ? 'bg-[#182319] text-[#9cf944] font-bold border border-[#2d402e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Page Replacement
          </button>
          <button
            onClick={() => setActiveTab('contiguous')}
            className={`rounded px-3 py-1.5 transition-colors ${
              activeTab === 'contiguous'
                ? 'bg-[#182319] text-[#9cf944] font-bold border border-[#2d402e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Contiguous Allocation
          </button>
          <button
            onClick={() => setActiveTab('paging')}
            className={`rounded px-3 py-1.5 transition-colors ${
              activeTab === 'paging'
                ? 'bg-[#182319] text-[#9cf944] font-bold border border-[#2d402e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Paging Translation
          </button>
          <button
            onClick={() => setActiveTab('segmentation')}
            className={`rounded px-3 py-1.5 transition-colors ${
              activeTab === 'segmentation'
                ? 'bg-[#182319] text-[#9cf944] font-bold border border-[#2d402e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Segmentation
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'replacement' && <PageReplacementVisualizer />}
      {activeTab === 'contiguous' && <ContiguousVisualizer />}
      {activeTab === 'paging' && <PagingVisualizer />}
      {activeTab === 'segmentation' && <SegmentationVisualizer />}

      {/* Contextual Deep Educational Theory Card */}
      {guide && (
        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Info className="h-4 w-4 text-[#9cf944]" />
            <span>Virtual Memory Mechanics: {guide.title}</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            {guide.conceptIntro}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px]">
            <div className="rounded border border-[#1b2230] bg-[#10131a] p-3 text-slate-400 space-y-1">
              <strong className="text-slate-200 block text-[10px] uppercase">
                Real-World Analogy:
              </strong>
              <p>{guide.realWorldAnalogy}</p>
            </div>
            <div className="rounded border border-[#1b2230] bg-[#10131a] p-3 text-slate-400 space-y-1">
              <strong className="text-slate-200 block text-[10px] uppercase">
                Key Principle:
              </strong>
              <p>{guide.workingPrinciple}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

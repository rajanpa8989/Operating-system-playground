'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Sparkles, BookOpen, GitCompare, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const ROUTE_LABELS: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Laboratory Overview', subtitle: 'Interactive OS System Architecture' },
  '/cpu-scheduling': { title: 'CPU Scheduling Simulator', subtitle: 'FCFS, SJF, SRTF, Round Robin & Priority' },
  '/memory-management': { title: 'Memory Management Lab', subtitle: 'Contiguous Allocation, Paging, Segmentation & Page Replacement' },
  '/process-management': { title: 'Process Lifecycle & PCB', subtitle: '5-State Machine & Context Switching' },
  '/deadlock-management': { title: 'Deadlock Management Lab', subtitle: "Resource Allocation Graphs & Banker's Algorithm" },
  '/comparison': { title: 'Algorithm Benchmarking', subtitle: 'Side-by-Side Comparative Execution' },
  '/challenges': { title: 'Challenge Mode', subtitle: 'Conceptual & Practical Diagnostics' },
  '/learning': { title: 'Learning Documentation', subtitle: 'Deep Algorithmic Theory & Practical Mechanics' },
  '/experiments': { title: 'Saved Experiments', subtitle: 'Exported Benchmarks & Presets' },
};

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const pathname = usePathname();
  const current = ROUTE_LABELS[pathname] || { title: 'OS Playground', subtitle: 'Interactive OS Simulation' };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1e2433] bg-[#0c0e14]/90 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded border border-[#232a3b] bg-[#141822] text-slate-300 hover:border-slate-600 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-white lg:text-base font-sans">
              {current.title}
            </h1>
            <span className="hidden sm:inline-block rounded border border-[#232a3b] bg-[#141822] px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              SYS::ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/comparison"
          className="hidden md:flex items-center gap-1.5 rounded border border-[#232a3b] bg-[#131720] px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
        >
          <GitCompare className="h-3.5 w-3.5 text-slate-400" />
          <span>Benchmark</span>
        </Link>

        <Link
          href="/challenges"
          className="flex items-center gap-1.5 rounded border border-[#2d3a2e] bg-[#162217] px-2.5 py-1.5 text-xs font-medium text-[#9cf944] hover:bg-[#1a281b] transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Challenges</span>
        </Link>

        <Link
          href="/learning"
          className="flex items-center gap-1.5 rounded border border-[#232a3b] bg-[#131720] px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Docs</span>
        </Link>
      </div>
    </header>
  );
}

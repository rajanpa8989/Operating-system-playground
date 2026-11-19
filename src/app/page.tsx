'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Layers,
  Activity,
  ShieldAlert,
  GitCompare,
  BookOpen,
  Award,
  Terminal,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { CHALLENGES } from '@/content/challenges';

const LAB_MODULES = [
  {
    id: 'cpu-scheduling',
    title: 'CPU Scheduling Simulator',
    tagline: 'Gantt Timelines & Dispatching Schedulers',
    description:
      'Inspect FCFS, SJF, SRTF, Round Robin with configurable quantum, and Priority scheduling. Observe ready queues, context switching overhead, and throughput metrics in real-time.',
    href: '/cpu-scheduling',
    icon: Cpu,
    accent: '#38bdf8',
    stats: '6 Algorithms',
  },
  {
    id: 'memory-management',
    title: 'Memory Management Lab',
    tagline: 'Paging, Fragmentation & Replacement',
    description:
      'Simulate contiguous partition allocation (First/Best/Worst Fit), MMU page-to-frame translation, segmentation boundary limit checks, and FIFO/LRU/Optimal page replacement.',
    href: '/memory-management',
    icon: Layers,
    accent: '#9cf944',
    stats: '4 Systems',
  },
  {
    id: 'process-management',
    title: 'Process Lifecycle & PCB Lab',
    tagline: 'State Machines & Hardware Context',
    description:
      'Control the 5-state process machine (New, Ready, Running, Waiting, Terminated). Trigger timer interrupts, simulate I/O traps, and inspect hardware CPU registers inside the PCB.',
    href: '/process-management',
    icon: Activity,
    accent: '#fbbf24',
    stats: 'PCB State Engine',
  },
  {
    id: 'deadlock-management',
    title: 'Deadlock Management Lab',
    tagline: "Banker's Algorithm & Resource Graphs",
    description:
      "Dijkstra's Banker's algorithm safe sequence derivation, dynamic resource request evaluations, and cycle detection in multi-instance Resource Allocation Graphs.",
    href: '/deadlock-management',
    icon: ShieldAlert,
    accent: '#f43f5e',
    stats: "Banker's & RAG",
  },
];

export default function HomePage() {
  const [completedCount, setCompletedCount] = useState<number>(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('os_playground_completed_challenges');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) setCompletedCount(arr.length);
      }
    } catch {
      // storage fallback
    }
  }, []);

  const featuredChallenges = CHALLENGES.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Laboratory Hero Section */}
      <div className="relative overflow-hidden rounded-xl border border-[#1e2433] bg-[#0c0e14] p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#9cf944]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded border border-[#2d3a2e] bg-[#142015] px-3 py-1 text-xs font-mono text-[#9cf944]">
            <Terminal className="h-3.5 w-3.5" />
            <span>OPERATING SYSTEM LABORATORY ENVIRONMENT</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#9cf944] animate-pulse" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            Learn by Breaking. <br className="hidden sm:inline" />
            Understand by Building.
          </h1>

          <p className="text-sm text-slate-300 font-mono leading-relaxed">
            Welcome to <strong className="text-white">OS Playground</strong> — an interactive engineering platform where you configure processes, execute core kernel algorithms, observe hardware register context switches, and diagnose real-world operating system trade-offs.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/cpu-scheduling"
              className="flex items-center gap-2 rounded border border-[#2d3a2e] bg-[#162217] px-4 py-2 text-xs font-mono font-bold text-[#9cf944] hover:bg-[#1b2b1c] transition-colors shadow-sm"
            >
              <Cpu className="h-4 w-4" />
              <span>Launch CPU Simulator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/comparison"
              className="flex items-center gap-2 rounded border border-[#232a3b] bg-[#131722] px-4 py-2 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              <GitCompare className="h-4 w-4 text-slate-400" />
              <span>Run Benchmarks</span>
            </Link>

            <Link
              href="/challenges"
              className="flex items-center gap-2 rounded border border-[#232a3b] bg-[#131722] px-4 py-2 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              <Award className="h-4 w-4 text-[#9cf944]" />
              <span>Solve Challenges ({completedCount} Solved)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Major Laboratory Modules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="font-semibold text-white uppercase font-sans">
            Core Operating System Simulators
          </span>
          <span>4 Specialized Laboratories</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LAB_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.id}
                href={mod.href}
                className="group flex flex-col justify-between rounded-lg border border-[#1e2433] bg-[#0c0e14] p-5 transition-all hover:border-slate-600 hover:bg-[#10131c]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded border border-white/10"
                      style={{ backgroundColor: `${mod.accent}15`, color: mod.accent }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="rounded border border-[#232a3b] bg-[#141822] px-2 py-0.5 text-[10px] font-mono text-slate-400">
                      {mod.stats}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white font-sans group-hover:text-[#9cf944] transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">{mod.tagline}</p>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs font-mono text-[#9cf944] opacity-80 group-hover:opacity-100">
                  <span>Enter Simulator</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Learning Challenges Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="font-semibold text-white uppercase font-sans">
            Featured Diagnostics & Challenges
          </span>
          <Link href="/challenges" className="text-[#9cf944] hover:underline">
            View All ({CHALLENGES.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {featuredChallenges.map((challenge) => (
            <Link
              key={challenge.id}
              href="/challenges"
              className="rounded-lg border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono space-y-2 hover:border-slate-600 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="rounded border border-sky-800/60 bg-sky-950/30 px-1.5 py-0.5 text-[9px] font-mono text-sky-400 uppercase">
                  {challenge.category}
                </span>
                <h4 className="text-sm font-bold text-white font-sans">{challenge.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {challenge.scenario}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-[#9cf944] pt-2">
                <span>Solve challenge</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Cpu,
  Layers,
  Activity,
  ShieldAlert,
  GitCompare,
  BookOpen,
  Award,
  Terminal,
  FolderArchive,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  {
    category: 'SIMULATORS',
    items: [
      { name: 'CPU Scheduling', href: '/cpu-scheduling', icon: Cpu, badge: '6 Algos' },
      { name: 'Memory Management', href: '/memory-management', icon: Layers, badge: '4 Modes' },
      { name: 'Process Lifecycle', href: '/process-management', icon: Activity, badge: 'PCB' },
      { name: 'Deadlock Lab', href: '/deadlock-management', icon: ShieldAlert, badge: "Banker's" },
    ],
  },
  {
    category: 'ANALYSIS & BENCHMARK',
    items: [
      { name: 'Algorithm Comparison', href: '/comparison', icon: GitCompare },
      { name: 'Challenge Mode', href: '/challenges', icon: Award, badge: 'Interactive' },
    ],
  },
  {
    category: 'KNOWLEDGE & HISTORY',
    items: [
      { name: 'Learning Resources', href: '/learning', icon: BookOpen },
      { name: 'Saved Experiments', href: '/experiments', icon: FolderArchive },
    ],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-[#1e2433] bg-[#0c0e14] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#1e2433] px-5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-[#2d3a2e] bg-[#162217] text-[#9cf944] shadow-sm transition-colors group-hover:border-[#9cf944]/50">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-bold tracking-tight text-white">OS PLAYGROUND</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9cf944] animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">LABORATORY v1.0</p>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_ITEMS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                {section.category}
              </h3>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'border border-[#2d3a2e] bg-[#131b14] text-[#9cf944]'
                          : 'text-slate-300 hover:bg-[#141822] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive ? 'text-[#9cf944]' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-mono ${
                            isActive
                              ? 'bg-[#1e2e1f] text-[#9cf944] border border-[#2d402e]'
                              : 'bg-[#181d28] text-slate-400 border border-[#232a3b]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Hardware Spec Tag */}
        <div className="border-t border-[#1e2433] bg-[#090b10] p-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">ENGINE</span>
            <span className="text-[#9cf944] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9cf944]"></span>
              CLIENT SIMULATOR
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
            <span>DETERMINISTIC</span>
            <span>100% PURE ALGO</span>
          </div>
        </div>
      </aside>
    </>
  );
}

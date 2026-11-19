'use client';

import React from 'react';
import { ProcessControlBlock, ProcessState } from '@/types/process';

interface StateDiagramProps {
  processes: ProcessControlBlock[];
  selectedPid: string | null;
  onSelectProcess: (pid: string) => void;
}

const STATE_POSITIONS: Record<ProcessState, { x: number; y: number; label: string }> = {
  NEW: { x: 80, y: 150, label: 'NEW' },
  READY: { x: 260, y: 150, label: 'READY' },
  RUNNING: { x: 480, y: 150, label: 'RUNNING' },
  WAITING: { x: 370, y: 280, label: 'WAITING / BLOCKED' },
  TERMINATED: { x: 670, y: 150, label: 'TERMINATED' },
};

export function StateDiagram({
  processes,
  selectedPid,
  onSelectProcess,
}: StateDiagramProps) {
  // Group processes by current state
  const processesByState: Record<ProcessState, ProcessControlBlock[]> = {
    NEW: [],
    READY: [],
    RUNNING: [],
    WAITING: [],
    TERMINATED: [],
  };

  processes.forEach((p) => {
    processesByState[p.state].push(p);
  });

  return (
    <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono space-y-2">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-semibold text-white uppercase font-sans">
          Dynamic Process State Machine
        </span>
        <span>Click any process token to inspect its Process Control Block (PCB)</span>
      </div>

      <div className="relative w-full overflow-x-auto rounded border border-[#181d28] bg-[#080a0e] p-2">
        <svg
          viewBox="0 0 760 340"
          className="w-full min-w-[700px] h-auto select-none"
          shapeRendering="geometricPrecision"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#9cf944" />
            </marker>
          </defs>

          {/* Transitions Lines & Labels */}
          {/* NEW -> READY (Admit) */}
          <path
            d="M 130 150 L 210 150"
            stroke="#475569"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <text x="170" y="140" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
            Admit
          </text>

          {/* READY -> RUNNING (Dispatch) */}
          <path
            d="M 310 140 L 430 140"
            stroke="#475569"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <text x="370" y="132" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
            Scheduler Dispatch
          </text>

          {/* RUNNING -> READY (Timer Interrupt) */}
          <path
            d="M 430 160 L 310 160"
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="4 2"
            markerEnd="url(#arrow)"
          />
          <text x="370" y="174" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
            Interrupt (Preempt)
          </text>

          {/* RUNNING -> TERMINATED (Exit) */}
          <path
            d="M 530 150 L 620 150"
            stroke="#475569"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <text x="575" y="140" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
            Exit
          </text>

          {/* RUNNING -> WAITING (I/O or event wait) */}
          <path
            d="M 480 185 C 480 230, 440 280, 420 280"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <text x="475" y="240" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
            I/O Wait
          </text>

          {/* WAITING -> READY (I/O completion) */}
          <path
            d="M 320 280 C 290 280, 260 230, 260 185"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
          <text x="260" y="240" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
            I/O Done
          </text>

          {/* State Nodes */}
          {Object.entries(STATE_POSITIONS).map(([stateKey, pos]) => {
            const state = stateKey as ProcessState;
            const procsInState = processesByState[state];
            const hasProcesses = procsInState.length > 0;
            const isRunning = state === 'RUNNING' && hasProcesses;

            return (
              <g key={state} transform={`translate(${pos.x}, ${pos.y})`}>
                {/* State Container Circle/Capsule */}
                <rect
                  x="-50"
                  y="-35"
                  width="100"
                  height="70"
                  rx="8"
                  className={`transition-colors ${
                    isRunning
                      ? 'fill-[#121f14] stroke-[#9cf944] stroke-2'
                      : hasProcesses
                      ? 'fill-[#131722] stroke-sky-400 stroke-1'
                      : 'fill-[#0d1017] stroke-[#232a3b] stroke-1'
                  }`}
                />
                <text
                  x="0"
                  y="-18"
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-bold ${
                    isRunning ? 'fill-[#9cf944]' : 'fill-slate-300'
                  }`}
                >
                  {pos.label}
                </text>

                {/* Tokens for processes currently in this state */}
                <g transform="translate(0, 10)">
                  {procsInState.length === 0 ? (
                    <text
                      x="0"
                      y="5"
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      Empty
                    </text>
                  ) : (
                    procsInState.map((proc, idx) => {
                      const isSelected = selectedPid === proc.pid;
                      const offsetX = (idx - (procsInState.length - 1) / 2) * 26;

                      return (
                        <g
                          key={proc.pid}
                          transform={`translate(${offsetX}, 2)`}
                          onClick={() => onSelectProcess(proc.pid)}
                          className="cursor-pointer group"
                        >
                          <circle
                            r="10"
                            className={`transition-transform group-hover:scale-110 ${
                              isSelected
                                ? 'fill-[#9cf944] stroke-white stroke-2'
                                : 'fill-[#1e2736] stroke-slate-500 stroke-1'
                            }`}
                          />
                          <text
                            x="0"
                            y="3.5"
                            textAnchor="middle"
                            className={`text-[9px] font-mono font-bold pointer-events-none ${
                              isSelected ? 'fill-slate-950' : 'fill-white'
                            }`}
                          >
                            {proc.pid}
                          </text>
                        </g>
                      );
                    })
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

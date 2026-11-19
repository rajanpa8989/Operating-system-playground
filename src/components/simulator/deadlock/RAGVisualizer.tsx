'use client';

import React, { useState, useMemo } from 'react';
import { RAGGraph, RAGNode, RAGEdge } from '@/types/deadlock';
import { detectRAGCycles } from '@/algorithms/deadlock';
import { DEADLOCK_PRESETS } from '@/content/presets';
import { ShieldAlert, ShieldCheck, Plus, Trash2, RotateCcw } from 'lucide-react';

export function RAGVisualizer() {
  const [graph, setGraph] = useState<RAGGraph>(DEADLOCK_PRESETS.deadlockedRAG);
  const [fromNode, setFromNode] = useState<string>('P1');
  const [toNode, setToNode] = useState<string>('R2');

  const cycleResult = useMemo(() => {
    return detectRAGCycles(graph);
  }, [graph]);

  // Layout node positions dynamically
  const nodePositions: Record<string, { x: number; y: number }> = {
    P1: { x: 120, y: 100 },
    P2: { x: 380, y: 100 },
    P3: { x: 250, y: 250 },
    R1: { x: 250, y: 60 },
    R2: { x: 250, y: 170 },
    R3: { x: 450, y: 250 },
  };

  const handleAddEdge = () => {
    if (fromNode === toNode) return;
    const exists = graph.edges.some((e) => e.from === fromNode && e.to === toNode);
    if (exists) return;

    const fromIsProcess = graph.nodes.find((n) => n.id === fromNode)?.type === 'process';
    const newEdge: RAGEdge = {
      id: `edge-${Date.now()}`,
      from: fromNode,
      to: toNode,
      type: fromIsProcess ? 'request' : 'allocation',
    };
    setGraph({ ...graph, edges: [...graph.edges, newEdge] });
  };

  const handleRemoveEdge = (edgeId: string) => {
    setGraph({ ...graph, edges: graph.edges.filter((e) => e.id !== edgeId) });
  };

  const handleReset = () => {
    setGraph(DEADLOCK_PRESETS.deadlockedRAG);
  };

  return (
    <div className="space-y-4 rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2433] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white font-sans">
            Resource Allocation Graph (RAG) & Cycle Detection
          </h3>
          <p className="text-[11px] text-slate-400">
            Directed graph modeling processes, resources, claims, and cycle conditions.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded border border-[#232a3b] bg-[#141822] px-2.5 py-1 text-slate-300 hover:text-white"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Preset</span>
        </button>
      </div>

      {/* Cycle Status Diagnostic */}
      <div
        className={`flex items-start gap-3 rounded border p-3 ${
          cycleResult.hasCycle
            ? 'border-rose-900/60 bg-rose-950/20 text-rose-300'
            : 'border-[#2d402e] bg-[#121c13] text-[#9cf944]'
        }`}
      >
        {cycleResult.hasCycle ? (
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="font-bold text-sm">
            {cycleResult.hasCycle ? 'CYCLE DETECTED IN RAG' : 'GRAPH IS ACYCLIC (NO DEADLOCK)'}
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {cycleResult.explanation}
          </p>
        </div>
      </div>

      {/* Interactive SVG Diagram */}
      <div className="relative w-full overflow-x-auto rounded border border-[#1e2433] bg-[#080a0e] p-3">
        <svg
          viewBox="0 0 600 320"
          className="w-full min-w-[500px] h-auto select-none"
          shapeRendering="geometricPrecision"
        >
          <defs>
            <marker
              id="rag-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
            </marker>
            <marker
              id="rag-arrow-cycle"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Render Edges */}
          {graph.edges.map((edge) => {
            const fromPos = nodePositions[edge.from] || { x: 50, y: 50 };
            const toPos = nodePositions[edge.to] || { x: 100, y: 100 };

            // Determine if edge participates in a cycle
            const isInCycle = cycleResult.cycles.some((cycle) => {
              for (let i = 0; i < cycle.length - 1; i++) {
                if (cycle[i] === edge.from && cycle[i + 1] === edge.to) return true;
              }
              return false;
            });

            return (
              <g key={edge.id} className="group">
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={isInCycle ? '#f43f5e' : edge.type === 'request' ? '#38bdf8' : '#9cf944'}
                  strokeWidth={isInCycle ? '2.5' : '1.5'}
                  strokeDasharray={edge.type === 'request' ? '4 2' : 'none'}
                  markerEnd={isInCycle ? 'url(#rag-arrow-cycle)' : 'url(#rag-arrow)'}
                />
              </g>
            );
          })}

          {/* Render Nodes */}
          {graph.nodes.map((node) => {
            const pos = nodePositions[node.id] || { x: 50, y: 50 };
            const isProcess = node.type === 'process';

            return (
              <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                {isProcess ? (
                  /* Circular Process Node */
                  <circle
                    r="22"
                    className="fill-[#131a26] stroke-[#38bdf8] stroke-2 shadow-lg"
                  />
                ) : (
                  /* Square Resource Node */
                  <rect
                    x="-20"
                    y="-20"
                    width="40"
                    height="40"
                    rx="4"
                    className="fill-[#1b241c] stroke-[#9cf944] stroke-2 shadow-lg"
                  />
                )}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  className="text-[10px] font-mono font-bold fill-white pointer-events-none"
                >
                  {node.id}
                </text>
                <text
                  x="0"
                  y="32"
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-400 pointer-events-none"
                >
                  {isProcess ? 'Process' : `Resource (${node.instances ?? 1} inst)`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Add / Remove Edge Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2">
        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-1">From Node</label>
          <select
            value={fromNode}
            onChange={(e) => setFromNode(e.target.value)}
            className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
          >
            {graph.nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} ({n.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase text-slate-400 mb-1">To Node</label>
          <select
            value={toNode}
            onChange={(e) => setToNode(e.target.value)}
            className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
          >
            {graph.nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} ({n.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            onClick={handleAddEdge}
            className="w-full flex items-center justify-center gap-1.5 rounded border border-[#2d3a2e] bg-[#162217] py-2 text-xs font-semibold text-[#9cf944] hover:bg-[#1a2c1b] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Directed Edge</span>
          </button>
        </div>
      </div>

      {/* Edge List for Deletion */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] uppercase text-slate-400 font-semibold">Active Edges:</div>
        <div className="flex flex-wrap gap-2">
          {graph.edges.map((edge) => (
            <div
              key={edge.id}
              className="flex items-center gap-1.5 rounded border border-[#232a3b] bg-[#10131a] px-2 py-1 text-[11px]"
            >
              <span className="text-white font-bold">{edge.from}</span>
              <span className="text-slate-500">→</span>
              <span className="text-white font-bold">{edge.to}</span>
              <span className="text-[9px] text-slate-400">({edge.type})</span>
              <button
                onClick={() => handleRemoveEdge(edge.id)}
                className="ml-1 text-slate-500 hover:text-rose-400"
                title="Remove edge"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

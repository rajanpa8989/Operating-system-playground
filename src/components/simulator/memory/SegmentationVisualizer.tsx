'use client';

import React, { useState } from 'react';
import { SegmentEntry } from '@/types/memory';
import { translateSegmentAddress } from '@/algorithms/memory-management';
import { ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';

const INITIAL_SEGMENT_TABLE: SegmentEntry[] = [
  { segmentId: 0, name: 'Subroutine / Funcs', base: 1400, limit: 1000 },
  { segmentId: 1, name: 'Square Root Lib', base: 6300, limit: 400 },
  { segmentId: 2, name: 'Main Program Code', base: 4300, limit: 400 },
  { segmentId: 3, name: 'User Stack', base: 3200, limit: 1100 },
  { segmentId: 4, name: 'Global Symbol Table', base: 4700, limit: 1000 },
];

export function SegmentationVisualizer() {
  const [segmentTable, setSegmentTable] = useState<SegmentEntry[]>(INITIAL_SEGMENT_TABLE);
  const [selectedSegId, setSelectedSegId] = useState<number>(2);
  const [offsetInput, setOffsetInput] = useState<number>(53);

  const translation = translateSegmentAddress(selectedSegId, offsetInput, segmentTable);

  return (
    <div className="space-y-4 rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono">
      <div className="border-b border-[#1e2433] pb-3">
        <h3 className="text-sm font-bold text-white font-sans">
          Segmentation & Logical Address Translation
        </h3>
        <p className="text-[11px] text-slate-400">
          Explore logical segmentation, limit boundary verification, and segmentation fault traps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Translation Form & Output */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Segment (s)
              </label>
              <select
                value={selectedSegId}
                onChange={(e) => setSelectedSegId(Number(e.target.value))}
                className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
              >
                {segmentTable.map((s) => (
                  <option key={s.segmentId} value={s.segmentId}>
                    Segment {s.segmentId} ({s.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Offset (d in bytes)
              </label>
              <input
                type="number"
                value={offsetInput}
                onChange={(e) => setOffsetInput(Number(e.target.value))}
                className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
              />
            </div>
          </div>

          {/* Translation Decision Box */}
          <div className="rounded border border-[#1e2433] bg-[#10131a] p-3 space-y-2">
            <div className="text-[10px] uppercase text-slate-400 font-semibold">
              MMU Boundary Check:
            </div>

            <div className="text-[11px] text-slate-300">
              Check Condition: Offset <strong className="text-white">{offsetInput}</strong> &lt; Limit{' '}
              <strong className="text-white">{translation.limit}</strong>?{' '}
              <span
                className={`font-bold ${
                  translation.isValid ? 'text-[#9cf944]' : 'text-rose-400'
                }`}
              >
                {translation.isValid ? 'TRUE (LEGAL)' : 'FALSE (VIOLATION)'}
              </span>
            </div>

            {translation.isValid ? (
              <div className="rounded border border-[#2d402e] bg-[#121c13] p-2.5 text-[#9cf944] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Physical Address Generated</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Physical Address = Base ({translation.base}) + Offset ({translation.offset}) ={' '}
                  <strong className="text-white font-mono">{translation.physicalAddress}</strong>
                </div>
              </div>
            ) : (
              <div className="rounded border border-rose-900/60 bg-rose-950/20 p-2.5 text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertOctagon className="h-4 w-4" />
                  <span>Trap: Segmentation Fault (SIGSEGV)</span>
                </div>
                <div className="text-[11px] text-slate-300">{translation.error}</div>
              </div>
            )}
          </div>
        </div>

        {/* Segment Table Display */}
        <div className="rounded border border-[#1e2433] bg-[#10131a] p-3 space-y-2">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">
            ACTIVE SEGMENT TABLE
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#1e2433] bg-[#0c0e14] text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-1.5 px-2">Segment</th>
                  <th className="py-1.5 px-2">Name</th>
                  <th className="py-1.5 px-2">Base Address</th>
                  <th className="py-1.5 px-2">Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2230]">
                {segmentTable.map((seg) => {
                  const isCurrent = seg.segmentId === selectedSegId;
                  return (
                    <tr
                      key={seg.segmentId}
                      className={`hover:bg-[#151a26] transition-colors ${
                        isCurrent ? 'bg-[#182319] border-l-2 border-[#9cf944]' : ''
                      }`}
                    >
                      <td className="py-1.5 px-2 font-bold text-white">Seg {seg.segmentId}</td>
                      <td className="py-1.5 px-2 text-slate-300">{seg.name}</td>
                      <td className="py-1.5 px-2 text-sky-400">{seg.base}</td>
                      <td className="py-1.5 px-2 text-amber-400">{seg.limit} B</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { PageTableEntry } from '@/types/memory';
import { translatePagingAddress } from '@/algorithms/memory-management';
import { Layers, ArrowRight, CheckCircle2, AlertOctagon } from 'lucide-react';

const INITIAL_PAGE_TABLE: PageTableEntry[] = [
  { pageNumber: 0, frameNumber: 5, valid: true },
  { pageNumber: 1, frameNumber: 6, valid: true },
  { pageNumber: 2, frameNumber: 1, valid: true },
  { pageNumber: 3, frameNumber: null, valid: false }, // page fault test
  { pageNumber: 4, frameNumber: 8, valid: true },
];

export function PagingVisualizer() {
  const [pageSize, setPageSize] = useState<number>(1024); // 1 KB
  const [pageTable, setPageTable] = useState<PageTableEntry[]>(INITIAL_PAGE_TABLE);
  const [logicalAddress, setLogicalAddress] = useState<number>(2050);

  const translation = translatePagingAddress(logicalAddress, pageSize, pageTable);

  const toggleValid = (pageNumber: number) => {
    setPageTable((prev) =>
      prev.map((entry) => {
        if (entry.pageNumber === pageNumber) {
          const newValid = !entry.valid;
          return {
            ...entry,
            valid: newValid,
            frameNumber: newValid ? (entry.frameNumber ?? 2) : null,
          };
        }
        return entry;
      })
    );
  };

  return (
    <div className="space-y-4 rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono">
      <div className="border-b border-[#1e2433] pb-3">
        <h3 className="text-sm font-bold text-white font-sans">
          Paging & Address Translation Engine
        </h3>
        <p className="text-[11px] text-slate-400">
          Observe how the Memory Management Unit (MMU) splits logical addresses into page numbers and offsets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Configuration & Translation Breakdown */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Logical Address (Bytes)
              </label>
              <input
                type="number"
                min={0}
                value={logicalAddress}
                onChange={(e) => setLogicalAddress(Math.max(0, Number(e.target.value)))}
                className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-400 mb-1">
                Page Size (Bytes)
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
              >
                <option value={512}>512 B (2^9)</option>
                <option value={1024}>1024 B (1 KB / 2^10)</option>
                <option value={2048}>2048 B (2 KB / 2^11)</option>
                <option value={4096}>4096 B (4 KB / 2^12)</option>
              </select>
            </div>
          </div>

          {/* Mathematical Breakdown Box */}
          <div className="rounded border border-[#1e2433] bg-[#10131a] p-3 space-y-2">
            <div className="text-[10px] uppercase text-slate-400 font-semibold">
              MMU Hardware Translation Pipeline:
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded border border-[#232a3b] bg-[#151924] p-2">
                <span className="text-slate-400 text-[10px] block">PAGE NUMBER (p)</span>
                <span className="text-sky-400 font-bold">
                  {translation.pageNumber}{' '}
                  <span className="text-[9px] text-slate-400">
                    ({logicalAddress} / {pageSize})
                  </span>
                </span>
              </div>

              <div className="rounded border border-[#232a3b] bg-[#151924] p-2">
                <span className="text-slate-400 text-[10px] block">PAGE OFFSET (d)</span>
                <span className="text-amber-400 font-bold">
                  {translation.offset}{' '}
                  <span className="text-[9px] text-slate-400">
                    ({logicalAddress} % {pageSize})
                  </span>
                </span>
              </div>
            </div>

            {/* Translation Output Status */}
            {translation.isValid ? (
              <div className="rounded border border-[#2d402e] bg-[#121c13] p-2.5 text-[#9cf944] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Physical Address Resolved!</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Physical Addr = (Frame {translation.frameNumber} × {pageSize}) + {translation.offset} ={' '}
                  <strong className="text-white font-mono">{translation.physicalAddress}</strong> (0x
                  {translation.physicalAddress?.toString(16).toUpperCase()})
                </div>
              </div>
            ) : (
              <div className="rounded border border-rose-900/60 bg-rose-950/20 p-2.5 text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertOctagon className="h-4 w-4" />
                  <span>Page Fault (Invalid Page)</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {translation.error} Operating system trap invoked to fetch page from swap disk.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Table Interactive Inspector */}
        <div className="rounded border border-[#1e2433] bg-[#10131a] p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>PAGE TABLE (Per-Process)</span>
            <span className="text-[10px] text-slate-400">Click Valid bit to simulate Page Fault</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#1e2433] bg-[#0c0e14] text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-1.5 px-2">Page #</th>
                  <th className="py-1.5 px-2">Frame #</th>
                  <th className="py-1.5 px-2 text-right">Status Bit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2230]">
                {pageTable.map((entry) => {
                  const isCurrent = entry.pageNumber === translation.pageNumber;
                  return (
                    <tr
                      key={entry.pageNumber}
                      className={`hover:bg-[#151a26] transition-colors ${
                        isCurrent ? 'bg-[#182319] border-l-2 border-[#9cf944]' : ''
                      }`}
                    >
                      <td className="py-1.5 px-2 font-bold text-white">
                        Page {entry.pageNumber}
                      </td>
                      <td className="py-1.5 px-2">
                        {entry.valid ? (
                          <span className="text-sky-400 font-semibold">
                            Frame {entry.frameNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None (Disk)</span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-right">
                        <button
                          onClick={() => toggleValid(entry.pageNumber)}
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            entry.valid
                              ? 'border border-[#2d402e] bg-[#142215] text-[#9cf944]'
                              : 'border border-rose-900/60 bg-rose-950/40 text-rose-400'
                          }`}
                        >
                          {entry.valid ? '1 (VALID)' : '0 (INVALID)'}
                        </button>
                      </td>
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

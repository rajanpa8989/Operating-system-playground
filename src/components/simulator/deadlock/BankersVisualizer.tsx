'use client';

import React, { useState, useMemo } from 'react';
import { BankersInput } from '@/types/deadlock';
import { checkBankersSafety, requestResources, calculateNeedMatrix } from '@/algorithms/deadlock';
import { DEADLOCK_PRESETS } from '@/content/presets';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertOctagon, RotateCcw, ArrowRight } from 'lucide-react';

export function BankersVisualizer() {
  const [bankersInput, setBankersInput] = useState<BankersInput>(DEADLOCK_PRESETS.classicBankers);
  const [selectedProcessIdx, setSelectedProcessIdx] = useState<number>(1);
  const [requestInput, setRequestInput] = useState<number[]>([1, 0, 2]);
  const [requestLog, setRequestLog] = useState<{
    granted: boolean;
    message: string;
  } | null>(null);

  const safetyResult = useMemo(() => {
    return checkBankersSafety(bankersInput);
  }, [bankersInput]);

  const needMatrix = useMemo(() => {
    return calculateNeedMatrix(bankersInput.max, bankersInput.allocation);
  }, [bankersInput.max, bankersInput.allocation]);

  const handleUpdateAllocation = (pIdx: number, rIdx: number, val: number) => {
    const updated = bankersInput.allocation.map((row, i) =>
      i === pIdx ? row.map((v, j) => (j === rIdx ? Math.max(0, val) : v)) : [...row]
    );
    setBankersInput({ ...bankersInput, allocation: updated });
    setRequestLog(null);
  };

  const handleUpdateMax = (pIdx: number, rIdx: number, val: number) => {
    const updated = bankersInput.max.map((row, i) =>
      i === pIdx ? row.map((v, j) => (j === rIdx ? Math.max(0, val) : v)) : [...row]
    );
    setBankersInput({ ...bankersInput, max: updated });
    setRequestLog(null);
  };

  const handleUpdateAvailable = (rIdx: number, val: number) => {
    const updated = bankersInput.available.map((v, j) => (j === rIdx ? Math.max(0, val) : v));
    setBankersInput({ ...bankersInput, available: updated });
    setRequestLog(null);
  };

  const handleExecuteRequest = () => {
    const res = requestResources(bankersInput, selectedProcessIdx, requestInput);
    setRequestLog({
      granted: res.granted,
      message: res.message,
    });
    if (res.granted && res.updatedAvailable && res.updatedAllocation) {
      setBankersInput({
        ...bankersInput,
        available: res.updatedAvailable,
        allocation: res.updatedAllocation,
      });
    }
  };

  const handleReset = () => {
    setBankersInput(DEADLOCK_PRESETS.classicBankers);
    setSelectedProcessIdx(1);
    setRequestInput([1, 0, 2]);
    setRequestLog(null);
  };

  return (
    <div className="space-y-4 rounded border border-[#1e2433] bg-[#0c0e14] p-4 text-xs font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2433] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white font-sans">
            Banker&apos;s Algorithm (Safety & Resource Request)
          </h3>
          <p className="text-[11px] text-slate-400">
            Dijkstra&apos;s deadlock avoidance algorithm evaluating safety sequences and dynamic resource requests.
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

      {/* Safety Status Banner */}
      <div
        className={`flex items-start gap-3 rounded border p-3 ${
          safetyResult.isSafe
            ? 'border-[#2d402e] bg-[#121c13] text-[#9cf944]'
            : 'border-rose-900/60 bg-rose-950/20 text-rose-300'
        }`}
      >
        {safetyResult.isSafe ? (
          <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="font-bold text-sm">
            System State: {safetyResult.isSafe ? 'SAFE STATE' : 'UNSAFE STATE (Deadlock Risk)'}
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {safetyResult.explanation}
          </p>
        </div>
      </div>

      {/* Available Vector Input */}
      <div className="rounded border border-[#1e2433] bg-[#10131a] p-3 space-y-2">
        <span className="text-[10px] text-slate-400 font-semibold uppercase block">
          Current Available Resources Vector:
        </span>
        <div className="flex flex-wrap gap-3">
          {bankersInput.resourceNames.map((rName, rIdx) => (
            <div key={rName} className="flex items-center gap-2">
              <span className="font-bold text-white">Resource {rName}:</span>
              <input
                type="number"
                min={0}
                value={bankersInput.available[rIdx]}
                onChange={(e) => handleUpdateAvailable(rIdx, Number(e.target.value))}
                className="w-16 rounded border border-[#232a3b] bg-[#161b26] px-2 py-1 text-xs text-white font-bold focus:border-[#9cf944] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Matrices Table: Allocation, Max, and Computed Need */}
      <div className="overflow-x-auto rounded border border-[#1e2433] bg-[#10131a] p-3">
        <div className="text-[10px] text-slate-400 font-semibold uppercase mb-2">
          System Allocation, Maximum Claim, and Calculated Need Matrices:
        </div>

        <table className="w-full text-center text-xs font-mono">
          <thead className="border-b border-[#1e2433] bg-[#0c0e14] text-slate-400 text-[10px] uppercase">
            <tr>
              <th className="py-2 px-3 text-left">Process</th>
              <th className="py-2 px-3">
                Allocation ({bankersInput.resourceNames.join(', ')})
              </th>
              <th className="py-2 px-3">
                Max Claim ({bankersInput.resourceNames.join(', ')})
              </th>
              <th className="py-2 px-3 text-[#9cf944]">
                Need = Max - Alloc ({bankersInput.resourceNames.join(', ')})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181d28]">
            {bankersInput.processNames.map((pName, pIdx) => (
              <tr key={pName} className="hover:bg-[#121620]">
                <td className="py-2 px-3 text-left font-bold text-white">{pName}</td>
                {/* Allocation inputs */}
                <td className="py-2 px-3">
                  <div className="flex justify-center gap-1.5">
                    {bankersInput.allocation[pIdx].map((val, rIdx) => (
                      <input
                        key={rIdx}
                        type="number"
                        min={0}
                        value={val}
                        onChange={(e) =>
                          handleUpdateAllocation(pIdx, rIdx, Number(e.target.value))
                        }
                        className="w-10 rounded border border-[#232a3b] bg-[#161b26] p-1 text-center text-xs text-white focus:border-[#9cf944] focus:outline-none"
                      />
                    ))}
                  </div>
                </td>
                {/* Max inputs */}
                <td className="py-2 px-3">
                  <div className="flex justify-center gap-1.5">
                    {bankersInput.max[pIdx].map((val, rIdx) => (
                      <input
                        key={rIdx}
                        type="number"
                        min={0}
                        value={val}
                        onChange={(e) =>
                          handleUpdateMax(pIdx, rIdx, Number(e.target.value))
                        }
                        className="w-10 rounded border border-[#232a3b] bg-[#161b26] p-1 text-center text-xs text-white focus:border-[#9cf944] focus:outline-none"
                      />
                    ))}
                  </div>
                </td>
                {/* Computed Need */}
                <td className="py-2 px-3 font-bold text-[#9cf944]">
                  [{needMatrix[pIdx].join(', ')}]
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Safety Execution Sequence Step Trace */}
      {safetyResult.isSafe && (
        <div className="rounded border border-[#1e2433] bg-[#10131a] p-3 space-y-2">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">
            Safety Algorithm Step-by-Step Derivation:
          </div>
          <div className="space-y-1.5">
            {safetyResult.steps.map((step) => (
              <div
                key={step.stepIndex}
                className="flex items-start gap-2 rounded border border-[#232a3b] bg-[#141822] p-2 text-[11px]"
              >
                <span className="rounded bg-[#1b251c] px-1.5 py-0.5 text-[10px] font-bold text-[#9cf944] shrink-0">
                  Step {step.stepIndex}
                </span>
                <span className="text-slate-300">{step.explanation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Request Tester Form */}
      <div className="rounded border border-[#1e2433] bg-[#10131a] p-3 space-y-3">
        <div className="text-[11px] font-semibold text-white uppercase">
          Dynamic Resource Request Tester:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[10px] uppercase text-slate-400 mb-1">
              Requesting Process
            </label>
            <select
              value={selectedProcessIdx}
              onChange={(e) => setSelectedProcessIdx(Number(e.target.value))}
              className="w-full rounded border border-[#232a3b] bg-[#121620] px-2.5 py-1.5 text-xs text-white focus:border-[#9cf944] focus:outline-none"
            >
              {bankersInput.processNames.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-slate-400 mb-1">
              Requested Vector ({bankersInput.resourceNames.join(', ')})
            </label>
            <div className="flex gap-1.5">
              {bankersInput.resourceNames.map((_, rIdx) => (
                <input
                  key={rIdx}
                  type="number"
                  min={0}
                  value={requestInput[rIdx] ?? 0}
                  onChange={(e) => {
                    const updated = [...requestInput];
                    updated[rIdx] = Math.max(0, Number(e.target.value));
                    setRequestInput(updated);
                  }}
                  className="w-12 rounded border border-[#232a3b] bg-[#161b26] p-1.5 text-center text-xs text-white font-bold focus:border-[#9cf944] focus:outline-none"
                />
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={handleExecuteRequest}
              className="w-full rounded border border-[#2d3a2e] bg-[#162217] py-2 text-xs font-semibold text-[#9cf944] hover:bg-[#1a2c1b] transition-colors"
            >
              Evaluate Request
            </button>
          </div>
        </div>

        {requestLog && (
          <div
            className={`rounded border p-2.5 text-xs ${
              requestLog.granted
                ? 'border-[#2d402e] bg-[#121c13] text-[#9cf944]'
                : 'border-rose-900/60 bg-rose-950/20 text-rose-300'
            }`}
          >
            {requestLog.message}
          </div>
        )}
      </div>
    </div>
  );
}

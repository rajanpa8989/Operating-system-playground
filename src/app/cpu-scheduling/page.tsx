'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ProcessInput, CPUSchedulerType } from '@/types/cpu-scheduling';
import { runCPUScheduler } from '@/algorithms/cpu-scheduling';
import { GanttChart } from '@/components/simulator/cpu/GanttChart';
import { QueueVisualizer } from '@/components/simulator/cpu/QueueVisualizer';
import { PlaybackControls } from '@/components/simulator/cpu/PlaybackControls';
import { MetricsTable } from '@/components/simulator/cpu/MetricsTable';
import { ProcessInputEditor } from '@/components/simulator/cpu/ProcessInputEditor';
import { TOPIC_GUIDES } from '@/content/topics';
import { Cpu, Info, Zap } from 'lucide-react';

const INITIAL_PROCESSES: ProcessInput[] = [
  { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, color: '#38bdf8' },
  { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, color: '#9cf944' },
  { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 3, color: '#fbbf24' },
  { id: 'P4', arrivalTime: 3, burstTime: 6, priority: 4, color: '#f43f5e' },
];

export default function CPUSchedulingPage() {
  const [processes, setProcesses] = useState<ProcessInput[]>(INITIAL_PROCESSES);
  const [algorithm, setAlgorithm] = useState<CPUSchedulerType>('srtf');
  const [timeQuantum, setTimeQuantum] = useState<number>(3);
  const [lowerPriorityIsHigher, setLowerPriorityIsHigher] = useState<boolean>(true);

  // Simulation playback state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute simulation result deterministically from inputs
  const simulationResult = useMemo(() => {
    return runCPUScheduler(algorithm, processes, {
      timeQuantum,
      lowerPriorityIsHigher,
    });
  }, [algorithm, processes, timeQuantum, lowerPriorityIsHigher]);

  const totalSteps = simulationResult.steps.length;

  // Reset step index when algorithm or inputs change
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [simulationResult]);

  // Handle Playback Interval
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(150, 1000 / speed);
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, totalSteps]);

  // Current step state snapshot
  const currentStep = simulationResult.steps[currentStepIndex] || {
    time: 0,
    runningProcessId: null,
    readyQueue: [],
    remainingBurstTimes: {},
    completedProcessIds: [],
    eventDescription: 'Ready.',
  };

  const processColors = useMemo(() => {
    const map: Record<string, string> = {};
    processes.forEach((p) => {
      if (p.color) map[p.id] = p.color;
    });
    return map;
  }, [processes]);

  // Lookup topic guide
  const guideKey = algorithm.includes('fcfs')
    ? 'fcfs'
    : algorithm.includes('sjf') || algorithm.includes('srtf')
    ? 'sjf'
    : algorithm === 'rr'
    ? 'roundRobin'
    : 'fcfs';
  const guide = TOPIC_GUIDES[guideKey];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2433] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#2d3a2e] bg-[#142015] text-[#9cf944]">
              <Cpu className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              CPU Scheduling Simulator
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Execute and observe kernel dispatching algorithms with deterministic tie-breaking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded border border-[#1e2433] bg-[#0c0e14] px-2.5 py-1 text-[11px] font-mono text-slate-300">
            Active: <strong className="text-[#9cf944]">{simulationResult.algorithm}</strong>
          </span>
        </div>
      </div>

      {/* Process Input Configuration Panel */}
      <ProcessInputEditor
        processes={processes}
        selectedAlgorithm={algorithm}
        timeQuantum={timeQuantum}
        lowerPriorityIsHigher={lowerPriorityIsHigher}
        onProcessesChange={setProcesses}
        onAlgorithmChange={setAlgorithm}
        onTimeQuantumChange={setTimeQuantum}
        onPriorityOrderChange={setLowerPriorityIsHigher}
        onReset={() => setProcesses(INITIAL_PROCESSES)}
      />

      {/* Playback & Queue Visualization */}
      <div className="space-y-4">
        <PlaybackControls
          isPlaying={isPlaying}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          speed={speed}
          onPlayPause={() => setIsPlaying((p) => !p)}
          onStepForward={() => setCurrentStepIndex((p) => Math.min(totalSteps - 1, p + 1))}
          onStepBackward={() => setCurrentStepIndex((p) => Math.max(0, p - 1))}
          onReset={() => {
            setIsPlaying(false);
            setCurrentStepIndex(0);
          }}
          onSpeedChange={setSpeed}
          onScrub={setCurrentStepIndex}
        />

        <QueueVisualizer
          runningProcessId={currentStep.runningProcessId}
          readyQueue={currentStep.readyQueue}
          completedProcessIds={currentStep.completedProcessIds}
          remainingBurstTimes={currentStep.remainingBurstTimes}
          currentTime={currentStep.time}
          eventDescription={currentStep.eventDescription}
          processColors={processColors}
        />

        {/* Dynamic Gantt Chart */}
        <GanttChart
          segments={simulationResult.gantt}
          currentTime={currentStep.time}
          totalTime={simulationResult.totalTime}
          processColors={processColors}
        />
      </div>

      {/* Metrics Output */}
      <MetricsTable
        metrics={simulationResult.metrics}
        avgWaitingTime={simulationResult.avgWaitingTime}
        avgTurnaroundTime={simulationResult.avgTurnaroundTime}
        avgResponseTime={simulationResult.avgResponseTime}
        cpuUtilization={simulationResult.cpuUtilization}
        throughput={simulationResult.throughput}
        contextSwitches={simulationResult.contextSwitches}
        processColors={processColors}
      />

      {/* Contextual Deep Theory Card */}
      {guide && (
        <div className="rounded border border-[#1e2433] bg-[#0c0e14] p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Info className="h-4 w-4 text-[#9cf944]" />
            <span>Algorithm Mechanics: {guide.title}</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            {guide.conceptIntro}
          </p>
          <div className="rounded border border-[#1b2230] bg-[#10131a] p-3 text-[11px] text-slate-400 space-y-1">
            <div>
              <strong className="text-slate-200">Real-World Analogy: </strong>
              <span>{guide.realWorldAnalogy}</span>
            </div>
            <div>
              <strong className="text-slate-200">Time Complexity: </strong>
              <span className="text-[#9cf944]">{guide.timeComplexity}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

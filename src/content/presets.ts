import { ProcessInput } from '@/types/cpu-scheduling';
import { MemoryBlock } from '@/types/memory';
import { BankersInput, RAGGraph } from '@/types/deadlock';

export interface CPUPreset {
  id: string;
  name: string;
  description: string;
  processes: ProcessInput[];
  defaultQuantum?: number;
}

export const CPU_PRESETS: CPUPreset[] = [
  {
    id: 'convoy-effect',
    name: 'The Convoy Effect',
    description: 'Demonstrates how a single compute-heavy task stalls shorter jobs under FCFS.',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 24, priority: 3, color: '#38bdf8' },
      { id: 'P2', arrivalTime: 0, burstTime: 3, priority: 1, color: '#9cf944' },
      { id: 'P3', arrivalTime: 0, burstTime: 3, priority: 2, color: '#fbbf24' },
    ],
    defaultQuantum: 4,
  },
  {
    id: 'interactive-mix',
    name: 'Mixed Workload (Staggered Arrivals)',
    description: 'Realistic mix of staggered arrivals with varying burst requirements and priorities.',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, color: '#38bdf8' },
      { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, color: '#9cf944' },
      { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 4, color: '#fbbf24' },
      { id: 'P4', arrivalTime: 3, burstTime: 6, priority: 3, color: '#a855f7' },
    ],
    defaultQuantum: 3,
  },
  {
    id: 'priority-starvation',
    name: 'Priority Starvation Scenario',
    description: 'Continuous arrival of high-priority jobs starving lower priority tasks.',
    processes: [
      { id: 'P1 (Low)', arrivalTime: 0, burstTime: 10, priority: 5, color: '#94a3b8' },
      { id: 'P2 (High)', arrivalTime: 1, burstTime: 2, priority: 1, color: '#9cf944' },
      { id: 'P3 (High)', arrivalTime: 3, burstTime: 3, priority: 1, color: '#38bdf8' },
      { id: 'P4 (High)', arrivalTime: 5, burstTime: 2, priority: 1, color: '#fbbf24' },
    ],
    defaultQuantum: 2,
  },
  {
    id: 'equal-bursts',
    name: 'Equal Bursts Round Robin Sensitivity',
    description: '4 processes of identical length to evaluate time slice turnaround degradation.',
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 6, priority: 1, color: '#38bdf8' },
      { id: 'P2', arrivalTime: 0, burstTime: 6, priority: 1, color: '#9cf944' },
      { id: 'P3', arrivalTime: 0, burstTime: 6, priority: 1, color: '#fbbf24' },
      { id: 'P4', arrivalTime: 0, burstTime: 6, priority: 1, color: '#f43f5e' },
    ],
    defaultQuantum: 2,
  },
];

export const MEMORY_PRESETS = {
  contiguousInitialBlocks: [
    { id: 'b1', startAddress: 0, size: 100, processId: null },
    { id: 'b2', startAddress: 100, size: 500, processId: null },
    { id: 'b3', startAddress: 600, size: 200, processId: null },
    { id: 'b4', startAddress: 800, size: 300, processId: null },
    { id: 'b5', startAddress: 1100, size: 600, processId: null },
  ] as MemoryBlock[],
  beladyString: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5],
  textbookRefString: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1],
  localityRefString: [1, 2, 1, 3, 1, 2, 1, 4, 1, 2, 1, 3, 1, 2, 1],
};

export const DEADLOCK_PRESETS = {
  classicBankers: {
    processNames: ['P0', 'P1', 'P2', 'P3', 'P4'],
    resourceNames: ['A', 'B', 'C'],
    available: [3, 3, 2],
    allocation: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
      [0, 0, 2],
    ],
    max: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
      [4, 3, 3],
    ],
  } as BankersInput,
  deadlockedRAG: {
    nodes: [
      { id: 'P1', name: 'P1 (Process)', type: 'process' },
      { id: 'P2', name: 'P2 (Process)', type: 'process' },
      { id: 'P3', name: 'P3 (Process)', type: 'process' },
      { id: 'R1', name: 'R1 (Printer)', type: 'resource', instances: 1 },
      { id: 'R2', name: 'R2 (Disk)', type: 'resource', instances: 1 },
      { id: 'R3', name: 'R3 (Scanner)', type: 'resource', instances: 1 },
    ],
    edges: [
      { id: 'e1', from: 'P1', to: 'R1', type: 'request' },
      { id: 'e2', from: 'R1', to: 'P2', type: 'allocation' },
      { id: 'e3', from: 'P2', to: 'R2', type: 'request' },
      { id: 'e4', from: 'R2', to: 'P1', type: 'allocation' },
      { id: 'e5', from: 'P3', to: 'R3', type: 'request' },
    ],
  } as RAGGraph,
};

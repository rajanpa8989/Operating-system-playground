export interface ProcessInput {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  color?: string;
}

export interface GanttSegment {
  processId: string; // 'IDLE' if CPU was unallocated
  startTime: number;
  endTime: number;
}

export interface ProcessMetric {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  completionTime: number;
  turnaroundTime: number; // CT - AT
  waitingTime: number;    // TAT - BT
  responseTime: number;   // First CPU Time - AT
}

export interface SimulationStep {
  time: number;
  runningProcessId: string | null;
  readyQueue: string[];
  remainingBurstTimes: Record<string, number>;
  completedProcessIds: string[];
  eventDescription: string;
  isContextSwitch?: boolean;
}

export interface CPUSimulationResult {
  algorithm: string;
  gantt: GanttSegment[];
  metrics: ProcessMetric[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  cpuUtilization: number; // percentage e.g. 94.2
  throughput: number;     // processes / totalTime
  contextSwitches: number;
  totalTime: number;
  steps: SimulationStep[];
}

export type CPUSchedulerType =
  | 'fcfs'
  | 'sjf'
  | 'srtf'
  | 'rr'
  | 'priority-non-preemptive'
  | 'priority-preemptive';

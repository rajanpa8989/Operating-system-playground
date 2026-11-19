import { CPUSchedulerType, ProcessInput, CPUSimulationResult } from '@/types/cpu-scheduling';
import { simulateFCFS } from './fcfs';
import { simulateSJF } from './sjf';
import { simulateSRTF } from './srtf';
import { simulateRoundRobin } from './round-robin';
import { simulatePriorityNonPreemptive, simulatePriorityPreemptive } from './priority';

export {
  simulateFCFS,
  simulateSJF,
  simulateSRTF,
  simulateRoundRobin,
  simulatePriorityNonPreemptive,
  simulatePriorityPreemptive,
};

export function runCPUScheduler(
  type: CPUSchedulerType,
  processes: ProcessInput[],
  options: { timeQuantum?: number; lowerPriorityIsHigher?: boolean } = {}
): CPUSimulationResult {
  const quantum = options.timeQuantum ?? 2;
  const lowerIsHigher = options.lowerPriorityIsHigher ?? true;

  switch (type) {
    case 'fcfs':
      return simulateFCFS(processes);
    case 'sjf':
      return simulateSJF(processes);
    case 'srtf':
      return simulateSRTF(processes);
    case 'rr':
      return simulateRoundRobin(processes, quantum);
    case 'priority-non-preemptive':
      return simulatePriorityNonPreemptive(processes, lowerIsHigher);
    case 'priority-preemptive':
      return simulatePriorityPreemptive(processes, lowerIsHigher);
    default:
      return simulateFCFS(processes);
  }
}

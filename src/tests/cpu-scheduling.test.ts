import { describe, it, expect } from 'vitest';
import {
  simulateFCFS,
  simulateSJF,
  simulateSRTF,
  simulateRoundRobin,
  simulatePriorityNonPreemptive,
  simulatePriorityPreemptive,
} from '@/algorithms/cpu-scheduling';
import { ProcessInput } from '@/types/cpu-scheduling';

describe('CPU Scheduling Algorithms', () => {
  const sampleProcesses: ProcessInput[] = [
    { id: 'P1', arrivalTime: 0, burstTime: 4, priority: 2 },
    { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
    { id: 'P3', arrivalTime: 2, burstTime: 1, priority: 3 },
  ];

  describe('FCFS', () => {
    it('handles empty input gracefully', () => {
      const res = simulateFCFS([]);
      expect(res.metrics.length).toBe(0);
      expect(res.totalTime).toBe(0);
    });

    it('correctly schedules sequential processes in arrival order', () => {
      const processes: ProcessInput[] = [
        { id: 'P1', arrivalTime: 0, burstTime: 3 },
        { id: 'P2', arrivalTime: 2, burstTime: 6 },
        { id: 'P3', arrivalTime: 4, burstTime: 4 },
      ];
      const res = simulateFCFS(processes);

      // P1 runs 0 to 3, P2 runs 3 to 9, P3 runs 9 to 13
      expect(res.gantt).toEqual([
        { processId: 'P1', startTime: 0, endTime: 3 },
        { processId: 'P2', startTime: 3, endTime: 9 },
        { processId: 'P3', startTime: 9, endTime: 13 },
      ]);

      const m1 = res.metrics.find((m) => m.id === 'P1')!;
      const m2 = res.metrics.find((m) => m.id === 'P2')!;
      const m3 = res.metrics.find((m) => m.id === 'P3')!;

      // P1: CT 3, TAT 3, WT 0
      expect(m1.completionTime).toBe(3);
      expect(m1.turnaroundTime).toBe(3);
      expect(m1.waitingTime).toBe(0);

      // P2: CT 9, TAT 7, WT 1
      expect(m2.completionTime).toBe(9);
      expect(m2.turnaroundTime).toBe(7);
      expect(m2.waitingTime).toBe(1);

      // P3: CT 13, TAT 9, WT 5
      expect(m3.completionTime).toBe(13);
      expect(m3.turnaroundTime).toBe(9);
      expect(m3.waitingTime).toBe(5);

      expect(res.avgWaitingTime).toBe(2);
      expect(res.avgTurnaroundTime).toBe(6.33);
    });

    it('handles CPU idle periods when arrivals have gaps', () => {
      const processes: ProcessInput[] = [
        { id: 'P1', arrivalTime: 2, burstTime: 2 },
        { id: 'P2', arrivalTime: 6, burstTime: 2 },
      ];
      const res = simulateFCFS(processes);

      expect(res.gantt[0]).toEqual({ processId: 'IDLE', startTime: 0, endTime: 2 });
      expect(res.gantt[1]).toEqual({ processId: 'P1', startTime: 2, endTime: 4 });
      expect(res.gantt[2]).toEqual({ processId: 'IDLE', startTime: 4, endTime: 6 });
      expect(res.gantt[3]).toEqual({ processId: 'P2', startTime: 6, endTime: 8 });
      expect(res.cpuUtilization).toBe(50); // 4 busy out of 8 total
    });
  });

  describe('SJF Non-preemptive', () => {
    it('picks the shortest job among arrived processes', () => {
      const processes: ProcessInput[] = [
        { id: 'P1', arrivalTime: 0, burstTime: 7 },
        { id: 'P2', arrivalTime: 2, burstTime: 4 },
        { id: 'P3', arrivalTime: 4, burstTime: 1 },
        { id: 'P4', arrivalTime: 5, burstTime: 4 },
      ];
      const res = simulateSJF(processes);

      // P1 runs 0..7 (only P1 available at t=0)
      // At t=7: P2 (BT 4), P3 (BT 1), P4 (BT 4) are ready -> P3 chosen
      // P3 runs 7..8
      // At t=8: P2 (BT 4, arr 2) vs P4 (BT 4, arr 5) -> P2 chosen due to earlier arrival
      // P2 runs 8..12
      // P4 runs 12..16
      expect(res.gantt).toEqual([
        { processId: 'P1', startTime: 0, endTime: 7 },
        { processId: 'P3', startTime: 7, endTime: 8 },
        { processId: 'P2', startTime: 8, endTime: 12 },
        { processId: 'P4', startTime: 12, endTime: 16 },
      ]);
    });
  });

  describe('SRTF Preemptive', () => {
    it('preempts a running process when shorter job arrives', () => {
      const processes: ProcessInput[] = [
        { id: 'P1', arrivalTime: 0, burstTime: 8 },
        { id: 'P2', arrivalTime: 1, burstTime: 4 },
        { id: 'P3', arrivalTime: 2, burstTime: 9 },
        { id: 'P4', arrivalTime: 3, burstTime: 5 },
      ];
      const res = simulateSRTF(processes);

      // t=0: P1 runs (remaining 8)
      // t=1: P2 arrives with burst 4. P1 has remaining 7. P2 preempts P1!
      // t=1..5: P2 runs and completes at t=5
      // t=5: P1 (rem 7), P3 (rem 9), P4 (rem 5). Shortest is P4.
      // t=5..10: P4 runs and completes at t=10
      // t=10: P1 (rem 7) vs P3 (rem 9). P1 runs 10..17
      // t=17: P3 runs 17..26
      expect(res.gantt).toEqual([
        { processId: 'P1', startTime: 0, endTime: 1 },
        { processId: 'P2', startTime: 1, endTime: 5 },
        { processId: 'P4', startTime: 5, endTime: 10 },
        { processId: 'P1', startTime: 10, endTime: 17 },
        { processId: 'P3', startTime: 17, endTime: 26 },
      ]);

      const m1 = res.metrics.find((m) => m.id === 'P1')!;
      expect(m1.completionTime).toBe(17);
      expect(m1.turnaroundTime).toBe(17);
      expect(m1.waitingTime).toBe(9);
      expect(m1.responseTime).toBe(0);
    });
  });

  describe('Round Robin', () => {
    it('rotates execution according to time quantum', () => {
      const processes: ProcessInput[] = [
        { id: 'P1', arrivalTime: 0, burstTime: 5 },
        { id: 'P2', arrivalTime: 1, burstTime: 3 },
        { id: 'P3', arrivalTime: 2, burstTime: 1 },
      ];
      // Quantum = 2
      const res = simulateRoundRobin(processes, 2);

      // t=0: P1 starts, runs 0..2 (rem 3). During 0..2, P2(t=1) and P3(t=2) arrive.
      // Queue after t=2: [P2, P3, P1]
      // t=2..4: P2 runs 2 slices (rem 1). Queue: [P3, P1, P2]
      // t=4..5: P3 runs 1 slice and completes. Queue: [P1, P2]
      // t=5..7: P1 runs 2 slices (rem 1). Queue: [P2, P1]
      // t=7..8: P2 runs 1 slice and completes. Queue: [P1]
      // t=8..9: P1 runs 1 slice and completes.
      expect(res.gantt).toEqual([
        { processId: 'P1', startTime: 0, endTime: 2 },
        { processId: 'P2', startTime: 2, endTime: 4 },
        { processId: 'P3', startTime: 4, endTime: 5 },
        { processId: 'P1', startTime: 5, endTime: 7 },
        { processId: 'P2', startTime: 7, endTime: 8 },
        { processId: 'P1', startTime: 8, endTime: 9 },
      ]);
      expect(res.totalTime).toBe(9);
    });
  });

  describe('Priority Scheduling', () => {
    it('executes higher priority jobs first in non-preemptive mode', () => {
      const processes: ProcessInput[] = [
        { id: 'P1', arrivalTime: 0, burstTime: 4, priority: 3 },
        { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 }, // highest prio
        { id: 'P3', arrivalTime: 2, burstTime: 2, priority: 2 },
      ];
      const res = simulatePriorityNonPreemptive(processes, true);

      // P1 runs non-preemptively 0..4
      // At t=4, P2 (prio 1) and P3 (prio 2) are ready -> P2 runs 4..7
      // Then P3 runs 7..9
      expect(res.gantt).toEqual([
        { processId: 'P1', startTime: 0, endTime: 4 },
        { processId: 'P2', startTime: 4, endTime: 7 },
        { processId: 'P3', startTime: 7, endTime: 9 },
      ]);
    });

    it('preempts lower priority jobs when higher priority arrives in preemptive mode', () => {
      const processes: ProcessInput[] = [
        { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 3 },
        { id: 'P2', arrivalTime: 2, burstTime: 2, priority: 1 },
      ];
      const res = simulatePriorityPreemptive(processes, true);

      // P1 runs 0..2
      // At t=2, P2 arrives with priority 1 (higher than P1 prio 3). Preempts P1!
      // P2 runs 2..4
      // P1 resumes 4..7
      expect(res.gantt).toEqual([
        { processId: 'P1', startTime: 0, endTime: 2 },
        { processId: 'P2', startTime: 2, endTime: 4 },
        { processId: 'P1', startTime: 4, endTime: 7 },
      ]);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  checkBankersSafety,
  requestResources,
  calculateNeedMatrix,
  detectDeadlock,
  detectRAGCycles,
} from '@/algorithms/deadlock';
import { BankersInput, RAGGraph } from '@/types/deadlock';

describe('Deadlock Management Algorithms', () => {
  const classicBankers: BankersInput = {
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
  };

  describe("Banker's Safety Algorithm", () => {
    it('correctly calculates the Need matrix', () => {
      const need = calculateNeedMatrix(classicBankers.max, classicBankers.allocation);
      expect(need[0]).toEqual([7, 4, 3]); // P0: 7-0, 5-1, 3-0
      expect(need[1]).toEqual([1, 2, 2]); // P1: 3-2, 2-0, 2-0
      expect(need[2]).toEqual([6, 0, 0]); // P2: 9-3, 0-0, 2-2
      expect(need[3]).toEqual([0, 1, 1]); // P3: 2-2, 2-1, 2-1
      expect(need[4]).toEqual([4, 3, 1]); // P4: 4-0, 3-0, 3-2
    });

    it('identifies safe state and produces a valid safe sequence', () => {
      const result = checkBankersSafety(classicBankers);
      expect(result.isSafe).toBe(true);
      expect(result.safeSequence.length).toBe(5);
      // P1 must be able to run first because Need [1, 2, 2] <= Available [3, 3, 2]
      expect(result.safeSequence[0]).toBe('P1');
    });

    it('identifies unsafe state when available resources are depleted', () => {
      const unsafeInput: BankersInput = {
        ...classicBankers,
        available: [0, 0, 0], // no available resources
      };
      const result = checkBankersSafety(unsafeInput);
      expect(result.isSafe).toBe(false);
      expect(result.safeSequence.length).toBeLessThan(5);
    });
  });

  describe("Banker's Resource Request Algorithm", () => {
    it('grants request that preserves a safe state', () => {
      // P1 requests [1, 0, 2]
      const res = requestResources(classicBankers, 1, [1, 0, 2]);
      expect(res.granted).toBe(true);
      expect(res.updatedAvailable).toEqual([2, 3, 0]); // 3-1, 3-0, 2-2
      expect(res.updatedAllocation![1]).toEqual([3, 0, 2]);
    });

    it('denies request when requested amount exceeds current available resources', () => {
      // P4 Need is [4, 3, 1]. Available is [3, 3, 2].
      // P4 requests [4, 0, 0]: 4 <= Need (4), but 4 > Available (3)!
      const res = requestResources(classicBankers, 4, [4, 0, 0]);
      expect(res.granted).toBe(false);
      expect(res.message).toContain('Resource Wait');
    });

    it('aborts request when requested amount exceeds declared maximum claim', () => {
      // P1 Need is [1, 2, 2]. If P1 asks for [2, 0, 0], request > Need!
      const res = requestResources(classicBankers, 1, [2, 0, 0]);
      expect(res.granted).toBe(false);
      expect(res.message).toContain('exceeds its declared maximum need');
    });
  });

  describe('Deadlock Detection', () => {
    it('detects deadlock in resource-constrained state', () => {
      const processNames = ['P0', 'P1', 'P2'];
      const resourceNames = ['R1', 'R2'];
      const available = [0, 0];
      const allocation = [
        [1, 0],
        [0, 1],
        [0, 0],
      ];
      const request = [
        [0, 1], // P0 holds R1, wants R2
        [1, 0], // P1 holds R2, wants R1 -> Circular wait!
        [0, 0],
      ];
      const res = detectDeadlock(processNames, resourceNames, available, allocation, request);
      expect(res.isDeadlocked).toBe(true);
      expect(res.deadlockedProcesses).toContain('P0');
      expect(res.deadlockedProcesses).toContain('P1');
    });

    it('reports no deadlock when resources can satisfy all requests', () => {
      const processNames = ['P0', 'P1'];
      const resourceNames = ['R1'];
      const available = [1];
      const allocation = [
        [1],
        [0],
      ];
      const request = [
        [0],
        [1], // P1 needs 1 of R1, available has 1
      ];
      const res = detectDeadlock(processNames, resourceNames, available, allocation, request);
      expect(res.isDeadlocked).toBe(false);
    });
  });

  describe('Resource Allocation Graph (RAG)', () => {
    it('detects cycles representing deadlock conditions', () => {
      const graph: RAGGraph = {
        nodes: [
          { id: 'P1', name: 'P1', type: 'process' },
          { id: 'P2', name: 'P2', type: 'process' },
          { id: 'R1', name: 'R1', type: 'resource', instances: 1 },
          { id: 'R2', name: 'R2', type: 'resource', instances: 1 },
        ],
        edges: [
          { id: 'e1', from: 'P1', to: 'R1', type: 'request' },
          { id: 'e2', from: 'R1', to: 'P2', type: 'allocation' },
          { id: 'e3', from: 'P2', to: 'R2', type: 'request' },
          { id: 'e4', from: 'R2', to: 'P1', type: 'allocation' },
        ],
      };
      const res = detectRAGCycles(graph);
      expect(res.hasCycle).toBe(true);
      expect(res.isDeadlockLikely).toBe(true);
    });

    it('verifies acyclic graphs are free of deadlock', () => {
      const graph: RAGGraph = {
        nodes: [
          { id: 'P1', name: 'P1', type: 'process' },
          { id: 'R1', name: 'R1', type: 'resource', instances: 1 },
        ],
        edges: [
          { id: 'e1', from: 'P1', to: 'R1', type: 'request' },
        ],
      };
      const res = detectRAGCycles(graph);
      expect(res.hasCycle).toBe(false);
    });
  });
});

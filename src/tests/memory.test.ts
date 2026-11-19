import { describe, it, expect } from 'vitest';
import {
  allocateMemory,
  deallocateMemory,
  coalesceBlocks,
  translatePagingAddress,
  simulatePageReplacement,
  translateSegmentAddress,
} from '@/algorithms/memory-management';
import { MemoryBlock, PageTableEntry, SegmentEntry } from '@/types/memory';

describe('Memory Management Algorithms', () => {
  describe('Contiguous Allocation', () => {
    const initialBlocks: MemoryBlock[] = [
      { id: 'b1', startAddress: 0, size: 100, processId: null },
      { id: 'b2', startAddress: 100, size: 500, processId: null },
      { id: 'b3', startAddress: 600, size: 200, processId: null },
      { id: 'b4', startAddress: 800, size: 300, processId: null },
      { id: 'b5', startAddress: 1100, size: 600, processId: null },
    ];

    it('allocates First Fit into the first large enough hole', () => {
      // Request 212 KB -> First block >= 212 is b2 (size 500 at 100)
      const res = allocateMemory(initialBlocks, 'P1', 212, 'first-fit');
      expect(res.success).toBe(true);
      const allocated = res.blocks.find((b) => b.processId === 'P1')!;
      expect(allocated.startAddress).toBe(100);
      expect(allocated.size).toBe(212);
      // Remainder hole should be at 312 of size 288
      const remainder = res.blocks.find((b) => b.startAddress === 312)!;
      expect(remainder.processId).toBeNull();
      expect(remainder.size).toBe(288);
    });

    it('allocates Best Fit into the tightest fitting hole', () => {
      // Request 212 KB -> Best fit among (100, 500, 200, 300, 600) is 300 (at 800)
      const res = allocateMemory(initialBlocks, 'P1', 212, 'best-fit');
      expect(res.success).toBe(true);
      const allocated = res.blocks.find((b) => b.processId === 'P1')!;
      expect(allocated.startAddress).toBe(800);
      expect(allocated.size).toBe(212);
    });

    it('allocates Worst Fit into the largest hole', () => {
      // Request 212 KB -> Worst fit is 600 (at 1100)
      const res = allocateMemory(initialBlocks, 'P1', 212, 'worst-fit');
      expect(res.success).toBe(true);
      const allocated = res.blocks.find((b) => b.processId === 'P1')!;
      expect(allocated.startAddress).toBe(1100);
      expect(allocated.size).toBe(212);
    });

    it('detects external fragmentation when total free is sufficient but no single block fits', () => {
      const fragmented: MemoryBlock[] = [
        { id: 'b1', startAddress: 0, size: 50, processId: null },
        { id: 'b2', startAddress: 50, size: 100, processId: 'P_BUSY' },
        { id: 'b3', startAddress: 150, size: 60, processId: null },
      ];
      // Total free = 50 + 60 = 110 KB. Request 80 KB fails.
      const res = allocateMemory(fragmented, 'P_NEW', 80, 'first-fit');
      expect(res.success).toBe(false);
      expect(res.externalFragmentation).toBe(110);
    });

    it('deallocates and coalesces adjacent holes correctly', () => {
      const blocks: MemoryBlock[] = [
        { id: 'b1', startAddress: 0, size: 100, processId: null },
        { id: 'b2', startAddress: 100, size: 100, processId: 'P1' },
        { id: 'b3', startAddress: 200, size: 100, processId: null },
      ];
      const res = deallocateMemory(blocks, 'P1');
      expect(res.success).toBe(true);
      // All three should merge into a single 300 KB hole
      expect(res.blocks.length).toBe(1);
      expect(res.blocks[0].size).toBe(300);
      expect(res.blocks[0].processId).toBeNull();
    });
  });

  describe('Paging Address Translation', () => {
    const pageTable: PageTableEntry[] = [
      { pageNumber: 0, frameNumber: 5, valid: true },
      { pageNumber: 1, frameNumber: 6, valid: true },
      { pageNumber: 2, frameNumber: null, valid: false }, // Page fault
      { pageNumber: 3, frameNumber: 2, valid: true },
    ];
    const pageSize = 1024; // 1 KB

    it('correctly translates logical address to physical address', () => {
      // Logical address 1050: page = 1050 / 1024 = 1, offset = 1050 % 1024 = 26
      // Frame 6 -> physical = 6 * 1024 + 26 = 6144 + 26 = 6170
      const res = translatePagingAddress(1050, pageSize, pageTable);
      expect(res.isValid).toBe(true);
      expect(res.pageNumber).toBe(1);
      expect(res.offset).toBe(26);
      expect(res.physicalAddress).toBe(6170);
    });

    it('detects page faults for invalid pages', () => {
      // Logical address 2050 -> page 2 (valid: false)
      const res = translatePagingAddress(2050, pageSize, pageTable);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Page Fault');
    });
  });

  describe('Page Replacement Algorithms', () => {
    const refString = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];
    const frames = 3;

    it('simulates FIFO and computes correct faults', () => {
      const res = simulatePageReplacement('fifo', refString, frames);
      // Textbook result for [7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1] with 3 frames is 15 faults
      expect(res.totalFaults).toBe(15);
      expect(res.totalHits).toBe(5);
    });

    it('simulates LRU and achieves better or equal performance to FIFO', () => {
      const res = simulatePageReplacement('lru', refString, frames);
      // Textbook result for LRU with 3 frames is 12 faults
      expect(res.totalFaults).toBe(12);
      expect(res.totalHits).toBe(8);
    });

    it('simulates Optimal replacement and produces minimal page faults', () => {
      const res = simulatePageReplacement('optimal', refString, frames);
      // Textbook result for Optimal with 3 frames is 9 faults
      expect(res.totalFaults).toBe(9);
      expect(res.totalHits).toBe(11);
    });

    it('reproduces Beladys Anomaly with FIFO', () => {
      // Belady's Anomaly sequence: 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5
      const anomalyRef = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];
      const fifo3 = simulatePageReplacement('fifo', anomalyRef, 3);
      const fifo4 = simulatePageReplacement('fifo', anomalyRef, 4);

      // In Belady's Anomaly, 3 frames produce 9 faults, while 4 frames produce 10 faults!
      expect(fifo3.totalFaults).toBe(9);
      expect(fifo4.totalFaults).toBe(10);
      expect(fifo4.totalFaults).toBeGreaterThan(fifo3.totalFaults);
    });
  });

  describe('Segmentation', () => {
    const segmentTable: SegmentEntry[] = [
      { segmentId: 0, name: 'Subroutine', base: 1400, limit: 1000 },
      { segmentId: 1, name: 'Square Root', base: 6300, limit: 400 },
      { segmentId: 2, name: 'Main Program', base: 4300, limit: 400 },
      { segmentId: 3, name: 'Stack', base: 3200, limit: 1100 },
      { segmentId: 4, name: 'Symbol Table', base: 4700, limit: 1000 },
    ];

    it('translates valid segment and offset into physical address', () => {
      // Segment 2, offset 53: 53 < 400 -> base 4300 + 53 = 4353
      const res = translateSegmentAddress(2, 53, segmentTable);
      expect(res.isValid).toBe(true);
      expect(res.physicalAddress).toBe(4353);
    });

    it('detects Segmentation Fault when offset exceeds segment limit', () => {
      // Segment 0 has limit 1000. Offset 1100 is illegal!
      const res = translateSegmentAddress(0, 1100, segmentTable);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Segmentation Fault');
    });
  });
});

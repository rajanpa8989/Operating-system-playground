// Contiguous Allocation Types
export interface MemoryBlock {
  id: string;
  startAddress: number;
  size: number;
  processId: string | null; // null if free hole
  allocatedSize?: number;   // size used by process (for internal fragmentation)
}

export type ContiguousAlgorithm = 'first-fit' | 'best-fit' | 'worst-fit';

export interface ContiguousAllocationResult {
  success: boolean;
  message: string;
  blocks: MemoryBlock[];
  externalFragmentation: number; // sum of free blocks smaller than request when request failed
  totalFreeMemory: number;
  totalAllocatedMemory: number;
}

// Paging Types
export interface PageTableEntry {
  pageNumber: number;
  frameNumber: number | null;
  valid: boolean;
}

export interface AddressTranslationResult {
  logicalAddress: number;
  pageNumber: number;
  offset: number;
  frameNumber: number | null;
  physicalAddress: number | null;
  isValid: boolean;
  error?: string;
}

// Page Replacement Types
export type PageReplacementAlgorithm = 'fifo' | 'lru' | 'optimal';

export interface PageReplacementStep {
  stepIndex: number;
  pageRef: number;
  frames: (number | null)[];
  isHit: boolean;
  replacedPage: number | null;
  explanation: string;
}

export interface PageReplacementResult {
  algorithm: PageReplacementAlgorithm;
  referenceString: number[];
  frameCount: number;
  steps: PageReplacementStep[];
  totalFaults: number;
  totalHits: number;
  faultRatio: number;
  hitRatio: number;
}

// Segmentation Types
export interface SegmentEntry {
  segmentId: number;
  name: string;
  base: number;
  limit: number;
}

export interface SegmentTranslationResult {
  segmentId: number;
  offset: number;
  base: number;
  limit: number;
  physicalAddress: number | null;
  isValid: boolean;
  error?: string;
}

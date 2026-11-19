import {
  MemoryBlock,
  ContiguousAlgorithm,
  ContiguousAllocationResult,
} from '@/types/memory';

export function coalesceBlocks(blocks: MemoryBlock[]): MemoryBlock[] {
  if (blocks.length <= 1) return blocks;

  const sorted = [...blocks].sort((a, b) => a.startAddress - b.startAddress);
  const coalesced: MemoryBlock[] = [];

  for (const block of sorted) {
    if (coalesced.length === 0) {
      coalesced.push({ ...block });
      continue;
    }

    const prev = coalesced[coalesced.length - 1];
    // Only coalesce if they are physically adjacent in memory
    const isAdjacent = prev.startAddress + prev.size === block.startAddress;
    if (isAdjacent && prev.processId === null && block.processId === null) {
      prev.size += block.size;
    } else {
      coalesced.push({ ...block });
    }
  }

  return coalesced;
}

export function allocateMemory(
  blocks: MemoryBlock[],
  processId: string,
  requestSize: number,
  algorithm: ContiguousAlgorithm,
  allowSplit: boolean = true
): ContiguousAllocationResult {
  const currentBlocks = [...blocks];

  const freeBlocks = currentBlocks
    .map((b, index) => ({ block: b, index }))
    .filter(({ block }) => block.processId === null && block.size >= requestSize);

  const totalFreeMemory = currentBlocks
    .filter((b) => b.processId === null)
    .reduce((sum, b) => sum + b.size, 0);

  const totalAllocatedMemory = currentBlocks
    .filter((b) => b.processId !== null)
    .reduce((sum, b) => sum + b.size, 0);

  if (freeBlocks.length === 0) {
    return {
      success: false,
      message: `Allocation failed for ${processId} (${requestSize} KB). Total free memory is ${totalFreeMemory} KB, but no single contiguous hole is >= ${requestSize} KB. This is External Fragmentation.`,
      blocks: currentBlocks,
      externalFragmentation: totalFreeMemory,
      totalFreeMemory,
      totalAllocatedMemory,
    };
  }

  let selectedTarget: { block: MemoryBlock; index: number };

  if (algorithm === 'first-fit') {
    // First free block in order that fits
    selectedTarget = freeBlocks[0];
  } else if (algorithm === 'best-fit') {
    // Hole with minimum leftover space (smallest size >= requestSize)
    freeBlocks.sort((a, b) => a.block.size - b.block.size);
    selectedTarget = freeBlocks[0];
  } else {
    // worst-fit: Hole with maximum leftover space (largest size)
    freeBlocks.sort((a, b) => b.block.size - a.block.size);
    selectedTarget = freeBlocks[0];
  }

  const targetBlock = selectedTarget.block;
  const targetIndex = selectedTarget.index;
  const updatedBlocks: MemoryBlock[] = [];

  for (let i = 0; i < currentBlocks.length; i++) {
    if (i !== targetIndex) {
      updatedBlocks.push(currentBlocks[i]);
      continue;
    }

    if (!allowSplit || targetBlock.size === requestSize) {
      // Fixed partition / exact fit
      updatedBlocks.push({
        ...targetBlock,
        processId,
        allocatedSize: requestSize,
      });
    } else {
      // Dynamic partition split: allocated block + remaining hole
      updatedBlocks.push({
        id: `block-${targetBlock.startAddress}`,
        startAddress: targetBlock.startAddress,
        size: requestSize,
        processId,
        allocatedSize: requestSize,
      });
      updatedBlocks.push({
        id: `block-${targetBlock.startAddress + requestSize}`,
        startAddress: targetBlock.startAddress + requestSize,
        size: targetBlock.size - requestSize,
        processId: null,
      });
    }
  }

  const newFreeMem = totalFreeMemory - requestSize;
  const newAllocMem = totalAllocatedMemory + requestSize;

  return {
    success: true,
    message: `Allocated ${requestSize} KB to ${processId} using ${algorithm.toUpperCase()} at address ${targetBlock.startAddress} (block size: ${targetBlock.size} KB, remaining hole: ${targetBlock.size - requestSize} KB).`,
    blocks: updatedBlocks,
    externalFragmentation: 0,
    totalFreeMemory: newFreeMem,
    totalAllocatedMemory: newAllocMem,
  };
}

export function deallocateMemory(
  blocks: MemoryBlock[],
  processId: string,
  autoCoalesce: boolean = true
): ContiguousAllocationResult {
  let found = false;
  const updated = blocks.map((b) => {
    if (b.processId === processId) {
      found = true;
      return {
        ...b,
        processId: null,
        allocatedSize: undefined,
      };
    }
    return b;
  });

  const finalBlocks = autoCoalesce ? coalesceBlocks(updated) : updated;

  const totalFreeMemory = finalBlocks
    .filter((b) => b.processId === null)
    .reduce((sum, b) => sum + b.size, 0);

  const totalAllocatedMemory = finalBlocks
    .filter((b) => b.processId !== null)
    .reduce((sum, b) => sum + b.size, 0);

  return {
    success: found,
    message: found
      ? `Deallocated process ${processId} and reclaimed memory.`
      : `Process ${processId} not found in memory.`,
    blocks: finalBlocks,
    externalFragmentation: 0,
    totalFreeMemory,
    totalAllocatedMemory,
  };
}

import {
  PageTableEntry,
  AddressTranslationResult,
} from '@/types/memory';

export function translatePagingAddress(
  logicalAddress: number,
  pageSize: number,
  pageTable: PageTableEntry[]
): AddressTranslationResult {
  if (pageSize <= 0) {
    return {
      logicalAddress,
      pageNumber: 0,
      offset: 0,
      frameNumber: null,
      physicalAddress: null,
      isValid: false,
      error: 'Page size must be greater than zero.',
    };
  }

  const pageNumber = Math.floor(logicalAddress / pageSize);
  const offset = logicalAddress % pageSize;

  const entry = pageTable.find((e) => e.pageNumber === pageNumber);

  if (!entry) {
    return {
      logicalAddress,
      pageNumber,
      offset,
      frameNumber: null,
      physicalAddress: null,
      isValid: false,
      error: `Page ${pageNumber} does not exist in the page table (Addressing Trap).`,
    };
  }

  if (!entry.valid || entry.frameNumber === null) {
    return {
      logicalAddress,
      pageNumber,
      offset,
      frameNumber: null,
      physicalAddress: null,
      isValid: false,
      error: `Page Fault: Page ${pageNumber} is marked invalid (not currently loaded into physical memory frame).`,
    };
  }

  const physicalAddress = entry.frameNumber * pageSize + offset;

  return {
    logicalAddress,
    pageNumber,
    offset,
    frameNumber: entry.frameNumber,
    physicalAddress,
    isValid: true,
  };
}

import { SegmentEntry, SegmentTranslationResult } from '@/types/memory';

export function translateSegmentAddress(
  segmentId: number,
  offset: number,
  segmentTable: SegmentEntry[]
): SegmentTranslationResult {
  const segment = segmentTable.find((s) => s.segmentId === segmentId);

  if (!segment) {
    return {
      segmentId,
      offset,
      base: 0,
      limit: 0,
      physicalAddress: null,
      isValid: false,
      error: `Segment ${segmentId} does not exist in the segment table.`,
    };
  }

  if (offset < 0) {
    return {
      segmentId,
      offset,
      base: segment.base,
      limit: segment.limit,
      physicalAddress: null,
      isValid: false,
      error: `Offset cannot be negative (${offset}).`,
    };
  }

  if (offset >= segment.limit) {
    return {
      segmentId,
      offset,
      base: segment.base,
      limit: segment.limit,
      physicalAddress: null,
      isValid: false,
      error: `Segmentation Fault (Trap): Offset ${offset} exceeds Segment ${segmentId} limit (${segment.limit}). Legal offset range is 0 to ${segment.limit - 1}.`,
    };
  }

  const physicalAddress = segment.base + offset;

  return {
    segmentId,
    offset,
    base: segment.base,
    limit: segment.limit,
    physicalAddress,
    isValid: true,
  };
}

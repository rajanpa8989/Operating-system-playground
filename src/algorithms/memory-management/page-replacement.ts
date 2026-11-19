import {
  PageReplacementAlgorithm,
  PageReplacementResult,
  PageReplacementStep,
} from '@/types/memory';

export function simulatePageReplacement(
  algorithm: PageReplacementAlgorithm,
  referenceString: number[],
  frameCount: number
): PageReplacementResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const steps: PageReplacementStep[] = [];
  let totalFaults = 0;
  let totalHits = 0;

  // Track insertion order for FIFO
  const fifoQueue: number[] = [];
  // Track last used timestamp for LRU
  const lastUsed: Record<number, number> = {};

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const isHit = frames.includes(page);

    let replacedPage: number | null = null;
    let explanation = '';

    if (isHit) {
      totalHits++;
      lastUsed[page] = i;
      explanation = `Hit: Page ${page} is already in frame ${frames.indexOf(page)}. No page fault occurred.`;
    } else {
      totalFaults++;

      // Check if there is an empty frame
      const emptyIndex = frames.indexOf(null);
      if (emptyIndex !== -1) {
        frames[emptyIndex] = page;
        fifoQueue.push(page);
        lastUsed[page] = i;
        explanation = `Fault: Page ${page} loaded into empty frame ${emptyIndex}.`;
      } else {
        // Must replace an existing page
        let victimIndex = -1;

        if (algorithm === 'fifo') {
          // Replace oldest page in fifoQueue
          const victimPage = fifoQueue.shift()!;
          victimIndex = frames.indexOf(victimPage);
          replacedPage = victimPage;
          frames[victimIndex] = page;
          fifoQueue.push(page);
          explanation = `Fault: Page ${page} referenced. Page ${victimPage} replaced (oldest page loaded into memory).`;
        } else if (algorithm === 'lru') {
          // Replace least recently used page
          let oldestTime = Infinity;
          let victimPage = frames[0]!;

          for (const f of frames) {
            if (f !== null) {
              const accessTime = lastUsed[f] ?? -1;
              if (accessTime < oldestTime) {
                oldestTime = accessTime;
                victimPage = f;
              }
            }
          }

          victimIndex = frames.indexOf(victimPage);
          replacedPage = victimPage;
          frames[victimIndex] = page;
          explanation = `Fault: Page ${page} referenced. Page ${victimPage} replaced (least recently used, last accessed at step ${lastUsed[victimPage] + 1}).`;
        } else if (algorithm === 'optimal') {
          // Look ahead into the future of referenceString
          let furthestUse = -1;
          let victimPage = frames[0]!;

          for (const f of frames) {
            if (f !== null) {
              // Find next occurrence in referenceString[i+1...]
              let nextUse = -1;
              for (let j = i + 1; j < referenceString.length; j++) {
                if (referenceString[j] === f) {
                  nextUse = j;
                  break;
                }
              }

              if (nextUse === -1) {
                // Not used again in the future! Perfect candidate to replace
                victimPage = f;
                furthestUse = Infinity;
                break;
              } else if (nextUse > furthestUse) {
                furthestUse = nextUse;
                victimPage = f;
              }
            }
          }

          victimIndex = frames.indexOf(victimPage);
          replacedPage = victimPage;
          frames[victimIndex] = page;
          const futureInfo = furthestUse === Infinity
            ? 'will not be used again'
            : `will not be used until step ${furthestUse + 1}`;
          explanation = `Fault: Page ${page} referenced. Page ${victimPage} replaced (optimal choice: ${futureInfo}).`;
        }

        lastUsed[page] = i;
      }
    }

    steps.push({
      stepIndex: i,
      pageRef: page,
      frames: [...frames],
      isHit,
      replacedPage,
      explanation,
    });
  }

  const totalRefs = referenceString.length;
  const faultRatio = totalRefs > 0 ? Number(((totalFaults / totalRefs) * 100).toFixed(2)) : 0;
  const hitRatio = totalRefs > 0 ? Number(((totalHits / totalRefs) * 100).toFixed(2)) : 0;

  return {
    algorithm,
    referenceString,
    frameCount,
    steps,
    totalFaults,
    totalHits,
    faultRatio,
    hitRatio,
  };
}

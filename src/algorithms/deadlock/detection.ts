import { DeadlockDetectionResult } from '@/types/deadlock';

export function detectDeadlock(
  processNames: string[],
  resourceNames: string[],
  available: number[],
  allocation: number[][],
  request: number[][]
): DeadlockDetectionResult {
  const numProcesses = processNames.length;
  const numResources = resourceNames.length;

  const work = [...available];
  const finish = Array(numProcesses).fill(false);
  const resolutionSteps: {
    processIndex: number;
    processName: string;
    work: number[];
    explanation: string;
  }[] = [];

  // Step 1: Initialize finish vector
  for (let i = 0; i < numProcesses; i++) {
    const isZeroAlloc = allocation[i].every((val) => val === 0);
    if (isZeroAlloc) {
      finish[i] = true;
    }
  }

  // Step 2 & 3: Find an index i such that Finish[i] === false and Request[i] <= Work
  let progressMade = true;
  while (progressMade) {
    progressMade = false;

    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        let canSatisfy = true;
        for (let j = 0; j < numResources; j++) {
          if (request[i][j] > work[j]) {
            canSatisfy = false;
            break;
          }
        }

        if (canSatisfy) {
          for (let j = 0; j < numResources; j++) {
            work[j] += allocation[i][j];
          }
          finish[i] = true;
          progressMade = true;

          resolutionSteps.push({
            processIndex: i,
            processName: processNames[i],
            work: [...work],
            explanation: `Process ${processNames[i]} requests [${request[i].join(', ')}] <= Work. Process completes and returns allocation [${allocation[i].join(', ')}]. Available now: [${work.join(', ')}].`,
          });
          break;
        }
      }
    }
  }

  // Step 4: If any Finish[i] is false, system is in deadlock
  const deadlockedProcesses: string[] = [];
  for (let i = 0; i < numProcesses; i++) {
    if (!finish[i]) {
      deadlockedProcesses.push(processNames[i]);
    }
  }

  const isDeadlocked = deadlockedProcesses.length > 0;
  const explanation = isDeadlocked
    ? `Deadlock detected! The following processes are deadlocked: ${deadlockedProcesses.join(', ')}. Each is waiting on resources held by another process in the set.`
    : 'No deadlock detected in the system. All processes can acquire their required resources and finish execution.';

  return {
    isDeadlocked,
    deadlockedProcesses,
    resolutionSteps,
    explanation,
  };
}

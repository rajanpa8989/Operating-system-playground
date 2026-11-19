import {
  BankersInput,
  BankersSafetyResult,
  BankersSafetyStep,
  ResourceRequestResult,
} from '@/types/deadlock';

export function calculateNeedMatrix(max: number[][], allocation: number[][]): number[][] {
  const need: number[][] = [];
  for (let i = 0; i < max.length; i++) {
    need[i] = [];
    for (let j = 0; j < max[i].length; j++) {
      need[i][j] = Math.max(0, max[i][j] - allocation[i][j]);
    }
  }
  return need;
}

export function checkBankersSafety(input: BankersInput): BankersSafetyResult {
  const { processNames, resourceNames, available, allocation, max } = input;
  const numProcesses = processNames.length;
  const numResources = resourceNames.length;

  const needMatrix = calculateNeedMatrix(max, allocation);
  const work = [...available];
  const finish = Array(numProcesses).fill(false);
  const safeSequence: string[] = [];
  const steps: BankersSafetyStep[] = [];

  let stepCount = 0;
  let progressMade = true;

  while (safeSequence.length < numProcesses && progressMade) {
    progressMade = false;

    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        const pNeed = needMatrix[i];
        let canAllocate = true;

        for (let j = 0; j < numResources; j++) {
          if (pNeed[j] > work[j]) {
            canAllocate = false;
            break;
          }
        }

        const workBefore = [...work];

        if (canAllocate) {
          for (let j = 0; j < numResources; j++) {
            work[j] += allocation[i][j];
          }
          finish[i] = true;
          safeSequence.push(processNames[i]);
          progressMade = true;

          steps.push({
            stepIndex: ++stepCount,
            processIndex: i,
            processName: processNames[i],
            workBefore,
            need: [...pNeed],
            canAllocate: true,
            workAfter: [...work],
            finishState: [...finish],
            explanation: `Process ${processNames[i]} verified: Need [${pNeed.join(', ')}] <= Work [${workBefore.join(', ')}]. Process can safely execute and release its allocated resources [${allocation[i].join(', ')}]. New Work: [${work.join(', ')}].`,
          });
          break; // restart scan to satisfy earlier processes that might now fit
        }
      }
    }
  }

  const isSafe = safeSequence.length === numProcesses;

  const explanation = isSafe
    ? `The system is in a SAFE state. A valid safe execution sequence exists: <${safeSequence.join(' -> ')}>. No deadlock can occur.`
    : `The system is in an UNSAFE state! Deadlock may occur because the remaining unfinished processes (${processNames.filter((_, idx) => !finish[idx]).join(', ')}) have resource requirements exceeding currently available resources.`;

  return {
    isSafe,
    safeSequence,
    needMatrix,
    steps,
    explanation,
  };
}

export function requestResources(
  input: BankersInput,
  processIndex: number,
  request: number[]
): ResourceRequestResult {
  const { processNames, resourceNames, available, allocation, max } = input;
  const pName = processNames[processIndex];
  const needMatrix = calculateNeedMatrix(max, allocation);
  const pNeed = needMatrix[processIndex];

  // 1. Check if request <= need
  for (let j = 0; j < resourceNames.length; j++) {
    if (request[j] > pNeed[j]) {
      return {
        granted: false,
        message: `Error: Process ${pName} requested ${request[j]} of ${resourceNames[j]}, which exceeds its declared maximum need of ${pNeed[j]}. Request aborted.`,
        safetyCheck: checkBankersSafety(input),
      };
    }
  }

  // 2. Check if request <= available
  for (let j = 0; j < resourceNames.length; j++) {
    if (request[j] > available[j]) {
      return {
        granted: false,
        message: `Resource Wait: Process ${pName} requested ${request[j]} of ${resourceNames[j]}, but only ${available[j]} is currently available. Process must wait.`,
        safetyCheck: checkBankersSafety(input),
      };
    }
  }

  // 3. Pretend allocation
  const tempAvailable = [...available];
  const tempAllocation = allocation.map((row) => [...row]);
  const tempMax = max.map((row) => [...row]);

  for (let j = 0; j < resourceNames.length; j++) {
    tempAvailable[j] -= request[j];
    tempAllocation[processIndex][j] += request[j];
  }

  const hypotheticalInput: BankersInput = {
    processNames,
    resourceNames,
    available: tempAvailable,
    allocation: tempAllocation,
    max: tempMax,
  };

  const safetyCheck = checkBankersSafety(hypotheticalInput);

  if (safetyCheck.isSafe) {
    const updatedNeed = calculateNeedMatrix(tempMax, tempAllocation);
    return {
      granted: true,
      message: `Request GRANTED to ${pName}: Pretended allocation leaves system in a SAFE state with sequence <${safetyCheck.safeSequence.join(' -> ')}>.`,
      safetyCheck,
      updatedAvailable: tempAvailable,
      updatedAllocation: tempAllocation,
      updatedNeed,
    };
  } else {
    return {
      granted: false,
      message: `Request REJECTED: Granting request [${request.join(', ')}] to ${pName} would transition the system into an UNSAFE state. State rolled back; process must wait.`,
      safetyCheck,
    };
  }
}

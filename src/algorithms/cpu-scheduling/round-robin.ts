import {
  ProcessInput,
  CPUSimulationResult,
  GanttSegment,
  ProcessMetric,
  SimulationStep,
} from '@/types/cpu-scheduling';

export function simulateRoundRobin(
  rawProcesses: ProcessInput[],
  timeQuantum: number = 2
): CPUSimulationResult {
  const quantum = Math.max(1, timeQuantum);

  if (rawProcesses.length === 0) {
    return {
      algorithm: `Round Robin (Quantum = ${quantum})`,
      gantt: [],
      metrics: [],
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      cpuUtilization: 0,
      throughput: 0,
      contextSwitches: 0,
      totalTime: 0,
      steps: [],
    };
  }

  // Clone processes
  const processes = [...rawProcesses].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  const remainingBurst: Record<string, number> = {};
  const firstStartTime: Record<string, number> = {};
  const completionTimes: Record<string, number> = {};

  processes.forEach((p) => {
    remainingBurst[p.id] = p.burstTime;
  });

  const readyQueue: string[] = [];
  const inQueueOrCompleted = new Set<string>();
  const completedIds: string[] = [];
  const gantt: GanttSegment[] = [];
  const steps: SimulationStep[] = [];

  let currentTime = 0;
  let contextSwitches = 0;
  let lastRanProcessId: string | null = null;

  // Function to add newly arrived processes up to time T
  const enqueueArrived = (time: number) => {
    const newlyArrived = processes.filter(
      (p) => p.arrivalTime <= time && !inQueueOrCompleted.has(p.id)
    );
    // Sort arrivals deterministically
    newlyArrived.sort((a, b) => {
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });
    for (const p of newlyArrived) {
      readyQueue.push(p.id);
      inQueueOrCompleted.add(p.id);
    }
  };

  // Initial enqueue at t=0
  enqueueArrived(0);

  // If no processes at 0, jump to first arrival
  if (readyQueue.length === 0 && completedIds.length < processes.length) {
    const nextArr = Math.min(...processes.map((p) => p.arrivalTime));
    gantt.push({
      processId: 'IDLE',
      startTime: 0,
      endTime: nextArr,
    });
    steps.push({
      time: 0,
      runningProcessId: null,
      readyQueue: [],
      remainingBurstTimes: { ...remainingBurst },
      completedProcessIds: [],
      eventDescription: `CPU is IDLE from t=0 to t=${nextArr}. Waiting for arrivals.`,
    });
    currentTime = nextArr;
    enqueueArrived(currentTime);
  }

  const maxTicks = 10000;
  let iterations = 0;

  while ((readyQueue.length > 0 || completedIds.length < processes.length) && iterations < maxTicks) {
    iterations++;

    if (readyQueue.length === 0) {
      // Idle period
      const unarrived = processes.filter((p) => !inQueueOrCompleted.has(p.id));
      if (unarrived.length === 0) break;

      const nextTime = Math.min(...unarrived.map((p) => p.arrivalTime));
      gantt.push({
        processId: 'IDLE',
        startTime: currentTime,
        endTime: nextTime,
      });
      steps.push({
        time: currentTime,
        runningProcessId: null,
        readyQueue: [],
        remainingBurstTimes: { ...remainingBurst },
        completedProcessIds: [...completedIds],
        eventDescription: `CPU IDLE between t=${currentTime} and t=${nextTime}.`,
      });
      currentTime = nextTime;
      enqueueArrived(currentTime);
      lastRanProcessId = null;
      continue;
    }

    const currentId = readyQueue.shift()!;
    const executionSlice = Math.min(quantum, remainingBurst[currentId]);

    if (lastRanProcessId !== null && lastRanProcessId !== currentId) {
      contextSwitches++;
    }
    lastRanProcessId = currentId;

    if (firstStartTime[currentId] === undefined) {
      firstStartTime[currentId] = currentTime;
    }

    steps.push({
      time: currentTime,
      runningProcessId: currentId,
      readyQueue: [...readyQueue],
      remainingBurstTimes: { ...remainingBurst },
      completedProcessIds: [...completedIds],
      eventDescription: `Process ${currentId} assigned CPU for time slice min(${quantum}, ${remainingBurst[currentId]}) = ${executionSlice}ms.`,
    });

    const startTime = currentTime;
    currentTime += executionSlice;
    remainingBurst[currentId] -= executionSlice;

    // Check for arrivals during this time slice
    enqueueArrived(currentTime);

    gantt.push({
      processId: currentId,
      startTime,
      endTime: currentTime,
    });

    if (remainingBurst[currentId] === 0) {
      completedIds.push(currentId);
      completionTimes[currentId] = currentTime;
      steps.push({
        time: currentTime,
        runningProcessId: null,
        readyQueue: [...readyQueue],
        remainingBurstTimes: { ...remainingBurst },
        completedProcessIds: [...completedIds],
        eventDescription: `Process ${currentId} finished at t=${currentTime}.`,
      });
    } else {
      // Quantum expired, return to queue tail
      readyQueue.push(currentId);
      steps.push({
        time: currentTime,
        runningProcessId: null,
        readyQueue: [...readyQueue],
        remainingBurstTimes: { ...remainingBurst },
        completedProcessIds: [...completedIds],
        eventDescription: `Time slice expired for ${currentId} (${remainingBurst[currentId]}ms remaining). Re-enqueued at tail.`,
      });
    }
  }

  // Calculate metrics
  const metrics: ProcessMetric[] = processes.map((p) => {
    const completionTime = completionTimes[p.id] ?? p.arrivalTime + p.burstTime;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = (firstStartTime[p.id] ?? p.arrivalTime) - p.arrivalTime;

    return {
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    };
  });

  const totalTime = currentTime;
  const totalBusyTime = rawProcesses.reduce((acc, p) => acc + p.burstTime, 0);
  const avgWaitingTime = metrics.reduce((acc, m) => acc + m.waitingTime, 0) / metrics.length;
  const avgTurnaroundTime = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / metrics.length;
  const avgResponseTime = metrics.reduce((acc, m) => acc + m.responseTime, 0) / metrics.length;
  const cpuUtilization = totalTime > 0 ? (totalBusyTime / totalTime) * 100 : 0;
  const throughput = totalTime > 0 ? Number((metrics.length / totalTime).toFixed(4)) : 0;

  return {
    algorithm: `Round Robin (Quantum = ${quantum})`,
    gantt,
    metrics,
    avgWaitingTime: Number(avgWaitingTime.toFixed(2)),
    avgTurnaroundTime: Number(avgTurnaroundTime.toFixed(2)),
    avgResponseTime: Number(avgResponseTime.toFixed(2)),
    cpuUtilization: Number(cpuUtilization.toFixed(2)),
    throughput,
    contextSwitches,
    totalTime,
    steps,
  };
}

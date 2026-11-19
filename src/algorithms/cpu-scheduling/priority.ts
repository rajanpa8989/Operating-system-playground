import {
  ProcessInput,
  CPUSimulationResult,
  GanttSegment,
  ProcessMetric,
  SimulationStep,
} from '@/types/cpu-scheduling';

function comparePriority(
  pA: { priority?: number; arrivalTime: number; id: string },
  pB: { priority?: number; arrivalTime: number; id: string },
  lowerIsHigher: boolean = true
): number {
  const prioA = pA.priority ?? 0;
  const prioB = pB.priority ?? 0;

  if (prioA !== prioB) {
    return lowerIsHigher ? prioA - prioB : prioB - prioA;
  }
  if (pA.arrivalTime !== pB.arrivalTime) {
    return pA.arrivalTime - pB.arrivalTime;
  }
  return pA.id.localeCompare(pB.id, undefined, { numeric: true });
}

export function simulatePriorityNonPreemptive(
  rawProcesses: ProcessInput[],
  lowerIsHigher: boolean = true
): CPUSimulationResult {
  if (rawProcesses.length === 0) {
    return {
      algorithm: 'Priority Scheduling (Non-Preemptive)',
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

  const n = rawProcesses.length;
  const completedIds: string[] = [];
  const gantt: GanttSegment[] = [];
  const metrics: ProcessMetric[] = [];
  const steps: SimulationStep[] = [];

  const remainingBurstTimes: Record<string, number> = {};
  rawProcesses.forEach((p) => {
    remainingBurstTimes[p.id] = p.burstTime;
  });

  let currentTime = 0;
  let contextSwitches = 0;
  let previousProcessId: string | null = null;

  while (completedIds.length < n) {
    const available = rawProcesses.filter(
      (p) => p.arrivalTime <= currentTime && !completedIds.includes(p.id)
    );

    if (available.length === 0) {
      const uncompleted = rawProcesses.filter((p) => !completedIds.includes(p.id));
      const nextArrival = Math.min(...uncompleted.map((p) => p.arrivalTime));

      gantt.push({
        processId: 'IDLE',
        startTime: currentTime,
        endTime: nextArrival,
      });

      steps.push({
        time: currentTime,
        runningProcessId: null,
        readyQueue: [],
        remainingBurstTimes: { ...remainingBurstTimes },
        completedProcessIds: [...completedIds],
        eventDescription: `CPU is IDLE from t=${currentTime} to t=${nextArrival}.`,
      });

      currentTime = nextArrival;
      previousProcessId = null;
      continue;
    }

    available.sort((a, b) => comparePriority(a, b, lowerIsHigher));
    const chosen = available[0];

    if (previousProcessId !== null && previousProcessId !== chosen.id) {
      contextSwitches++;
    }
    previousProcessId = chosen.id;

    const readyQueue = available.slice(1).map((p) => p.id);

    steps.push({
      time: currentTime,
      runningProcessId: chosen.id,
      readyQueue,
      remainingBurstTimes: { ...remainingBurstTimes },
      completedProcessIds: [...completedIds],
      eventDescription: `Process ${chosen.id} (Priority: ${chosen.priority ?? 0}) dispatched. Highest priority job ready.`,
    });

    const startTime = currentTime;
    currentTime += chosen.burstTime;
    remainingBurstTimes[chosen.id] = 0;
    completedIds.push(chosen.id);

    gantt.push({
      processId: chosen.id,
      startTime,
      endTime: currentTime,
    });

    const completionTime = currentTime;
    const turnaroundTime = completionTime - chosen.arrivalTime;
    const waitingTime = turnaroundTime - chosen.burstTime;
    const responseTime = startTime - chosen.arrivalTime;

    metrics.push({
      id: chosen.id,
      arrivalTime: chosen.arrivalTime,
      burstTime: chosen.burstTime,
      priority: chosen.priority,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });

    steps.push({
      time: currentTime,
      runningProcessId: null,
      readyQueue: rawProcesses
        .filter((p) => p.arrivalTime <= currentTime && !completedIds.includes(p.id))
        .map((p) => p.id),
      remainingBurstTimes: { ...remainingBurstTimes },
      completedProcessIds: [...completedIds],
      eventDescription: `Process ${chosen.id} completed at t=${currentTime}.`,
    });
  }

  // Preserve initial process order in metrics table
  metrics.sort((a, b) => {
    const idxA = rawProcesses.findIndex((p) => p.id === a.id);
    const idxB = rawProcesses.findIndex((p) => p.id === b.id);
    return idxA - idxB;
  });

  const totalTime = currentTime;
  const totalBusyTime = rawProcesses.reduce((acc, p) => acc + p.burstTime, 0);
  const avgWaitingTime = metrics.reduce((acc, m) => acc + m.waitingTime, 0) / metrics.length;
  const avgTurnaroundTime = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / metrics.length;
  const avgResponseTime = metrics.reduce((acc, m) => acc + m.responseTime, 0) / metrics.length;
  const cpuUtilization = totalTime > 0 ? (totalBusyTime / totalTime) * 100 : 0;
  const throughput = totalTime > 0 ? Number((metrics.length / totalTime).toFixed(4)) : 0;

  return {
    algorithm: 'Priority Scheduling (Non-Preemptive)',
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

export function simulatePriorityPreemptive(
  rawProcesses: ProcessInput[],
  lowerIsHigher: boolean = true
): CPUSimulationResult {
  if (rawProcesses.length === 0) {
    return {
      algorithm: 'Priority Scheduling (Preemptive)',
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

  const n = rawProcesses.length;
  const remainingBurst: Record<string, number> = {};
  const firstStartTime: Record<string, number> = {};
  const completionTimes: Record<string, number> = {};

  rawProcesses.forEach((p) => {
    remainingBurst[p.id] = p.burstTime;
  });

  const completedIds: string[] = [];
  const rawGantt: { processId: string; time: number }[] = [];
  const steps: SimulationStep[] = [];

  let currentTime = 0;
  let contextSwitches = 0;
  let currentRunningId: string | null = null;

  const totalBurst = rawProcesses.reduce((acc, p) => acc + p.burstTime, 0);
  const maxArrival = Math.max(...rawProcesses.map((p) => p.arrivalTime));
  const maxTimeLimit = totalBurst + maxArrival + 1000;

  while (completedIds.length < n && currentTime < maxTimeLimit) {
    const available = rawProcesses.filter(
      (p) => p.arrivalTime <= currentTime && !completedIds.includes(p.id) && remainingBurst[p.id] > 0
    );

    if (available.length === 0) {
      currentRunningId = null;
      rawGantt.push({ processId: 'IDLE', time: currentTime });
      steps.push({
        time: currentTime,
        runningProcessId: null,
        readyQueue: [],
        remainingBurstTimes: { ...remainingBurst },
        completedProcessIds: [...completedIds],
        eventDescription: `CPU is IDLE at t=${currentTime}.`,
      });
      currentTime++;
      continue;
    }

    available.sort((a, b) => comparePriority(a, b, lowerIsHigher));
    const nextToRun = available[0];

    if (currentRunningId !== null && currentRunningId !== nextToRun.id && remainingBurst[currentRunningId] > 0) {
      contextSwitches++;
      steps.push({
        time: currentTime,
        runningProcessId: nextToRun.id,
        readyQueue: available.filter((p) => p.id !== nextToRun.id).map((p) => p.id),
        remainingBurstTimes: { ...remainingBurst },
        completedProcessIds: [...completedIds],
        eventDescription: `Preemption: Process ${currentRunningId} preempted by higher priority ${nextToRun.id} (Prio: ${nextToRun.priority ?? 0}).`,
        isContextSwitch: true,
      });
    } else if (currentRunningId === null || currentRunningId !== nextToRun.id) {
      if (currentRunningId !== null) {
        contextSwitches++;
      }
      const ready = available.filter((p) => p.id !== nextToRun.id).map((p) => p.id);
      steps.push({
        time: currentTime,
        runningProcessId: nextToRun.id,
        readyQueue: ready,
        remainingBurstTimes: { ...remainingBurst },
        completedProcessIds: [...completedIds],
        eventDescription: `Process ${nextToRun.id} dispatched (Priority: ${nextToRun.priority ?? 0}).`,
      });
    }

    currentRunningId = nextToRun.id;

    if (firstStartTime[nextToRun.id] === undefined) {
      firstStartTime[nextToRun.id] = currentTime;
    }

    rawGantt.push({ processId: nextToRun.id, time: currentTime });
    remainingBurst[nextToRun.id]--;

    if (remainingBurst[nextToRun.id] === 0) {
      completedIds.push(nextToRun.id);
      completionTimes[nextToRun.id] = currentTime + 1;
      steps.push({
        time: currentTime + 1,
        runningProcessId: null,
        readyQueue: rawProcesses
          .filter((p) => p.arrivalTime <= currentTime + 1 && !completedIds.includes(p.id))
          .map((p) => p.id),
        remainingBurstTimes: { ...remainingBurst },
        completedProcessIds: [...completedIds],
        eventDescription: `Process ${nextToRun.id} finished at t=${currentTime + 1}.`,
      });
      currentRunningId = null;
    }

    currentTime++;
  }

  // Compress raw Gantt ticks
  const gantt: GanttSegment[] = [];
  if (rawGantt.length > 0) {
    let curProc = rawGantt[0].processId;
    let segStart = rawGantt[0].time;

    for (let i = 1; i < rawGantt.length; i++) {
      if (rawGantt[i].processId !== curProc) {
        gantt.push({
          processId: curProc,
          startTime: segStart,
          endTime: rawGantt[i].time,
        });
        curProc = rawGantt[i].processId;
        segStart = rawGantt[i].time;
      }
    }
    gantt.push({
      processId: curProc,
      startTime: segStart,
      endTime: rawGantt[rawGantt.length - 1].time + 1,
    });
  }

  const metrics: ProcessMetric[] = rawProcesses.map((p) => {
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
    algorithm: 'Priority Scheduling (Preemptive)',
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

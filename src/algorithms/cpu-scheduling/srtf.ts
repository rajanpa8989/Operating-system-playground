import {
  ProcessInput,
  CPUSimulationResult,
  GanttSegment,
  ProcessMetric,
  SimulationStep,
} from '@/types/cpu-scheduling';

export function simulateSRTF(rawProcesses: ProcessInput[]): CPUSimulationResult {
  if (rawProcesses.length === 0) {
    return {
      algorithm: 'Shortest Remaining Time First (SRTF)',
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

  // Maximum time safeguard
  const totalBurst = rawProcesses.reduce((acc, p) => acc + p.burstTime, 0);
  const maxArrival = Math.max(...rawProcesses.map((p) => p.arrivalTime));
  const maxTimeLimit = totalBurst + maxArrival + 1000;

  while (completedIds.length < n && currentTime < maxTimeLimit) {
    // Check which processes are available
    const available = rawProcesses.filter(
      (p) => p.arrivalTime <= currentTime && !completedIds.includes(p.id) && remainingBurst[p.id] > 0
    );

    if (available.length === 0) {
      if (currentRunningId !== null) {
        currentRunningId = null;
      }
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

    // Pick process with shortest remaining time
    // Tie-breaker: arrivalTime, then process ID
    available.sort((a, b) => {
      const remA = remainingBurst[a.id];
      const remB = remainingBurst[b.id];
      if (remA !== remB) return remA - remB;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });

    const nextToRun = available[0];

    // Detect preemption / context switch
    if (currentRunningId !== null && currentRunningId !== nextToRun.id && remainingBurst[currentRunningId] > 0) {
      contextSwitches++;
      steps.push({
        time: currentTime,
        runningProcessId: nextToRun.id,
        readyQueue: available.filter((p) => p.id !== nextToRun.id).map((p) => p.id),
        remainingBurstTimes: { ...remainingBurst },
        completedProcessIds: [...completedIds],
        eventDescription: `Preemption: Process ${currentRunningId} preempted by ${nextToRun.id} (Remaining: ${remainingBurst[nextToRun.id]}ms < ${remainingBurst[currentRunningId]}ms).`,
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
        eventDescription: `Process ${nextToRun.id} dispatched to CPU (Remaining: ${remainingBurst[nextToRun.id]}ms).`,
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
        eventDescription: `Process ${nextToRun.id} completed execution at t=${currentTime + 1}.`,
      });
      currentRunningId = null;
    }

    currentTime++;
  }

  // Compress rawGantt into contiguous segments
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

  // Calculate metrics
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
    algorithm: 'Shortest Remaining Time First (SRTF)',
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

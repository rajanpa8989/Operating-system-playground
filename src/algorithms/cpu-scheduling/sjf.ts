import {
  ProcessInput,
  CPUSimulationResult,
  GanttSegment,
  ProcessMetric,
  SimulationStep,
} from '@/types/cpu-scheduling';

export function simulateSJF(rawProcesses: ProcessInput[]): CPUSimulationResult {
  if (rawProcesses.length === 0) {
    return {
      algorithm: 'Shortest Job First (Non-Preemptive)',
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
    // Arrived and not completed
    const available = rawProcesses.filter(
      (p) => p.arrivalTime <= currentTime && !completedIds.includes(p.id)
    );

    if (available.length === 0) {
      // Find next arriving process
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
        eventDescription: `CPU is IDLE. Waiting for processes to arrive at t=${nextArrival}.`,
      });

      currentTime = nextArrival;
      previousProcessId = null;
      continue;
    }

    // Sort by burst time, then arrival time, then ID
    available.sort((a, b) => {
      if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.id.localeCompare(b.id, undefined, { numeric: true });
    });

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
      eventDescription: `Process ${chosen.id} (Burst: ${chosen.burstTime}ms) dispatched. Shortest job in ready queue.`,
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

  // Sort metrics by process ID or original order
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
    algorithm: 'Shortest Job First (Non-Preemptive)',
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

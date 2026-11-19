import {
  ProcessInput,
  CPUSimulationResult,
  GanttSegment,
  ProcessMetric,
  SimulationStep,
} from '@/types/cpu-scheduling';

export function simulateFCFS(rawProcesses: ProcessInput[]): CPUSimulationResult {
  if (rawProcesses.length === 0) {
    return {
      algorithm: 'First Come First Serve (FCFS)',
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

  // Clone and sort by arrival time, then by ID for deterministic tie-breaking
  const processes = [...rawProcesses].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  const gantt: GanttSegment[] = [];
  const metrics: ProcessMetric[] = [];
  const steps: SimulationStep[] = [];

  let currentTime = 0;
  let contextSwitches = 0;
  let previousProcessId: string | null = null;
  const remainingBurstTimes: Record<string, number> = {};
  rawProcesses.forEach((p) => {
    remainingBurstTimes[p.id] = p.burstTime;
  });

  const completedIds: string[] = [];
  const firstStartTime: Record<string, number> = {};

  // Find minimum arrival time
  const minArrival = Math.min(...processes.map((p) => p.arrivalTime));
  if (minArrival > 0) {
    gantt.push({ processId: 'IDLE', startTime: 0, endTime: minArrival });
    steps.push({
      time: 0,
      runningProcessId: null,
      readyQueue: [],
      remainingBurstTimes: { ...remainingBurstTimes },
      completedProcessIds: [],
      eventDescription: `CPU is IDLE. Waiting for first process arrival at t=${minArrival}.`,
    });
    currentTime = minArrival;
  }

  for (let i = 0; i < processes.length; i++) {
    const p = processes[i];

    if (currentTime < p.arrivalTime) {
      // Idle period before process arrives
      gantt.push({
        processId: 'IDLE',
        startTime: currentTime,
        endTime: p.arrivalTime,
      });
      steps.push({
        time: currentTime,
        runningProcessId: null,
        readyQueue: processes
          .filter((proc) => proc.arrivalTime <= currentTime && !completedIds.includes(proc.id))
          .map((proc) => proc.id),
        remainingBurstTimes: { ...remainingBurstTimes },
        completedProcessIds: [...completedIds],
        eventDescription: `CPU is IDLE from t=${currentTime} to t=${p.arrivalTime}.`,
      });
      currentTime = p.arrivalTime;
      previousProcessId = null;
    }

    if (previousProcessId !== null && previousProcessId !== p.id) {
      contextSwitches++;
    }
    previousProcessId = p.id;
    firstStartTime[p.id] = currentTime;

    // Ready queue at start of process
    const currentReady = processes
      .filter((proc) => proc.arrivalTime <= currentTime && proc.id !== p.id && !completedIds.includes(proc.id))
      .map((proc) => proc.id);

    steps.push({
      time: currentTime,
      runningProcessId: p.id,
      readyQueue: currentReady,
      remainingBurstTimes: { ...remainingBurstTimes },
      completedProcessIds: [...completedIds],
      eventDescription: `Process ${p.id} dispatched to CPU (Burst: ${p.burstTime}ms).`,
    });

    const startTime = currentTime;
    currentTime += p.burstTime;
    remainingBurstTimes[p.id] = 0;
    completedIds.push(p.id);

    gantt.push({
      processId: p.id,
      startTime,
      endTime: currentTime,
    });

    const completionTime = currentTime;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = startTime - p.arrivalTime;

    metrics.push({
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });

    steps.push({
      time: currentTime,
      runningProcessId: null,
      readyQueue: processes
        .filter((proc) => proc.arrivalTime <= currentTime && !completedIds.includes(proc.id))
        .map((proc) => proc.id),
      remainingBurstTimes: { ...remainingBurstTimes },
      completedProcessIds: [...completedIds],
      eventDescription: `Process ${p.id} completed execution at t=${currentTime}.`,
    });
  }

  // Final summary calculation
  const totalTime = currentTime;
  const totalBusyTime = rawProcesses.reduce((acc, p) => acc + p.burstTime, 0);
  const avgWaitingTime = metrics.reduce((acc, m) => acc + m.waitingTime, 0) / metrics.length;
  const avgTurnaroundTime = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / metrics.length;
  const avgResponseTime = metrics.reduce((acc, m) => acc + m.responseTime, 0) / metrics.length;
  const cpuUtilization = totalTime > 0 ? (totalBusyTime / totalTime) * 100 : 0;
  const throughput = totalTime > 0 ? Number((metrics.length / totalTime).toFixed(4)) : 0;

  return {
    algorithm: 'First Come First Serve (FCFS)',
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

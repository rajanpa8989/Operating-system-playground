export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';

export interface ProcessControlBlock {
  pid: string;
  name: string;
  state: ProcessState;
  programCounter: number;
  registers: {
    eax: number;
    ebx: number;
    ecx: number;
    edx: number;
    esp: number;
  };
  priority: number;
  memoryLimit: {
    base: number;
    limit: number;
  };
  waitingReason?: string | null;
  cpuTimeUsed: number;
}

export type ProcessTransitionEvent =
  | 'ADMIT'             // NEW -> READY
  | 'DISPATCH'          // READY -> RUNNING
  | 'TIMER_INTERRUPT'   // RUNNING -> READY
  | 'IO_REQUEST'        // RUNNING -> WAITING
  | 'IO_COMPLETION'     // WAITING -> READY
  | 'EXIT';             // RUNNING -> TERMINATED

export interface ProcessTransitionResult {
  success: boolean;
  message: string;
  previousState: ProcessState;
  newState: ProcessState;
  contextSwitchOccurred: boolean;
  osActionDescription: string;
}

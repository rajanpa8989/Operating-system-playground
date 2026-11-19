import {
  ProcessControlBlock,
  ProcessState,
  ProcessTransitionEvent,
  ProcessTransitionResult,
} from '@/types/process';

export const VALID_TRANSITIONS: Record<ProcessState, { target: ProcessState; event: ProcessTransitionEvent }[]> = {
  NEW: [{ target: 'READY', event: 'ADMIT' }],
  READY: [{ target: 'RUNNING', event: 'DISPATCH' }],
  RUNNING: [
    { target: 'READY', event: 'TIMER_INTERRUPT' },
    { target: 'WAITING', event: 'IO_REQUEST' },
    { target: 'TERMINATED', event: 'EXIT' },
  ],
  WAITING: [{ target: 'READY', event: 'IO_COMPLETION' }],
  TERMINATED: [],
};

export function canTransition(currentState: ProcessState, targetState: ProcessState): boolean {
  const allowed = VALID_TRANSITIONS[currentState] || [];
  return allowed.some((t) => t.target === targetState);
}

export function executeTransition(
  pcb: ProcessControlBlock,
  event: ProcessTransitionEvent,
  currentRunningPid: string | null,
  options: { ioReason?: string } = {}
): ProcessTransitionResult {
  const oldState = pcb.state;

  switch (event) {
    case 'ADMIT': {
      if (oldState !== 'NEW') {
        return {
          success: false,
          message: `Illegal transition: Only processes in NEW state can be admitted to READY queue (Current state: ${oldState}).`,
          previousState: oldState,
          newState: oldState,
          contextSwitchOccurred: false,
          osActionDescription: 'Kernel rejected admission: process is not in NEW state.',
        };
      }
      pcb.state = 'READY';
      return {
        success: true,
        message: `Process ${pcb.pid} admitted by the Long-Term Scheduler (Job Scheduler). Moved to Ready Queue.`,
        previousState: oldState,
        newState: 'READY',
        contextSwitchOccurred: false,
        osActionDescription: `Kernel allocated PCB and initialized address space. Process ${pcb.pid} enqueued in Ready Queue.`,
      };
    }

    case 'DISPATCH': {
      if (oldState !== 'READY') {
        return {
          success: false,
          message: `Illegal transition: Only processes in READY queue can be dispatched to RUNNING (Current state: ${oldState}).`,
          previousState: oldState,
          newState: oldState,
          contextSwitchOccurred: false,
          osActionDescription: 'Dispatcher error: Target process is not ready.',
        };
      }
      if (currentRunningPid !== null && currentRunningPid !== pcb.pid) {
        return {
          success: false,
          message: `CPU Conflict: Process ${currentRunningPid} is currently holding the CPU. It must yield, wait, or be preempted before ${pcb.pid} can be dispatched.`,
          previousState: oldState,
          newState: oldState,
          contextSwitchOccurred: false,
          osActionDescription: 'Dispatcher halted: Single CPU core is currently busy.',
        };
      }
      pcb.state = 'RUNNING';
      pcb.programCounter += 4;
      pcb.cpuTimeUsed += 1;
      return {
        success: true,
        message: `Process ${pcb.pid} dispatched by Short-Term Scheduler. Switched from Kernel Mode to User Mode.`,
        previousState: oldState,
        newState: 'RUNNING',
        contextSwitchOccurred: true,
        osActionDescription: `Context Switch: Restored registers (EAX=0x${pcb.registers.eax.toString(16)}, ESP=0x${pcb.registers.esp.toString(16)}). Loaded Program Counter (0x${pcb.programCounter.toString(16)}) into instruction register.`,
      };
    }

    case 'TIMER_INTERRUPT': {
      if (oldState !== 'RUNNING') {
        return {
          success: false,
          message: `Illegal transition: Timer interrupt can only preempt a RUNNING process (Current state: ${oldState}).`,
          previousState: oldState,
          newState: oldState,
          contextSwitchOccurred: false,
          osActionDescription: 'Timer interrupt ignored: Process was not running on CPU.',
        };
      }
      pcb.state = 'READY';
      return {
        success: true,
        message: `Process ${pcb.pid} preempted by hardware timer interrupt (Time Quantum expired). Returned to Ready Queue.`,
        previousState: oldState,
        newState: 'READY',
        contextSwitchOccurred: true,
        osActionDescription: `Interrupt Handler invoked. Saved CPU registers to PCB ${pcb.pid}. Changed state from RUNNING to READY. Enqueued at tail of Ready Queue.`,
      };
    }

    case 'IO_REQUEST': {
      if (oldState !== 'RUNNING') {
        return {
          success: false,
          message: `Illegal transition: Process can only request I/O while RUNNING on CPU (Current state: ${oldState}).`,
          previousState: oldState,
          newState: oldState,
          contextSwitchOccurred: false,
          osActionDescription: 'System call rejected: Process is not actively executing.',
        };
      }
      pcb.state = 'WAITING';
      pcb.waitingReason = options.ioReason || 'Disk Read System Call (sys_read)';
      return {
        success: true,
        message: `Process ${pcb.pid} issued an I/O System Call (${pcb.waitingReason}). Blocked and moved to Device Waiting Queue.`,
        previousState: oldState,
        newState: 'WAITING',
        contextSwitchOccurred: true,
        osActionDescription: `Trap instruction switched to Kernel Mode. Saved state to PCB. Appended PCB to Device Queue. CPU surrendered to Dispatcher.`,
      };
    }

    case 'IO_COMPLETION': {
      if (oldState !== 'WAITING') {
        return {
          success: false,
          message: `Illegal transition: Only WAITING / BLOCKED processes can transition upon I/O completion (Current state: ${oldState}).`,
          previousState: oldState,
          newState: oldState,
          contextSwitchOccurred: false,
          osActionDescription: 'I/O Completion ignored: Process was not waiting.',
        };
      }
      pcb.state = 'READY';
      const reason = pcb.waitingReason;
      pcb.waitingReason = null;
      return {
        success: true,
        message: `I/O Operation completed for ${pcb.pid} (${reason || 'Device Ready'}). Hardware interrupt fired. Process moved to Ready Queue.`,
        previousState: oldState,
        newState: 'READY',
        contextSwitchOccurred: false,
        osActionDescription: `Hardware Interrupt Service Routine (ISR) dequeued PCB from Device Queue and transferred it into the Ready Queue.`,
      };
    }

    case 'EXIT': {
      if (oldState !== 'RUNNING') {
        return {
          success: false,
          message: `Illegal transition: Only RUNNING processes can terminate via exit (Current state: ${oldState}).`,
          previousState: oldState,
          newState: oldState,
          contextSwitchOccurred: false,
          osActionDescription: 'Termination rejected: Process was not executing.',
        };
      }
      pcb.state = 'TERMINATED';
      return {
        success: true,
        message: `Process ${pcb.pid} called sys_exit() and terminated normally.`,
        previousState: oldState,
        newState: 'TERMINATED',
        contextSwitchOccurred: true,
        osActionDescription: `Kernel reclaimed allocated memory frames and file descriptors. Process status set to zombie until parent reads exit status.`,
      };
    }

    default:
      return {
        success: false,
        message: `Unknown transition event: ${event}`,
        previousState: oldState,
        newState: oldState,
        contextSwitchOccurred: false,
        osActionDescription: 'Unrecognized kernel event.',
      };
  }
}

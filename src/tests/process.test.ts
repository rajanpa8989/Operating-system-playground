import { describe, it, expect } from 'vitest';
import {
  executeTransition,
  canTransition,
  createProcessPCB,
} from '@/algorithms/process-management';

describe('Process Lifecycle Management', () => {
  it('correctly validates allowed transition paths', () => {
    expect(canTransition('NEW', 'READY')).toBe(true);
    expect(canTransition('READY', 'RUNNING')).toBe(true);
    expect(canTransition('RUNNING', 'WAITING')).toBe(true);
    expect(canTransition('WAITING', 'READY')).toBe(true);
    expect(canTransition('RUNNING', 'TERMINATED')).toBe(true);

    // Illegal transitions
    expect(canTransition('NEW', 'RUNNING')).toBe(false);
    expect(canTransition('WAITING', 'RUNNING')).toBe(false);
    expect(canTransition('TERMINATED', 'READY')).toBe(false);
  });

  it('executes a complete legal process lifecycle with context updates', () => {
    const pcb = createProcessPCB('P1', 'Test Process');
    expect(pcb.state).toBe('NEW');

    // 1. Admit
    const r1 = executeTransition(pcb, 'ADMIT', null);
    expect(r1.success).toBe(true);
    expect(pcb.state).toBe('READY');

    // 2. Dispatch
    const r2 = executeTransition(pcb, 'DISPATCH', null);
    expect(r2.success).toBe(true);
    expect(pcb.state).toBe('RUNNING');
    expect(r2.contextSwitchOccurred).toBe(true);
    expect(pcb.cpuTimeUsed).toBe(1);

    // 3. I/O Request
    const r3 = executeTransition(pcb, 'IO_REQUEST', 'P1', { ioReason: 'Read Keyboard' });
    expect(r3.success).toBe(true);
    expect(pcb.state).toBe('WAITING');
    expect(pcb.waitingReason).toBe('Read Keyboard');

    // 4. I/O Completion
    const r4 = executeTransition(pcb, 'IO_COMPLETION', null);
    expect(r4.success).toBe(true);
    expect(pcb.state).toBe('READY');
    expect(pcb.waitingReason).toBeNull();

    // 5. Dispatch again
    const r5 = executeTransition(pcb, 'DISPATCH', null);
    expect(r5.success).toBe(true);
    expect(pcb.state).toBe('RUNNING');

    // 6. Exit
    const r6 = executeTransition(pcb, 'EXIT', 'P1');
    expect(r6.success).toBe(true);
    expect(pcb.state).toBe('TERMINATED');
  });

  it('prevents CPU dispatch conflict when another process is running', () => {
    const p1 = createProcessPCB('P1', 'Process 1');
    const p2 = createProcessPCB('P2', 'Process 2');

    executeTransition(p1, 'ADMIT', null);
    executeTransition(p2, 'ADMIT', null);

    // Dispatch P1 to CPU
    executeTransition(p1, 'DISPATCH', null);
    expect(p1.state).toBe('RUNNING');

    // Attempt to dispatch P2 while P1 is holding CPU
    const conflictRes = executeTransition(p2, 'DISPATCH', 'P1');
    expect(conflictRes.success).toBe(false);
    expect(conflictRes.message).toContain('CPU Conflict');
    expect(p2.state).toBe('READY');
  });

  it('rejects invalid transitions gracefully', () => {
    const pcb = createProcessPCB('P1', 'Test Process'); // state: NEW
    // Try to dispatch directly from NEW
    const res = executeTransition(pcb, 'DISPATCH', null);
    expect(res.success).toBe(false);
    expect(pcb.state).toBe('NEW');
  });
});

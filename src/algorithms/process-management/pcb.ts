import { ProcessControlBlock } from '@/types/process';

export function createProcessPCB(
  pid: string,
  name: string,
  priority: number = 1,
  baseMemory: number = 0x1000,
  limitMemory: number = 0x4000
): ProcessControlBlock {
  return {
    pid,
    name,
    state: 'NEW',
    programCounter: baseMemory + 0x100,
    registers: {
      eax: Math.floor(Math.random() * 0xffff),
      ebx: Math.floor(Math.random() * 0xffff),
      ecx: 0,
      edx: 0,
      esp: baseMemory + limitMemory - 4,
    },
    priority,
    memoryLimit: {
      base: baseMemory,
      limit: limitMemory,
    },
    waitingReason: null,
    cpuTimeUsed: 0,
  };
}

export function createDefaultProcessList(): ProcessControlBlock[] {
  return [
    createProcessPCB('P1', 'Code Compiler', 1, 0x1000, 0x5000),
    createProcessPCB('P2', 'Browser Renderer', 2, 0x6000, 0x8000),
    createProcessPCB('P3', 'Audio Daemon', 0, 0xe000, 0x2000),
  ];
}

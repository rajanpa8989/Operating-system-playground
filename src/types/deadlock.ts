export interface BankersInput {
  processNames: string[];
  resourceNames: string[];
  available: number[];
  allocation: number[][]; // [process][resource]
  max: number[][];        // [process][resource]
}

export interface BankersSafetyStep {
  stepIndex: number;
  processIndex: number;
  processName: string;
  workBefore: number[];
  need: number[];
  canAllocate: boolean;
  workAfter: number[];
  finishState: boolean[];
  explanation: string;
}

export interface BankersSafetyResult {
  isSafe: boolean;
  safeSequence: string[];
  needMatrix: number[][];
  steps: BankersSafetyStep[];
  explanation: string;
}

export interface ResourceRequestResult {
  granted: boolean;
  message: string;
  safetyCheck: BankersSafetyResult;
  updatedAvailable?: number[];
  updatedAllocation?: number[][];
  updatedNeed?: number[][];
}

// Deadlock Detection Types
export interface DeadlockDetectionResult {
  isDeadlocked: boolean;
  deadlockedProcesses: string[];
  resolutionSteps: {
    processIndex: number;
    processName: string;
    work: number[];
    explanation: string;
  }[];
  explanation: string;
}

// Resource Allocation Graph Types
export interface RAGNode {
  id: string;
  name: string;
  type: 'process' | 'resource';
  instances?: number; // for resources
}

export interface RAGEdge {
  id: string;
  from: string; // process or resource id
  to: string;   // resource or process id
  type: 'request' | 'allocation';
}

export interface RAGGraph {
  nodes: RAGNode[];
  edges: RAGEdge[];
}

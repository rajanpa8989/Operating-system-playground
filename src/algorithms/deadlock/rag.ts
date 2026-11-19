import { RAGGraph, RAGNode, RAGEdge } from '@/types/deadlock';

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycles: string[][]; // list of node id paths forming cycles
  isDeadlockLikely: boolean;
  explanation: string;
}

export function detectRAGCycles(graph: RAGGraph): CycleDetectionResult {
  const adj: Record<string, string[]> = {};
  for (const node of graph.nodes) {
    adj[node.id] = [];
  }

  for (const edge of graph.edges) {
    if (adj[edge.from]) {
      adj[edge.from].push(edge.to);
    }
  }

  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};
  const currentPath: string[] = [];
  const foundCycles: string[][] = [];

  function dfs(u: string) {
    visited[u] = true;
    recStack[u] = true;
    currentPath.push(u);

    for (const v of adj[u] || []) {
      if (!visited[v]) {
        dfs(v);
      } else if (recStack[v]) {
        // Cycle detected
        const cycleStartIndex = currentPath.indexOf(v);
        if (cycleStartIndex !== -1) {
          const cycle = currentPath.slice(cycleStartIndex);
          cycle.push(v);
          foundCycles.push(cycle);
        }
      }
    }

    currentPath.pop();
    recStack[u] = false;
  }

  for (const node of graph.nodes) {
    if (!visited[node.id]) {
      dfs(node.id);
    }
  }

  const hasCycle = foundCycles.length > 0;

  // Check if all resource nodes in cycle are single-instance
  let allSingleInstance = true;
  for (const node of graph.nodes) {
    if (node.type === 'resource' && (node.instances ?? 1) > 1) {
      allSingleInstance = false;
      break;
    }
  }

  let explanation = '';
  if (!hasCycle) {
    explanation = 'No cycle detected in the Resource Allocation Graph. The system is provably free of deadlock.';
  } else if (allSingleInstance) {
    explanation = `Cycle detected with single-instance resources: ${foundCycles.map((c) => c.join(' -> ')).join(' | ')}. In a single-instance system, a cycle is both necessary and SUFFICIENT for deadlock!`;
  } else {
    explanation = `Cycle detected with multi-instance resources: ${foundCycles.map((c) => c.join(' -> ')).join(' | ')}. In multi-instance systems, a cycle is necessary but not sufficient for deadlock. Use Banker's algorithm or reduction matrix to verify.`;
  }

  return {
    hasCycle,
    cycles: foundCycles,
    isDeadlockLikely: hasCycle,
    explanation,
  };
}

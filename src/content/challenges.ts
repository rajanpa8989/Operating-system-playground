import { Challenge } from '@/types/challenge';

export const CHALLENGES: Challenge[] = [
  {
    id: 'cpu-convoy-effect',
    category: 'cpu-scheduling',
    difficulty: 'Beginner',
    title: 'The Convoy Effect in First-Come First-Serve',
    scenario: 'Three processes arrive at time t=0. P1 has a Burst Time of 24ms. P2 and P3 have Burst Times of 3ms each. Under FCFS, P1 executes first.',
    question: 'What is the average waiting time under FCFS, and what would it become if SJF scheduled P2 and P3 before P1?',
    hint: 'Calculate waiting times: in FCFS, P1 waits 0, P2 waits 24, P3 waits 27. In SJF, the two short jobs run first.',
    options: [
      {
        id: 'opt-1',
        label: 'FCFS Avg WT = 17.0ms, SJF Avg WT = 3.0ms',
        isCorrect: true,
        explanation: 'Correct! Under FCFS: (0 + 24 + 27) / 3 = 17.0ms. Under SJF (P2 -> P3 -> P1): P2 waits 0, P3 waits 3, P1 waits 6 -> (0 + 3 + 6) / 3 = 3.0ms! The convoy effect increases waiting time by over 5.6x.',
      },
      {
        id: 'opt-2',
        label: 'FCFS Avg WT = 24.0ms, SJF Avg WT = 6.0ms',
        isCorrect: false,
        explanation: 'Incorrect. Remember that the first process P1 experiences 0ms waiting time.',
      },
      {
        id: 'opt-3',
        label: 'FCFS Avg WT = 12.0ms, SJF Avg WT = 4.5ms',
        isCorrect: false,
        explanation: 'Incorrect calculation. Sum of FCFS waiting times is 0 + 24 + 27 = 51ms, giving 51/3 = 17.0ms.',
      },
    ],
    conceptualExplanation:
      'The Convoy Effect occurs when a CPU-bound process with a large burst time occupies the CPU, causing short I/O-bound processes to queue up behind it like small cars behind a slow truck on a narrow road. SJF drastically eliminates this by serving short jobs first.',
  },
  {
    id: 'cpu-rr-quantum',
    category: 'cpu-scheduling',
    difficulty: 'Intermediate',
    title: 'Optimizing Round Robin Time Quantum',
    scenario: 'You have 4 processes each requiring 10ms of CPU burst, all arriving at t=0. Context switch overhead is negligible (0ms).',
    question: 'If you choose a time quantum of 1ms versus 10ms, how do the average turnaround times compare?',
    hint: 'With q=10ms, this degenerates into FCFS (P1 finishes at 10, P2 at 20, P3 at 30, P4 at 40). With q=1ms, all processes advance in parallel.',
    options: [
      {
        id: 'opt-1',
        label: 'q=10ms yields Avg TAT = 25ms, while q=1ms yields Avg TAT = 38.5ms',
        isCorrect: true,
        explanation: 'Correct! For q=10: P1 finishes at 10, P2 at 20, P3 at 30, P4 at 40 -> Avg TAT = (10+20+30+40)/4 = 25ms. For q=1: P1 finishes at 37, P2 at 38, P3 at 39, P4 at 40 -> Avg TAT = (37+38+39+40)/4 = 38.5ms. Very small quantums hurt turnaround time when processes have identical lengths!',
      },
      {
        id: 'opt-2',
        label: 'Both quantums produce identical Avg TAT of 25ms',
        isCorrect: false,
        explanation: 'Incorrect. Round robin causes processes of equal length to finish nearly simultaneously near the end of the total timeline.',
      },
      {
        id: 'opt-3',
        label: 'q=1ms produces faster Avg TAT because it is more fair',
        isCorrect: false,
        explanation: 'Incorrect. While q=1ms offers much better response time, it delays completion for earlier processes, increasing average turnaround time.',
      },
    ],
    conceptualExplanation:
      'Round Robin provides excellent interactive response time at the cost of higher turnaround times when burst lengths are similar. A rule of thumb in OS design is that 80% of CPU bursts should be shorter than the time quantum.',
  },
  {
    id: 'mem-belady-anomaly',
    category: 'memory',
    difficulty: 'Intermediate',
    title: "Belady's Anomaly Detection",
    scenario: 'Consider the page reference string: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]. You test this sequence under the FIFO page replacement algorithm using 3 frames and 4 frames.',
    question: "What happens to the number of page faults when you increase physical memory frames from 3 to 4 under FIFO?",
    hint: "Recall Belady's Anomaly where allocating more physical frames counter-intuitively increases page faults.",
    options: [
      {
        id: 'opt-1',
        label: 'Faults increase from 9 (with 3 frames) to 10 (with 4 frames)',
        isCorrect: true,
        explanation: "Correct! This is the canonical demonstration of Belady's Anomaly. FIFO does not satisfy the 'stack algorithm' inclusion property, meaning the set of pages in M frames is not always a subset of pages in M+1 frames.",
      },
      {
        id: 'opt-2',
        label: 'Faults decrease from 10 to 8 as expected with more memory',
        isCorrect: false,
        explanation: 'Incorrect. While intuitive, FIFO behaves anomalously on this specific reference string!',
      },
      {
        id: 'opt-3',
        label: 'Faults remain constant at 9 for both frame capacities',
        isCorrect: false,
        explanation: 'Incorrect. Run the simulation on the Memory Management page to verify that 4 frames produce 10 faults.',
      },
    ],
    conceptualExplanation:
      "Stack algorithms like LRU and Optimal never suffer from Belady's Anomaly because the set of pages in memory for n frames is always a subset of the pages for n+1 frames. FIFO is not a stack algorithm.",
  },
  {
    id: 'mem-ext-frag',
    category: 'memory',
    difficulty: 'Beginner',
    title: 'Recognizing External Fragmentation',
    scenario: 'A contiguous memory system has three free holes: 40 KB, 50 KB, and 70 KB (Total free memory = 160 KB). A new process arrives requesting 100 KB.',
    question: 'Can the process be allocated, and what memory phenomenon does this demonstrate?',
    hint: 'Contiguous allocation requires a single uninterrupted block of memory.',
    options: [
      {
        id: 'opt-1',
        label: 'Cannot be allocated due to External Fragmentation',
        isCorrect: true,
        explanation: 'Correct! Even though total free space (160 KB) exceeds the requested 100 KB, no single contiguous hole is large enough. This is the definition of external fragmentation.',
      },
      {
        id: 'opt-2',
        label: 'Allocated successfully by combining the 40 KB and 70 KB holes',
        isCorrect: false,
        explanation: 'Incorrect. In contiguous memory allocation, a process cannot be split across disjoint physical memory blocks.',
      },
      {
        id: 'opt-3',
        label: 'Cannot be allocated due to Internal Fragmentation',
        isCorrect: false,
        explanation: 'Incorrect. Internal fragmentation refers to wasted space inside an already allocated partition.',
      },
    ],
    conceptualExplanation:
      'External fragmentation is solved either by memory compaction (shuffling allocated blocks in memory, which is expensive) or by non-contiguous memory management systems like Paging and Segmentation.',
  },
  {
    id: 'deadlock-rag-cycle',
    category: 'deadlock',
    difficulty: 'Intermediate',
    title: 'Cycle vs Deadlock in Resource Allocation Graphs',
    scenario: 'You construct a Resource Allocation Graph containing a directed cycle. Resource R1 has 2 total instances, and Resource R2 has 2 total instances.',
    question: 'Does the existence of this cycle guarantee that the system is currently deadlocked?',
    hint: 'Consider whether another process holding an instance of R1 or R2 could finish and release its resource without participating in the cycle.',
    options: [
      {
        id: 'opt-1',
        label: 'No. In multi-instance systems, a cycle is necessary but not sufficient for deadlock',
        isCorrect: true,
        explanation: 'Correct! A cycle guarantees deadlock ONLY if every resource node in the cycle contains exactly 1 instance. If resources have multiple instances, an outside process holding an instance may terminate and break the cycle.',
      },
      {
        id: 'opt-2',
        label: 'Yes. Any directed cycle in a Resource Allocation Graph strictly implies deadlock',
        isCorrect: false,
        explanation: 'Incorrect. This rule holds only for single-instance resource systems.',
      },
      {
        id: 'opt-3',
        label: 'No. Cycles only indicate starvation, never deadlock',
        isCorrect: false,
        explanation: 'Incorrect. Cycles are a necessary condition for deadlock in resource allocation graphs.',
      },
    ],
    conceptualExplanation:
      'For single-instance resource graphs, cycle == deadlock. For multi-instance systems, a cycle is a warning sign, but deadlock occurs only if a knot exists or if the reduction algorithm fails to free all processes.',
  },
  {
    id: 'process-invalid-transition',
    category: 'process',
    difficulty: 'Beginner',
    title: 'Process State Transition Legality',
    scenario: 'A process is currently in the WAITING state blocked on an I/O disk read. The CPU core becomes completely idle.',
    question: 'Can the operating system scheduler directly transition this process from WAITING to RUNNING?',
    hint: 'Consider the role of the Ready Queue and the Short-Term Scheduler.',
    options: [
      {
        id: 'opt-1',
        label: 'No. It must first transition to READY when I/O completes, then be dispatched',
        isCorrect: true,
        explanation: 'Correct! A blocked process cannot execute instructions until its I/O data is ready. Once I/O completes, an interrupt moves it to the READY queue. The CPU dispatcher then selects it from the READY queue.',
      },
      {
        id: 'opt-2',
        label: 'Yes, if the CPU is idle, any process can jump directly to RUNNING',
        isCorrect: false,
        explanation: 'Incorrect. If a process attempted to run before its I/O data arrived in RAM, it would stall or execute invalid memory contents.',
      },
      {
        id: 'opt-3',
        label: 'Yes, but only if the process runs with root/kernel privileges',
        isCorrect: false,
        explanation: 'Incorrect. The 5-state process lifecycle is fundamental to kernel scheduling invariant rules.',
      },
    ],
    conceptualExplanation:
      'The Ready Queue represents all processes whose execution prerequisites are satisfied. Waiting processes are gated by hardware or event completion and must re-enter the Ready queue once their I/O interrupt fires.',
  },
];

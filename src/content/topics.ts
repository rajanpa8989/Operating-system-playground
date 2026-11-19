export interface TopicGuide {
  id: string;
  category: 'cpu-scheduling' | 'memory-management' | 'process-management' | 'deadlock-management';
  title: string;
  tagline: string;
  conceptIntro: string;
  whyItExists: string;
  realWorldAnalogy: string;
  workingPrinciple: string;
  stepByStepExample: string;
  advantages: string[];
  disadvantages: string[];
  timeComplexity: string;
  spaceComplexity: string;
  commonMistakes: string[];
  practicalApplications: string[];
  quickCheck: {
    question: string;
    answer: string;
  };
}

export const TOPIC_GUIDES: Record<string, TopicGuide> = {
  fcfs: {
    id: 'fcfs',
    category: 'cpu-scheduling',
    title: 'First-Come, First-Served (FCFS)',
    tagline: 'Simple FIFO dispatching with no preemption.',
    conceptIntro:
      'First-Come, First-Served (FCFS) is the most fundamental CPU scheduling algorithm. In FCFS, the process that requests the CPU first is allocated the CPU first, managed strictly through a First-In-First-Out (FIFO) queue.',
    whyItExists:
      'Operating systems require a deterministic baseline mechanism to service requests in the order of arrival. FCFS is trivial to implement and completely free of starvation.',
    realWorldAnalogy:
      'A single grocery store checkout line where the cashier refuses to let anyone cut ahead, regardless of whether a customer has a single bottle of water or a mountain of two overflowing shopping carts.',
    workingPrinciple:
      'When a process enters the Ready Queue, its Process Control Block (PCB) is linked onto the tail of the queue. When the CPU becomes free, the scheduler selects the process at the head of the queue, assigns the CPU, and runs it to completion (non-preemptive).',
    stepByStepExample:
      'Processes P1 (Burst 24ms, Arr 0), P2 (Burst 3ms, Arr 0), P3 (Burst 3ms, Arr 0). P1 executes from t=0 to t=24. P2 executes from t=24 to t=27. P3 executes from t=27 to t=30. Average Waiting Time: (0 + 24 + 27)/3 = 17ms.',
    advantages: [
      'Extremely simple to implement with minimal algorithmic overhead',
      'Completely starvation-free; every process will eventually execute',
      'Predictable FIFO ordering',
    ],
    disadvantages: [
      'Suffers from the severe Convoy Effect when short jobs queue behind long jobs',
      'Produces high average waiting and turnaround times',
      'Unsuitable for interactive time-sharing systems where quick response time is mandatory',
    ],
    timeComplexity: 'O(1) to enqueue and dequeue from ready queue.',
    spaceComplexity: 'O(N) where N is number of active processes in Ready Queue.',
    commonMistakes: [
      'Assuming FCFS can preempt a long-running process when a critical short job arrives.',
      'Forgetting that idle time occurs when no processes have arrived at t=0.',
    ],
    practicalApplications: [
      'Batch processing jobs submitted to compute clusters',
      'Simple embedded microcontroller command loops without real-time priorities',
    ],
    quickCheck: {
      question: 'What is the Convoy Effect?',
      answer:
        'The Convoy Effect occurs when a CPU-bound process with a long burst holds the processor, causing multiple short I/O-bound processes to wait helplessly in the ready queue, lowering overall device and CPU utilization.',
    },
  },
  sjf: {
    id: 'sjf',
    category: 'cpu-scheduling',
    title: 'Shortest Job First (SJF) & SRTF',
    tagline: 'Provably optimal minimum average waiting time.',
    conceptIntro:
      'Shortest Job First (SJF) associates with each process the length of its next CPU burst. When the CPU becomes available, it is assigned to the process with the smallest CPU burst. In preemptive mode (SRTF), newly arrived shorter jobs preempt the executing process.',
    whyItExists:
      'SJF was designed to minimize average waiting time across all jobs, mathematically proving that running short jobs first yields the lowest aggregate wait time.',
    realWorldAnalogy:
      'An express 10-items-or-less checkout counter at a supermarket, ensuring people with quick tasks leave immediately instead of waiting for a family doing a month of grocery shopping.',
    workingPrinciple:
      'Processes in the ready queue are sorted by remaining burst time. The scheduler always dispatches the minimum element. Ties are broken using arrival order (FCFS).',
    stepByStepExample:
      'P1 (BT 7), P2 (BT 4), P3 (BT 1). Running P3 (1ms) -> P2 (4ms) -> P1 (7ms) yields waiting times: P3=0ms, P2=1ms, P1=5ms. Average WT = (0+1+5)/3 = 2.0ms, compared to 7.0ms in FCFS!',
    advantages: [
      'Provably optimal for minimizing average waiting time',
      'Reduces ready queue length rapidly by eliminating short jobs quickly',
      'Maximizes throughput for short tasks',
    ],
    disadvantages: [
      'Impossible to know exact future CPU burst lengths in general-purpose OS (must be predicted using exponential averaging)',
      'Causes Starvation (indefinite blocking) for long processes if short jobs keep arriving',
    ],
    timeComplexity: 'O(log N) using a min-heap priority queue for process selection.',
    spaceComplexity: 'O(N) to store process metadata.',
    commonMistakes: [
      'Thinking SJF is practical without burst estimation (in real OS, burst time is predicted using tau_{n+1} = alpha * t_n + (1 - alpha) * tau_n).',
      'Confusing non-preemptive SJF with preemptive SRTF.',
    ],
    practicalApplications: [
      'Long-term batch scheduling where users declare estimated job runtimes',
      'Web server static asset delivery prioritizing small cache hits',
    ],
    quickCheck: {
      question: 'Why can long jobs starve under SRTF?',
      answer:
        'Because if a continuous stream of new processes with short burst times keeps arriving, the scheduler will perpetually favor them, leaving the long-running process trapped at the back of the queue.',
    },
  },
  roundRobin: {
    id: 'round-robin',
    category: 'cpu-scheduling',
    title: 'Round Robin (RR)',
    tagline: 'Fair, time-sliced multiplexing for interactive computing.',
    conceptIntro:
      'Round Robin (RR) is designed specifically for time-sharing systems. The CPU scheduler cycles through the ready queue, giving each process a small unit of CPU time called a time quantum (or time slice), typically between 10ms and 100ms.',
    whyItExists:
      'Modern multi-user and interactive systems require guaranteed responsiveness. No single process can monopolize the CPU, allowing multiple programs to appear to run simultaneously.',
    realWorldAnalogy:
      'A teacher giving 2 minutes of attention to each student in a circle with questions. If a question is not answered in 2 minutes, the teacher moves to the next student and returns around later.',
    workingPrinciple:
      'The ready queue is treated as a circular FIFO queue. The scheduler takes the head process, sets a timer interrupt for the quantum, and switches context. If the process finishes before the slice, it releases the CPU. If the timer interrupts, the process is moved to the tail of the queue.',
    stepByStepExample:
      'Processes P1 (BT 5ms), P2 (BT 3ms) with Quantum = 2ms. P1 runs 0..2 (rem 3) -> P2 runs 2..4 (rem 1) -> P1 runs 4..6 (rem 1) -> P2 runs 6..7 (finishes) -> P1 runs 7..8 (finishes).',
    advantages: [
      'Extremely fair; every process receives 1/n of the CPU time in slices of at most q',
      'Excellent response time for interactive desktop and terminal environments',
      'Completely starvation-free',
    ],
    disadvantages: [
      'Performance depends critically on quantum size (too large = degenerates into FCFS; too small = excessive context switch overhead)',
      'Average turnaround time can be higher than SJF when processes have similar burst times',
    ],
    timeComplexity: 'O(1) queue operations per scheduling decision.',
    spaceComplexity: 'O(N) for circular FIFO queue.',
    commonMistakes: [
      'Setting quantum smaller than hardware context-switch latency, spending more time switching registers than executing code.',
      'Assuming Round Robin always minimizes turnaround time.',
    ],
    practicalApplications: [
      'General purpose desktop and mobile operating system schedulers (Windows, macOS, Linux CFS time-slicing)',
      'Interactive cloud microservice load balancers',
    ],
    quickCheck: {
      question: 'What happens if the time quantum is extremely large?',
      answer:
        'If the time quantum is larger than the longest process burst time, Round Robin degenerates into ordinary First-Come First-Served (FCFS).',
    },
  },
  bankers: {
    id: 'bankers',
    category: 'deadlock-management',
    title: "Banker's Algorithm & Deadlock Avoidance",
    tagline: 'Deadlock avoidance through safe-state validation.',
    conceptIntro:
      "Dijkstra's Banker's Algorithm is a classic deadlock avoidance strategy. It models a banker dealing with customers seeking credit: the banker never allocates cash unless guaranteed that all customers can eventually complete their transactions.",
    whyItExists:
      'Deadlocks cause entire operating systems or database engines to freeze permanently. Avoidance algorithms dynamically evaluate resource requests before granting them to ensure the system never enters an unsafe state.',
    realWorldAnalogy:
      'A hardware tool rental shop with 3 power drills. If 2 contractors each demand up to 2 drills to finish their project, the shopkeeper will not hand out all 3 drills at once if both contractors would be left waiting on the 4th drill that does not exist.',
    workingPrinciple:
      'Processes must declare their maximum resource claim upfront. When a process requests resources, the OS tests whether granting it leaves the system in a "Safe State" (a state where at least one execution sequence allows all processes to finish). If unsafe, the request is denied or deferred.',
    stepByStepExample:
      'System with Available [3, 3, 2]. P1 has Need [1, 2, 2] <= Available. P1 executes and returns its Allocation [2, 0, 0], growing Available to [5, 3, 2]. Now P3, P4, P0, P2 can all execute in sequence. The state is SAFE.',
    advantages: [
      'Prevents deadlock without preempting processes or terminating tasks prematurely',
      'Provides formal mathematical safety guarantees',
    ],
    disadvantages: [
      'Requires processes to declare their absolute maximum resource needs in advance (rarely realistic in modern dynamic programs)',
      'Resources and process count must remain fixed',
      'Conservative: avoids states that might have run safely without deadlocking',
    ],
    timeComplexity: 'O(M * N^2) where N is number of processes and M is number of resource types.',
    spaceComplexity: 'O(N * M) to store Max, Allocation, and Need matrices.',
    commonMistakes: [
      'Assuming an "unsafe state" is identical to a deadlock. An unsafe state is NOT a deadlock; it is merely a state from which the OS can no longer prevent a deadlock if worst-case claims are demanded.',
      'Neglecting to check whether Request exceeds declared Need before checking Available.',
    ],
    practicalApplications: [
      'Database transaction managers allocating write locks on shared tables',
      'Mission-critical real-time avionics resource reservations',
    ],
    quickCheck: {
      question: 'Is an unsafe state always deadlocked?',
      answer:
        'No! An unsafe state is not necessarily deadlocked. It simply means that if processes suddenly demand their maximum declared resource claims, the operating system will not be able to prevent a deadlock.',
    },
  },
  pageReplacement: {
    id: 'page-replacement',
    category: 'memory-management',
    title: 'Page Replacement (FIFO, LRU, Optimal)',
    tagline: 'Virtual memory frame allocation and replacement algorithms.',
    conceptIntro:
      'When physical RAM is completely full and a thread accesses a page that is currently swapped out to disk, a Page Fault occurs. The OS must pick a victim frame to evict back to storage to make room for the incoming page.',
    whyItExists:
      'Virtual memory allows computers to execute programs larger than physical memory. High-performance page replacement algorithms minimize expensive disk/SSD I/O operations.',
    realWorldAnalogy:
      'A small desk that holds only 3 textbooks. When you need to read a 4th textbook, you must choose which book on your desk to return to the bookshelf: the oldest one (FIFO), the one you haven\'t opened in hours (LRU), or the one you know you will never look at again today (Optimal).',
    workingPrinciple:
      'FIFO evicts the frame loaded earliest. LRU evicts the frame that has not been accessed for the longest time period in the past. Optimal evicts the frame that will not be accessed for the longest time in the future.',
    stepByStepExample:
      'Reference string: [7, 0, 1, 2, 0, 3] with 3 frames. When 2 arrives, frames are [7, 0, 1]. In FIFO, 7 was loaded first, so 7 is replaced -> [2, 0, 1]. In LRU, 7 was least recently used, so 7 is replaced -> [2, 0, 1].',
    advantages: [
      'LRU performs near-optimal on real workloads with strong locality of reference',
      'Optimal provides the absolute theoretical lower bound on page faults for any reference sequence',
      'FIFO requires zero hardware access-bit support',
    ],
    disadvantages: [
      'Optimal is unimplementable in real-time general operating systems because the future cannot be predicted',
      'True LRU requires expensive hardware counters or stack updates on every single memory access',
      "FIFO suffers from Belady's Anomaly where more frames can cause MORE faults",
    ],
    timeComplexity: 'O(1) for FIFO queue, O(M) for LRU scan or O(1) with doubly linked hash map.',
    spaceComplexity: 'O(M) where M is the number of physical frames.',
    commonMistakes: [
      "Believing that adding RAM frames always reduces page faults under all algorithms (Belady's Anomaly disproves this for FIFO).",
      'Confusing a Page Hit with a Page Fault.',
    ],
    practicalApplications: [
      'Virtual memory manager in Linux (Clock / Second-Chance approximation of LRU)',
      'Database buffer pool caches (e.g., PostgreSQL, InnoDB)',
      'Web browser disk and in-memory caches',
    ],
    quickCheck: {
      question: "Why can't the Optimal page replacement algorithm be used in general-purpose operating systems?",
      answer:
        'Because the operating system cannot foresee the future memory access instructions of arbitrary running applications; it is used as a theoretical benchmark to measure how close practical algorithms get to perfection.',
    },
  },
};

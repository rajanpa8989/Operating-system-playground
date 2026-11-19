# OS PLAYGROUND
### Learn by Breaking. Understand by Building.

> An interactive Operating System laboratory and simulation platform designed for computer science students and software engineers to understand how computers actually work through experimentation, visualization, and practical challenges.

---

## 🔬 Overview & Vision

Operating systems are often taught through dry mathematical formulas or abstract slides. **OS Playground** bridges the gap between theory and intuition by providing a high-craft, laboratory-grade interactive environment.

Students can:
- **Experiment** with dynamic process workloads and arrival patterns.
- **Visualize** internal execution flows (Gantt timelines, MMU address translation pipelines, hardware PCB registers, Resource Allocation Graph cycles).
- **Compare** scheduling and page replacement algorithms side-by-side on identical workloads.
- **Solve** conceptual and mathematical operating system challenges with instant diagnostic feedback.
- **Save & Export** experiments for reports and study groups.

---

## 🛠 Tech Stack & Architecture

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a specialized Technical Laboratory theme:
  - Deep charcoal `#090a0f` base
  - Restrained olive `#162217` surfaces
  - Selective neon lime `#9cf944` accent
  - High-precision hairline borders and monospace metrics badges
- **Visualization**: React-based custom SVG components (Dynamic Gantt Chart, 5-State Machine Diagram, Resource Allocation Graph, Memory Allocation Strip, Frame Matrix Grid)
- **Validation**: [Zod](https://github.com/colinhacks/zod)
- **Testing**: [Vitest](https://vitest.dev/) (35 unit tests covering edge cases, preemption, fragmentation, and deadlock safety)
- **Execution Model**: Deterministic, pure TypeScript client-side simulation engines for instant zero-latency feedback without server bottlenecks.

---

## 📦 Project Structure

```
operating-system/
├── src/
│   ├── algorithms/               # Pure, deterministic algorithmic engines
│   │   ├── cpu-scheduling/       # FCFS, SJF, SRTF, Round Robin, Priority
│   │   ├── memory-management/    # Contiguous (First/Best/Worst Fit), Paging, FIFO/LRU/Optimal, Segmentation
│   │   ├── process-management/   # 5-State lifecycle, PCB register context switching
│   │   └── deadlock/             # Banker's safety & request algorithm, RAG cycle detection
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Laboratory Overview & Entry Points
│   │   ├── cpu-scheduling/       # Module 1: CPU Scheduling Simulator
│   │   ├── memory-management/    # Module 2: Memory Management Lab
│   │   ├── process-management/   # Module 3: Process Lifecycle & PCB Lab
│   │   ├── deadlock-management/  # Module 4: Deadlock Management Lab
│   │   ├── comparison/           # Module 5: Side-by-Side Algorithm Benchmark
│   │   ├── challenges/           # Module 6: Practical Diagnostics & Challenges
│   │   ├── learning/             # Module 7: Deep Algorithmic Documentation
│   │   └── experiments/          # Module 8: Saved Experiments & Presets
│   ├── components/               # Specialized UI & Visualization components
│   │   ├── layout/               # Navbar, Sidebar, AppLayout
│   │   └── simulator/
│   │       ├── cpu/              # GanttChart, QueueVisualizer, PlaybackControls, MetricsTable, ProcessInputEditor
│   │       ├── memory/           # ContiguousVisualizer, PagingVisualizer, PageReplacementVisualizer, SegmentationVisualizer
│   │       ├── process/          # StateDiagram, PCBInspector, ProcessTransitionConsole
│   │       └── deadlock/         # BankersVisualizer, RAGVisualizer
│   ├── content/                  # Curated challenges, presets, and deep educational guides
│   ├── types/                    # Strict TypeScript type definitions
│   └── tests/                    # Vitest unit test suites
├── public/                       # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vitest.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+` or `v20+` (tested on Node `v24.21.0`)
- npm, pnpm, or yarn

### Installation

1. **Clone or navigate into the workspace directory**:
   ```bash
   cd "operating system"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run Unit Tests**:
   ```bash
   npm test
   ```

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Comprehensive Feature Checklist

### 1. CPU Scheduling Simulator (`/cpu-scheduling`)
- [x] **Algorithms**: FCFS, SJF (Non-preemptive), SRTF (Preemptive), Round Robin (configurable quantum), Priority (Preemptive & Non-preemptive).
- [x] **Deterministic Tie-Breaking**: Earliest arrival time, then numerical process ID order.
- [x] **Gantt Chart**: Interactive responsive SVG Gantt chart with idle time hatching, preemption points, and active playhead indicator.
- [x] **Playback Engine**: Play, Pause, Step Forward, Step Back, Timeline Scrubber, Speed Multiplier (0.5x, 1x, 2x, 4x).
- [x] **Live Queue Tracking**: Ready Queue, active CPU Core execution slot, and Terminated process archive.
- [x] **Full Metrics Table**: Arrival Time (AT), Burst Time (BT), Priority, Completion Time (CT), Turnaround Time (TAT), Waiting Time (WT), Response Time (RT).
- [x] **Summary Metrics**: Average WT, Average TAT, Average RT, CPU Utilization (%), Throughput (proc/ms), Context Switches.
- [x] **Presets**: "The Convoy Effect", "Mixed Workload", "Priority Starvation", "Equal Bursts Sensitivity".

### 2. Memory Management Lab (`/memory-management`)
- [x] **Contiguous Allocation**: First Fit, Best Fit, Worst Fit with dynamic hole splitting, block coalescing, and external fragmentation calculation.
- [x] **Paging**: Logical-to-Physical translation engine (`p = floor(addr / pageSize)`, `d = addr % pageSize`, `physical = frame * pageSize + d`). Interactive valid/invalid bit toggle to trigger Page Faults.
- [x] **Page Replacement**: FIFO, LRU, and Optimal replacement policies. Step-by-step frame matrix table with Hit/Fault indicators.
- [x] **Belady's Anomaly Demo**: Canonical reference string `[1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]` demonstrating that 4 frames produce more faults (10) than 3 frames (9) under FIFO.
- [x] **Segmentation**: Segment table with Base and Limit checks. Automatically detects and traps Segmentation Faults (SIGSEGV) when `offset >= limit`.

### 3. Process Lifecycle Lab (`/process-management`)
- [x] **5-State Process Machine**: Interactive SVG diagram representing NEW, READY, RUNNING, WAITING, and TERMINATED states.
- [x] **Kernel Event Dispatcher**: Triggers Admit, Dispatch, Timer Interrupt, I/O Wait, I/O Complete, and Exit events.
- [x] **Constraint Enforcement**: Prevents invalid transitions (e.g. WAITING directly to RUNNING without passing through Ready Queue).
- [x] **PCB Inspector**: Inspects Program Counter (PC in Hex), CPU Registers (EAX, EBX, ECX, EDX, ESP), Memory Base & Limit, and accumulated CPU runtime.
- [x] **Context Switching Log**: Detailed explanation of kernel mode switches and register preservation.

### 4. Deadlock Management Lab (`/deadlock-management`)
- [x] **Banker's Safety Algorithm**: Calculates Need Matrix (`Need = Max - Allocation`), evaluates Available vector, derives complete safe execution sequences `<P1 -> P3 -> P4 -> P0 -> P2>`, or detects Unsafe states.
- [x] **Dynamic Resource Request Tester**: Validates `Request <= Need` and `Request <= Available`, executes simulated hypothetical allocation, and grants or rejects with rollback.
- [x] **Resource Allocation Graph (RAG)**: Interactive SVG graph modeling process nodes, multi-instance resource nodes, request edges, and allocation edges.
- [x] **Cycle Detection**: Depth-First Search cycle detector with glowing edge highlighting and formal deadlock necessity/sufficiency explanations.

### 5. Algorithm Comparison (`/comparison`)
- [x] **Side-by-Side CPU Benchmark**: Executes all 6 CPU algorithms on identical process workloads, ranking performance metrics and rendering aligned comparative Gantt charts.
- [x] **Page Replacement Benchmark**: Compares FIFO, LRU, and Optimal on identical reference strings and frame capacities.

### 6. Practical Challenges Mode (`/challenges`)
- [x] Curated conceptual and mathematical diagnostic questions across CPU scheduling, memory, deadlocks, and process lifecycles.
- [x] Immediate feedback with conceptual explanations and hints.
- [x] Persistent completion tracking via browser localStorage.

### 7. Documentation & Guides (`/learning`)
- [x] Deep, student-friendly explanations with real-world analogies, working principles, advantages, disadvantages, time/space complexity, and common pitfalls.

### 8. Saved Experiments (`/experiments`)
- [x] Presets for canonical OS edge cases.
- [x] Export to JSON for lab reports and persistent storage.

---

## 🔒 Verification & Quality Assurance

- **Unit Tests**: 35 Vitest tests passing across all algorithmic suites (`src/tests/`):
  - `cpu-scheduling.test.ts`: 8 tests (FCFS, SJF, SRTF preemption, Round Robin quantum order, Priority).
  - `memory.test.ts`: 13 tests (First/Best/Worst fit, coalescing, fragmentation, paging address translation, FIFO/LRU/Optimal, Belady's anomaly, segmentation faults).
  - `deadlock.test.ts`: 10 tests (Banker's safety sequence, resource request granting & rejection, deadlock detection, RAG cycle detection).
  - `process.test.ts`: 4 tests (State lifecycle transitions, conflict prevention, illegal transition traps).
- **TypeScript & Build**: Zero TypeScript errors (`next build` outputting 12 optimized static routes).

---

## ⚠️ Known Limitations & Scope Notes

1. **Client-Side Simulation**: Algorithms run in deterministic, client-side TypeScript engines. This eliminates network latency and server costs, but simulations with process counts exceeding 1,000 items may introduce UI render lag.
2. **Persistence**: Current experiment history and challenge completion utilize browser `localStorage`. For multi-device cloud synchronization, PostgreSQL and Prisma ORM schemas can be connected when cloud credentials are provided.

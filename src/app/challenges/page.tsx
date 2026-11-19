'use client';

import React, { useState, useEffect } from 'react';
import { CHALLENGES } from '@/content/challenges';
import { Challenge, ChallengeOption } from '@/types/challenge';
import { Award, CheckCircle2, AlertTriangle, HelpCircle, RotateCcw, Sparkles } from 'lucide-react';

export default function ChallengesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeAnswers, setActiveAnswers] = useState<Record<string, string>>({}); // challengeId -> optionId
  const [shownHints, setShownHints] = useState<Record<string, boolean>>({});

  // Load completion history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('os_playground_completed_challenges');
      if (saved) {
        setCompletedIds(JSON.parse(saved));
      }
    } catch {
      // Local storage fallback
    }
  }, []);

  const handleSelectOption = (challenge: Challenge, option: ChallengeOption) => {
    setActiveAnswers((prev) => ({ ...prev, [challenge.id]: option.id }));

    if (option.isCorrect && !completedIds.includes(challenge.id)) {
      const updated = [...completedIds, challenge.id];
      setCompletedIds(updated);
      try {
        localStorage.setItem('os_playground_completed_challenges', JSON.stringify(updated));
      } catch {
        // storage fallback
      }
    }
  };

  const handleToggleHint = (id: string) => {
    setShownHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetChallenge = (id: string) => {
    setActiveAnswers((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const filteredChallenges = CHALLENGES.filter(
    (c) => selectedCategory === 'all' || c.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2433] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#2d3a2e] bg-[#142015] text-[#9cf944]">
              <Award className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              Practical Computer Science Challenges
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Test your understanding on real algorithmic edge cases, trade-offs, and invariants.
          </p>
        </div>

        {/* Real Progress Counter */}
        <div className="flex items-center gap-2 rounded border border-[#1e2433] bg-[#0c0e14] px-3 py-1.5 text-xs font-mono">
          <span className="text-slate-400">Solved:</span>
          <span className="font-bold text-[#9cf944]">
            {completedIds.length} / {CHALLENGES.length}
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded border border-[#1e2433] bg-[#0c0e14] p-1 text-xs font-mono">
        {[
          { id: 'all', label: 'All Domains' },
          { id: 'cpu-scheduling', label: 'CPU Scheduling' },
          { id: 'memory', label: 'Memory Systems' },
          { id: 'deadlock', label: 'Deadlocks' },
          { id: 'process', label: 'Process Lifecycle' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`rounded px-3 py-1.5 transition-colors ${
              selectedCategory === tab.id
                ? 'bg-[#182319] text-[#9cf944] font-bold border border-[#2d402e]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Challenge Cards Grid */}
      <div className="space-y-4">
        {filteredChallenges.map((challenge) => {
          const selectedOptionId = activeAnswers[challenge.id];
          const selectedOption = challenge.options.find((o) => o.id === selectedOptionId);
          const isCompleted = completedIds.includes(challenge.id);
          const hintOpen = shownHints[challenge.id];

          return (
            <div
              key={challenge.id}
              className={`rounded border bg-[#0c0e14] p-5 space-y-4 transition-colors ${
                isCompleted ? 'border-[#2d402e]' : 'border-[#1e2433]'
              }`}
            >
              {/* Challenge Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#181d28] pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                      challenge.difficulty === 'Beginner'
                        ? 'border border-sky-800/60 bg-sky-950/30 text-sky-400'
                        : challenge.difficulty === 'Intermediate'
                        ? 'border border-amber-800/60 bg-amber-950/30 text-amber-400'
                        : 'border border-purple-800/60 bg-purple-950/30 text-purple-400'
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                  <h3 className="text-sm font-bold text-white font-sans">{challenge.title}</h3>
                </div>

                {isCompleted && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-[#9cf944]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Completed</span>
                  </span>
                )}
              </div>

              {/* Scenario & Question */}
              <div className="space-y-2 text-xs font-mono">
                <div className="rounded border border-[#1b2230] bg-[#10131a] p-3 text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1 uppercase text-[10px]">Scenario:</strong>
                  {challenge.scenario}
                </div>

                <div className="text-white font-semibold pt-1">
                  Q: {challenge.question}
                </div>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2">
                {challenge.options.map((opt) => {
                  const isChosen = selectedOptionId === opt.id;
                  let borderStyle = 'border-[#232a3b] bg-[#121620] hover:border-slate-500 text-slate-200';

                  if (isChosen) {
                    borderStyle = opt.isCorrect
                      ? 'border-[#2d402e] bg-[#142215] text-[#9cf944] ring-1 ring-[#9cf944]'
                      : 'border-rose-900/80 bg-rose-950/30 text-rose-300 ring-1 ring-rose-500';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(challenge, opt)}
                      className={`w-full text-left rounded border p-3 text-xs font-mono transition-all flex items-start gap-3 ${borderStyle}`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isChosen
                            ? opt.isCorrect
                              ? 'border-[#9cf944] bg-[#9cf944] text-slate-950'
                              : 'border-rose-500 bg-rose-500 text-white'
                            : 'border-slate-600'
                        }`}
                      >
                        {isChosen && (opt.isCorrect ? '✓' : '×')}
                      </div>
                      <span className="flex-1 leading-snug">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback and In-Depth Explanation */}
              {selectedOption && (
                <div
                  className={`rounded border p-3.5 text-xs font-mono space-y-2 ${
                    selectedOption.isCorrect
                      ? 'border-[#2d402e] bg-[#121c13] text-[#9cf944]'
                      : 'border-rose-900/60 bg-rose-950/20 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {selectedOption.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <span>{selectedOption.isCorrect ? 'Correct!' : 'Incorrect Approach:'}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {selectedOption.explanation}
                  </p>
                  <p className="text-slate-400 text-[10px] border-t border-white/10 pt-1.5">
                    <strong>Conceptual Takeaway: </strong>
                    {challenge.conceptualExplanation}
                  </p>
                </div>
              )}

              {/* Hint & Reset Bar */}
              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <button
                  onClick={() => handleToggleHint(challenge.id)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  <HelpCircle className="h-3 w-3" />
                  <span>{hintOpen ? 'Hide Hint' : 'View Theoretical Hint'}</span>
                </button>

                {selectedOption && (
                  <button
                    onClick={() => handleResetChallenge(challenge.id)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>

              {hintOpen && (
                <div className="rounded border border-[#1b2230] bg-[#10131a] p-2.5 text-[11px] font-mono text-amber-300/90">
                  <strong>Hint: </strong> {challenge.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

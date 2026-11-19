'use client';

import React, { useState } from 'react';
import { TOPIC_GUIDES, TopicGuide } from '@/content/topics';
import {
  BookOpen,
  Clock,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Layers,
} from 'lucide-react';

export default function LearningPage() {
  const [selectedKey, setSelectedKey] = useState<string>('fcfs');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const guide = TOPIC_GUIDES[selectedKey] || TOPIC_GUIDES.fcfs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#1e2433] pb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-[#2d3a2e] bg-[#142015] text-[#9cf944]">
            <BookOpen className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">
            Operating Systems Learning Laboratory & Reference
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-400 font-mono">
          Rigorous computer science guides explaining why operating systems algorithms exist, how they work, and their practical trade-offs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 rounded border border-[#1e2433] bg-[#0c0e14] p-3 space-y-1 text-xs font-mono">
          <div className="text-[10px] uppercase text-slate-400 font-semibold px-2 py-1">
            Core Topics
          </div>
          {Object.entries(TOPIC_GUIDES).map(([key, topic]) => {
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedKey(key);
                  setShowAnswer(false);
                }}
                className={`w-full text-left rounded px-3 py-2 transition-colors flex flex-col gap-0.5 ${
                  isSelected
                    ? 'border border-[#2d402e] bg-[#142015] text-[#9cf944] font-semibold'
                    : 'text-slate-300 hover:bg-[#121620] hover:text-white'
                }`}
              >
                <span>{topic.title}</span>
                <span className="text-[10px] text-slate-400 truncate font-normal">
                  {topic.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Educational Article Content */}
        <div className="lg:col-span-3 rounded border border-[#1e2433] bg-[#0c0e14] p-6 space-y-6 text-xs font-mono">
          {/* Article Header */}
          <div className="border-b border-[#181d28] pb-4 space-y-1">
            <h1 className="text-xl font-bold text-white font-sans">{guide.title}</h1>
            <p className="text-slate-400 text-xs font-mono">{guide.tagline}</p>
          </div>

          {/* 1. Concept Intro & Why It Exists */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
                1. Concept Introduction
              </h3>
              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                {guide.conceptIntro}
              </p>
            </div>

            <div>
              <h3 className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
                2. Why Does This Algorithm Exist?
              </h3>
              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                {guide.whyItExists}
              </p>
            </div>
          </div>

          {/* 3. Real-World Analogy */}
          <div className="rounded border border-[#1b2230] bg-[#10131a] p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
              <Lightbulb className="h-4 w-4" />
              <span>Real-World Analogy</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              {guide.realWorldAnalogy}
            </p>
          </div>

          {/* 4. Working Principle & Step-by-Step Example */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">
                3. Working Principle
              </h3>
              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                {guide.workingPrinciple}
              </p>
            </div>

            <div className="rounded border border-[#1e2433] bg-[#080a0e] p-3.5 space-y-1">
              <span className="text-[10px] uppercase text-[#9cf944] font-semibold block">
                Concrete Step-by-Step Example:
              </span>
              <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                {guide.stepByStepExample}
              </p>
            </div>
          </div>

          {/* 5. Advantages & Disadvantages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded border border-[#2d402e] bg-[#121c13] p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-[#9cf944] font-bold text-[11px] uppercase">
                <CheckCircle2 className="h-4 w-4" />
                <span>Advantages</span>
              </div>
              <ul className="space-y-1 text-slate-300 font-sans text-xs list-disc list-inside">
                {guide.advantages.map((adv, idx) => (
                  <li key={idx}>{adv}</li>
                ))}
              </ul>
            </div>

            <div className="rounded border border-rose-900/60 bg-rose-950/20 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px] uppercase">
                <AlertTriangle className="h-4 w-4" />
                <span>Disadvantages & Trade-offs</span>
              </div>
              <ul className="space-y-1 text-slate-300 font-sans text-xs list-disc list-inside">
                {guide.disadvantages.map((dis, idx) => (
                  <li key={idx}>{dis}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 6. Complexity & Engineering Mistakes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            <div className="rounded border border-[#1e2433] bg-[#10131a] p-3 space-y-1.5">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Asymptotic Complexity:
              </span>
              <div>
                <strong>Time Complexity: </strong>
                <span className="text-[#9cf944]">{guide.timeComplexity}</span>
              </div>
              <div>
                <strong>Space Complexity: </strong>
                <span className="text-sky-400">{guide.spaceComplexity}</span>
              </div>
            </div>

            <div className="rounded border border-[#1e2433] bg-[#10131a] p-3 space-y-1.5">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                Common Student Mistakes:
              </span>
              <ul className="space-y-1 text-slate-300 font-sans text-xs list-disc list-inside">
                {guide.commonMistakes.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 7. Practical OS Applications */}
          <div>
            <h3 className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">
              Production Operating System Applications
            </h3>
            <ul className="space-y-1 text-slate-300 font-sans text-xs list-disc list-inside">
              {guide.practicalApplications.map((app, idx) => (
                <li key={idx}>{app}</li>
              ))}
            </ul>
          </div>

          {/* 8. Knowledge-Check Question */}
          <div className="rounded border border-[#1b2230] bg-[#10131a] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-sky-400 font-semibold">
                Knowledge-Check Diagnostic
              </span>
              <button
                onClick={() => setShowAnswer((prev) => !prev)}
                className="text-[11px] text-[#9cf944] hover:underline"
              >
                {showAnswer ? 'Hide Solution' : 'Reveal Solution'}
              </button>
            </div>
            <div className="text-white font-semibold">{guide.quickCheck.question}</div>
            {showAnswer && (
              <div className="border-t border-[#1e2433] pt-2 text-slate-300 text-[11px] font-sans leading-relaxed">
                {guide.quickCheck.answer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

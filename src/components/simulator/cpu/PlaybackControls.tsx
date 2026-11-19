'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentStepIndex: number;
  totalSteps: number;
  speed: number;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onScrub: (index: number) => void;
}

export function PlaybackControls({
  isPlaying,
  currentStepIndex,
  totalSteps,
  speed,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
  onScrub,
}: PlaybackControlsProps) {
  const isAtStart = currentStepIndex <= 0;
  const isAtEnd = currentStepIndex >= totalSteps - 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#1e2433] bg-[#0c0e14] p-3 text-xs font-mono">
      {/* Control Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onReset}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#232a3b] bg-[#141822] text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
          title="Reset to Start"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onStepBackward}
          disabled={isAtStart}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#232a3b] bg-[#141822] text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Step Backward"
        >
          <SkipBack className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onPlayPause}
          disabled={totalSteps <= 0}
          className={`flex h-8 px-3 items-center gap-1.5 rounded font-semibold transition-colors ${
            isPlaying
              ? 'border border-[#9cf944] bg-[#162516] text-[#9cf944]'
              : 'border border-[#2d3a2e] bg-[#142015] text-[#9cf944] hover:bg-[#192b1b]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>PLAY</span>
            </>
          )}
        </button>

        <button
          onClick={onStepForward}
          disabled={isAtEnd}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#232a3b] bg-[#141822] text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Step Forward"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Scrubber slider */}
      <div className="flex flex-1 items-center gap-3 min-w-[180px] max-w-xs sm:max-w-md">
        <span className="text-[11px] text-slate-400 shrink-0">
          Step <strong className="text-white">{Math.min(currentStepIndex + 1, totalSteps)}</strong> of{' '}
          {totalSteps}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer accent-[#9cf944] bg-[#1e2433] rounded"
        />
      </div>

      {/* Speed multiplier selector */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">SPEED:</span>
        {[0.5, 1, 2, 4].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`rounded px-2 py-1 text-[10px] transition-colors ${
              speed === s
                ? 'border border-[#2d402e] bg-[#162516] text-[#9cf944] font-bold'
                : 'border border-[#232a3b] bg-[#141822] text-slate-400 hover:text-white'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}

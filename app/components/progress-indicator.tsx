'use client';

import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  percentage: number;
}

export default function ProgressIndicator({ percentage }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Circular Progress */}
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90 transform" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-border"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className={cn(
              'transition-all duration-300',
              percentage === 100 ? 'stroke-emerald-500' : 'stroke-[color:var(--accent-secondary)]'
            )}
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-strong">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}

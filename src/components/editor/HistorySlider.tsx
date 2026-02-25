'use client';

import { useDesignStore } from '@/store/design-store';
import { cn } from '@/lib/utils';
import { History } from 'lucide-react';

export function HistorySlider() {
  const { history, historyIndex, jumpToHistory } = useDesignStore();

  if (history.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 px-3">
      <History className="w-3 h-3 text-slate-400 flex-shrink-0" />
      <input
        type="range"
        min={0}
        max={history.length - 1}
        value={historyIndex}
        onChange={(e) => jumpToHistory(parseInt(e.target.value, 10))}
        className={cn(
          'w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500',
          '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm'
        )}
        title={`History step ${historyIndex + 1} of ${history.length}`}
      />
      <span className="text-[10px] text-slate-400 tabular-nums flex-shrink-0">
        {historyIndex + 1}/{history.length}
      </span>
    </div>
  );
}

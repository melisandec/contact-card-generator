'use client';

import { useMemo, useState } from 'react';
import { useDesignStore } from '@/store/design-store';
import { analyzeDesign, type DesignScore } from '@/lib/designScorer';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function DesignScorePanel() {
  const { elements, background, canvasWidth, canvasHeight } = useDesignStore();
  const [expanded, setExpanded] = useState(false);

  const score: DesignScore = useMemo(
    () => analyzeDesign(elements, background, canvasWidth, canvasHeight),
    [elements, background, canvasWidth, canvasHeight]
  );

  const getScoreColor = (total: number) => {
    if (total >= 90) return 'text-green-600';
    if (total >= 70) return 'text-yellow-600';
    if (total >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (total: number) => {
    if (total >= 90) return 'bg-green-50 border-green-200';
    if (total >= 70) return 'bg-yellow-50 border-yellow-200';
    if (total >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />;
      default:
        return <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />;
    }
  };

  return (
    <div className={cn('rounded-lg border p-3', getScoreBg(score.total))}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className={cn('text-lg font-bold', getScoreColor(score.total))}>
            {score.total}/100
          </div>
          <span className="text-xs text-slate-600">Design Score</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-slate-600">{score.summary}</p>
          <div className="space-y-1.5">
            {score.results.map(({ rule, result }) => (
              <div
                key={rule.id}
                className="flex items-start gap-2 text-xs"
              >
                {getSeverityIcon(result.severity)}
                <div className="flex-1">
                  <div className="font-medium text-slate-700">
                    {rule.name}
                    <span className="ml-1 text-slate-400">({result.score}/100)</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{result.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

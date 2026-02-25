'use client';

import React, { useCallback, useRef } from 'react';
import { useDesignStore } from '@/store/design-store';

interface GuidesOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
}

export function GuidesOverlay({ canvasWidth, canvasHeight, zoom }: GuidesOverlayProps) {
  const { guides, guidesVisible, guidesLocked, addGuide, updateGuide, removeGuide } = useDesignStore();
  const draggingRef = useRef<string | null>(null);

  const handleGuideMouseDown = useCallback(
    (e: React.MouseEvent, guideId: string) => {
      if (guidesLocked) return;
      e.stopPropagation();
      draggingRef.current = guideId;
      const guide = guides.find((g) => g.id === guideId);
      if (!guide) return;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!draggingRef.current) return;
        const rect = (e.target as HTMLElement).closest('[data-guides-container]')?.getBoundingClientRect();
        if (!rect) return;
        if (guide.orientation === 'horizontal') {
          const newPos = Math.round((ev.clientY - rect.top) / zoom);
          updateGuide(draggingRef.current, Math.max(0, Math.min(newPos, canvasHeight)));
        } else {
          const newPos = Math.round((ev.clientX - rect.left) / zoom);
          updateGuide(draggingRef.current, Math.max(0, Math.min(newPos, canvasWidth)));
        }
      };

      const handleMouseUp = () => {
        draggingRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [guides, guidesLocked, updateGuide, zoom, canvasWidth, canvasHeight]
  );

  const handleGuideContextMenu = useCallback(
    (e: React.MouseEvent, guideId: string) => {
      e.preventDefault();
      if (guidesLocked) return;
      if (confirm('Delete this guide?')) {
        removeGuide(guideId);
      }
    },
    [guidesLocked, removeGuide]
  );

  // Ruler click handler to create guides
  const handleHorizontalRulerClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = Math.round((e.clientY - rect.bottom) / zoom);
      if (position >= 0 && position <= canvasHeight) {
        addGuide('horizontal', position);
      }
    },
    [addGuide, zoom, canvasHeight]
  );

  const handleVerticalRulerClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = Math.round((e.clientX - rect.right) / zoom);
      if (position >= 0 && position <= canvasWidth) {
        addGuide('vertical', position);
      }
    },
    [addGuide, zoom, canvasWidth]
  );

  if (!guidesVisible) return null;

  const rulerSize = 20;
  const tickInterval = 50;

  return (
    <>
      {/* Horizontal ruler (top) */}
      <div
        className="absolute top-0 bg-slate-100 border-b border-slate-300 select-none overflow-hidden"
        style={{
          left: rulerSize,
          right: 0,
          height: rulerSize,
          zIndex: 50,
          cursor: 'col-resize',
        }}
        onClick={handleVerticalRulerClick}
      >
        <svg width="100%" height={rulerSize} className="text-slate-400">
          {Array.from({ length: Math.ceil(canvasWidth * zoom / tickInterval) + 1 }, (_, i) => {
            const pos = i * tickInterval;
            return (
              <g key={i}>
                <line x1={pos} y1={rulerSize - 8} x2={pos} y2={rulerSize} stroke="currentColor" strokeWidth="1" />
                <text x={pos + 2} y={rulerSize - 10} fontSize="8" fill="currentColor">
                  {Math.round(pos / zoom)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Vertical ruler (left) */}
      <div
        className="absolute left-0 bg-slate-100 border-r border-slate-300 select-none overflow-hidden"
        style={{
          top: rulerSize,
          bottom: 0,
          width: rulerSize,
          zIndex: 50,
          cursor: 'row-resize',
        }}
        onClick={handleHorizontalRulerClick}
      >
        <svg width={rulerSize} height="100%" className="text-slate-400">
          {Array.from({ length: Math.ceil(canvasHeight * zoom / tickInterval) + 1 }, (_, i) => {
            const pos = i * tickInterval;
            return (
              <g key={i}>
                <line x1={rulerSize - 8} y1={pos} x2={rulerSize} y2={pos} stroke="currentColor" strokeWidth="1" />
                <text x={2} y={pos + 10} fontSize="8" fill="currentColor">
                  {Math.round(pos / zoom)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Corner square */}
      <div
        className="absolute top-0 left-0 bg-slate-200 border-b border-r border-slate-300"
        style={{ width: rulerSize, height: rulerSize, zIndex: 51 }}
      />

      {/* Guide lines - rendered as an overlay on the canvas */}
      <div
        data-guides-container
        className="absolute pointer-events-none"
        style={{
          left: rulerSize,
          top: rulerSize,
          width: canvasWidth * zoom,
          height: canvasHeight * zoom,
          zIndex: 40,
        }}
      >
        {guides.map((guide) => (
          <div
            key={guide.id}
            className="absolute pointer-events-auto"
            style={
              guide.orientation === 'horizontal'
                ? {
                    left: 0,
                    right: 0,
                    top: guide.position * zoom - 1,
                    height: 3,
                    cursor: guidesLocked ? 'default' : 'row-resize',
                  }
                : {
                    top: 0,
                    bottom: 0,
                    left: guide.position * zoom - 1,
                    width: 3,
                    cursor: guidesLocked ? 'default' : 'col-resize',
                  }
            }
            onMouseDown={(e) => handleGuideMouseDown(e, guide.id)}
            onContextMenu={(e) => handleGuideContextMenu(e, guide.id)}
          >
            <div
              className="bg-cyan-400"
              style={
                guide.orientation === 'horizontal'
                  ? { position: 'absolute', left: 0, right: 0, top: 1, height: 1 }
                  : { position: 'absolute', top: 0, bottom: 0, left: 1, width: 1 }
              }
            />
          </div>
        ))}
      </div>
    </>
  );
}

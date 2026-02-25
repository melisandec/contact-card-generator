'use client';

import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDesignStore, resolveElementStyles } from '@/store/design-store';
import { DesignElement } from '@/types';
import { cn } from '@/lib/utils';

interface CanvasElementProps {
  element: DesignElement;
  isSelected: boolean;
  zoom: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<DesignElement>) => void;
}

function CanvasElement({ element, isSelected, zoom, onSelect, onUpdate }: CanvasElementProps) {
  const dragStartRef = useRef<{ x: number; y: number; elX: number; elY: number } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (element.locked) return;
      e.stopPropagation();
      onSelect(element.id);

      const startX = e.clientX;
      const startY = e.clientY;
      const startElX = element.x;
      const startElY = element.y;

      dragStartRef.current = { x: startX, y: startY, elX: startElX, elY: startElY };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragStartRef.current) return;
        const dx = (ev.clientX - dragStartRef.current.x) / zoom;
        const dy = (ev.clientY - dragStartRef.current.y) / zoom;
        onUpdate(element.id, {
          x: Math.round(dragStartRef.current.elX + dx),
          y: Math.round(dragStartRef.current.elY + dy),
        });
      };

      const handleMouseUp = () => {
        dragStartRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [element, zoom, onSelect, onUpdate]
  );

  const getBackgroundStyle = (): React.CSSProperties => {
    if (element.type === 'shape') {
      return { backgroundColor: element.fill ?? '#6366f1' };
    }
    return {};
  };

  const getShadowStyle = (): string => {
    if (element.shadowBlur && element.shadowBlur > 0) {
      return `${element.shadowOffsetX ?? 0}px ${element.shadowOffsetY ?? 0}px ${element.shadowBlur}px ${element.shadowColor ?? 'rgba(0,0,0,0.3)'}`;
    }
    return 'none';
  };

  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation ?? 0}deg)`,
    opacity: element.opacity ?? 1,
    cursor: element.locked ? 'not-allowed' : 'move',
    userSelect: 'none',
    boxShadow: getShadowStyle(),
    zIndex: element.zIndex,
    display: element.visible ? undefined : 'none',
    ...getBackgroundStyle(),
  };

  if (element.type === 'shape' && element.shapeType === 'circle') {
    elementStyle.borderRadius = '50%';
  } else if (element.type === 'shape') {
    elementStyle.borderRadius = element.borderRadius ?? 0;
    if (element.stroke && element.strokeWidth) {
      elementStyle.border = `${element.strokeWidth}px solid ${element.stroke}`;
    }
  }

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            style={{
              fontFamily: element.fontFamily ?? 'Inter',
              fontSize: element.fontSize ?? 16,
              fontWeight: element.fontWeight ?? '400',
              fontStyle: element.fontStyle ?? 'normal',
              textDecoration: element.textDecoration ?? 'none',
              textAlign: element.textAlign ?? 'left',
              color: element.color ?? '#000000',
              lineHeight: element.lineHeight ?? 1.4,
              letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {element.content ?? 'Text'}
          </div>
        );

      case 'image':
        return element.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={element.src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: element.objectFit ?? 'cover',
              display: 'block',
            }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
            No image
          </div>
        );

      case 'qrcode':
        return element.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={element.src} alt="QR Code" style={{ width: '100%', height: '100%' }} draggable={false} />
        ) : (
          <div className="w-full h-full bg-white flex items-center justify-center text-slate-400 text-xs border border-slate-200">
            QR Code
          </div>
        );

      case 'shape':
        return null;

      default:
        return null;
    }
  };

  return (
    <div
      style={elementStyle}
      onMouseDown={handleMouseDown}
      className={cn(isSelected && 'ring-2 ring-indigo-500 ring-offset-1')}
    >
      {renderContent()}

      {/* Resize handles */}
      {isSelected && !element.locked && (
        <>
          {[
            { pos: 'top-0 left-0', cursor: 'nw-resize' },
            { pos: 'top-0 right-0', cursor: 'ne-resize' },
            { pos: 'bottom-0 left-0', cursor: 'sw-resize' },
            { pos: 'bottom-0 right-0', cursor: 'se-resize' },
          ].map(({ pos, cursor }, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-2.5 h-2.5 bg-white border-2 border-indigo-500 rounded-sm`}
              style={{ cursor, transform: 'translate(-50%, -50%)', zIndex: 1000 }}
            />
          ))}
        </>
      )}
    </div>
  );
}

interface CanvasProps {
  exportRef?: React.RefObject<HTMLDivElement>;
}

export function Canvas({ exportRef }: CanvasProps) {
  const { elements, selectedElementId, background, zoom, canvasWidth, canvasHeight, selectElement, updateElement, currentSide, isDoubleSided, globalStyles } =
    useDesignStore();

  const getBackgroundStyle = (): React.CSSProperties => {
    if (background.type === 'solid') {
      return { backgroundColor: background.color ?? '#ffffff' };
    }
    if (background.type === 'gradient' && background.gradient) {
      const { type, angle, stops } = background.gradient;
      const stopsStr = stops.map((s) => `${s.color} ${s.position}%`).join(', ');
      if (type === 'linear') {
        return { backgroundImage: `linear-gradient(${angle ?? 135}deg, ${stopsStr})` };
      } else {
        return { backgroundImage: `radial-gradient(circle, ${stopsStr})` };
      }
    }
    if (background.type === 'image' && background.imageUrl) {
      return {
        backgroundImage: `url(${background.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { backgroundColor: '#ffffff' };
  };

  const canvasStyle: React.CSSProperties = {
    width: canvasWidth,
    height: canvasHeight,
    position: 'relative',
    overflow: 'hidden',
    ...getBackgroundStyle(),
  };

  return (
    <div className="flex-1 canvas-workspace flex items-center justify-center overflow-auto p-8">
      <motion.div
        animate={{ scale: zoom }}
        transition={{ type: 'tween', duration: 0.1 }}
        style={{ transformOrigin: 'center center' }}
      >
        {/* Export target */}
        <div
          ref={exportRef}
          style={canvasStyle}
          className="shadow-2xl"
          onClick={() => selectElement(null)}
        >
          {elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={resolveElementStyles(element, globalStyles)}
              isSelected={selectedElementId === element.id}
              zoom={zoom}
              onSelect={selectElement}
              onUpdate={updateElement}
            />
          ))}

          {/* Empty back side prompt */}
          {isDoubleSided && currentSide === 'back' && elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-sm text-slate-400">Add elements to the back of your card.</p>
                <p className="text-xs text-slate-300 mt-1">Use the sidebar to add text, shapes, or images.</p>
              </div>
            </div>
          )}

          {/* Side indicator */}
          {isDoubleSided && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full pointer-events-none">
              {currentSide === 'front' ? 'Front side' : 'Back side'}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

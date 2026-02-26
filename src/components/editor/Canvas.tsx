'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesignStore, resolveElementStyles } from '@/store/design-store';
import { DesignElement, CanvasBackground } from '@/types';
import { cn } from '@/lib/utils';
import { AlignmentToolbar } from './AlignmentToolbar';
import { getAutoShrinkFontSize, isTextOverflowing } from '@/lib/textResizing';

interface CanvasElementProps {
  element: DesignElement;
  isSelected: boolean;
  isMultiSelected: boolean;
  isEditing: boolean;
  zoom: number;
  onSelect: (id: string, additive?: boolean) => void;
  onUpdate: (id: string, updates: Partial<DesignElement>) => void;
  onDoubleClick: (id: string) => void;
  onExitEditing: () => void;
}

function CanvasElement({ element, isSelected, isMultiSelected, isEditing, zoom, onSelect, onUpdate, onDoubleClick, onExitEditing }: CanvasElementProps) {
  const dragStartRef = useRef<{ x: number; y: number; elX: number; elY: number } | null>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (element.locked) return;
      if (isEditing) return; // Don't start drag while editing
      e.stopPropagation();
      onSelect(element.id, e.shiftKey);

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
    [element, zoom, onSelect, onUpdate, isEditing]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (element.locked || element.type !== 'text') return;
      e.stopPropagation();
      onDoubleClick(element.id);
    },
    [element, onDoubleClick]
  );

  // Focus the textarea when entering edit mode
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

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
      case 'text': {
        const effectiveFontSize = element.autoShrink
          ? getAutoShrinkFontSize(element)
          : (element.fontSize ?? 16);
        const showOverflow = !element.autoShrink && isTextOverflowing(element);

        if (isEditing) {
          return (
            <textarea
              ref={editInputRef}
              value={element.content ?? ''}
              onChange={(e) => onUpdate(element.id, { content: e.target.value })}
              onBlur={() => onExitEditing()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onExitEditing();
                }
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                fontFamily: element.fontFamily ?? 'Inter',
                fontSize: effectiveFontSize,
                fontWeight: element.fontWeight ?? '400',
                fontStyle: element.fontStyle ?? 'normal',
                textDecoration: element.textDecoration ?? 'none',
                textAlign: element.textAlign ?? 'left',
                color: element.color ?? '#000000',
                lineHeight: element.lineHeight ?? 1.4,
                letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
                width: '100%',
                height: '100%',
                resize: 'none',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                padding: 0,
                margin: 0,
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            />
          );
        }

        return (
          <>
            <div
              style={{
                fontFamily: element.fontFamily ?? 'Inter',
                fontSize: effectiveFontSize,
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
            {showOverflow && (
              <div
                className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                title="Text overflows – adjust font size or enable auto-shrink"
              >
                !
              </div>
            )}
          </>
        );
      }

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

      case 'group':
        return (
          <div className="w-full h-full relative border-2 border-dashed border-blue-300 rounded-sm">
            {element.children?.map((child) => (
              <div
                key={child.id}
                style={{
                  position: 'absolute',
                  left: child.x,
                  top: child.y,
                  width: child.width,
                  height: child.height,
                  opacity: child.opacity ?? 1,
                  backgroundColor: child.type === 'shape' ? child.fill ?? '#6366f1' : undefined,
                  borderRadius: child.type === 'shape' && child.shapeType === 'circle' ? '50%' : child.borderRadius ?? 0,
                  fontSize: child.fontSize ?? 16,
                  fontFamily: child.fontFamily ?? 'Inter',
                  color: child.color ?? '#000000',
                  fontWeight: child.fontWeight ?? '400',
                  textAlign: child.textAlign ?? 'left',
                  lineHeight: child.lineHeight ?? 1.4,
                  overflow: 'hidden',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {child.type === 'text' && (child.content ?? 'Text')}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={cn(
        isSelected && !isEditing && 'ring-2 ring-indigo-500 ring-offset-1',
        isEditing && 'ring-2 ring-dashed ring-indigo-400 ring-offset-1',
        isMultiSelected && !isSelected && 'ring-2 ring-blue-400 ring-offset-1'
      )}
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

function getBackgroundCss(background: CanvasBackground): React.CSSProperties {
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
}

/* Read-only preview of a side (used in split view) */
function CanvasPreview({
  elements,
  background,
  width,
  height,
  label,
  isActive,
  onClick,
}: {
  elements: DesignElement[];
  background: CanvasBackground;
  width: number;
  height: number;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const { globalStyles } = useDesignStore();
  const scale = 0.35;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={cn('text-[10px] font-semibold uppercase tracking-wider', isActive ? 'text-indigo-600' : 'text-slate-400')}>
        {label}
      </span>
      <div
        onClick={onClick}
        className={cn(
          'cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-md',
          isActive ? 'border-indigo-500 shadow-md' : 'border-slate-200'
        )}
        style={{ width: width * scale, height: height * scale }}
      >
        <div
          style={{
            width,
            height,
            position: 'relative',
            overflow: 'hidden',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            ...getBackgroundCss(background),
          }}
        >
          {elements.map((el) => {
            const resolved = resolveElementStyles(el, globalStyles);
            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: resolved.x,
                  top: resolved.y,
                  width: resolved.width,
                  height: resolved.height,
                  transform: `rotate(${resolved.rotation ?? 0}deg)`,
                  opacity: resolved.opacity ?? 1,
                  display: resolved.visible ? undefined : 'none',
                  backgroundColor:
                    resolved.type === 'shape' ? resolved.fill ?? '#6366f1' : undefined,
                  borderRadius:
                    resolved.type === 'shape' && resolved.shapeType === 'circle' ? '50%' : resolved.borderRadius ?? 0,
                  overflow: 'hidden',
                  fontSize: resolved.fontSize ?? 16,
                  fontFamily: resolved.fontFamily ?? 'Inter',
                  color: resolved.color ?? '#000000',
                  fontWeight: resolved.fontWeight ?? '400',
                  textAlign: resolved.textAlign ?? 'left',
                  lineHeight: resolved.lineHeight ?? 1.4,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {resolved.type === 'text' && (resolved.content ?? 'Text')}
                {resolved.type === 'image' && resolved.src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolved.src} alt="" style={{ width: '100%', height: '100%', objectFit: resolved.objectFit ?? 'cover' }} draggable={false} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface CanvasProps {
  exportRef?: React.RefObject<HTMLDivElement>;
  splitView?: boolean;
}

export function Canvas({ exportRef, splitView }: CanvasProps) {
  const {
    elements, selectedElementId, selectedElementIds, editingElementId, background, zoom, canvasWidth, canvasHeight,
    selectElement, toggleSelectElement, updateElement, setEditingElementId, currentSide, isDoubleSided, globalStyles,
    frontLayers, backLayers, frontBackground, backBackground, setCurrentSide,
  } = useDesignStore();

  const [flipKey, setFlipKey] = useState(currentSide);

  // Track side changes for flip animation
  useEffect(() => {
    setFlipKey(currentSide);
  }, [currentSide]);

  const canvasStyle: React.CSSProperties = {
    width: canvasWidth,
    height: canvasHeight,
    position: 'relative',
    overflow: 'hidden',
    ...getBackgroundCss(background),
  };

  // Determine the elements for the inactive side (for split-view preview)
  const previewFrontElements = currentSide === 'front' ? elements : frontLayers;
  const previewBackElements = currentSide === 'back' ? elements : backLayers;
  const previewFrontBg = currentSide === 'front' ? background : frontBackground;
  const previewBackBg = currentSide === 'back' ? background : backBackground;

  const handleElementSelect = useCallback(
    (id: string, additive?: boolean) => {
      if (additive) {
        toggleSelectElement(id);
      } else {
        selectElement(id);
      }
    },
    [selectElement, toggleSelectElement]
  );

  const handleElementDoubleClick = useCallback(
    (id: string) => {
      setEditingElementId(id);
    },
    [setEditingElementId]
  );

  const handleExitEditing = useCallback(() => {
    setEditingElementId(null);
  }, [setEditingElementId]);

  return (
    <div className="flex-1 canvas-workspace flex items-center justify-center overflow-auto p-8">
      {/* Split-view previews on the left */}
      {isDoubleSided && splitView && (
        <div className="flex flex-col gap-4 mr-6 flex-shrink-0">
          <CanvasPreview
            elements={previewFrontElements}
            background={previewFrontBg}
            width={canvasWidth}
            height={canvasHeight}
            label="Front"
            isActive={currentSide === 'front'}
            onClick={() => setCurrentSide('front')}
          />
          <CanvasPreview
            elements={previewBackElements}
            background={previewBackBg}
            width={canvasWidth}
            height={canvasHeight}
            label="Back"
            isActive={currentSide === 'back'}
            onClick={() => setCurrentSide('back')}
          />
        </div>
      )}

      <motion.div
        animate={{ scale: zoom }}
        transition={{ type: 'tween', duration: 0.1 }}
        style={{ transformOrigin: 'center center', perspective: 1200 }}
      >
        {/* Flip container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={flipKey}
            initial={isDoubleSided ? { rotateY: 90, opacity: 0.6 } : false}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0.6 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Export target */}
            <div
              ref={exportRef}
              style={canvasStyle}
              className="shadow-2xl"
              onClick={() => { selectElement(null); setEditingElementId(null); }}
            >
              {elements.map((element) => (
                <CanvasElement
                  key={element.id}
                  element={resolveElementStyles(element, globalStyles)}
                  isSelected={selectedElementId === element.id}
                  isMultiSelected={selectedElementIds.includes(element.id)}
                  isEditing={editingElementId === element.id}
                  zoom={zoom}
                  onSelect={handleElementSelect}
                  onUpdate={updateElement}
                  onDoubleClick={handleElementDoubleClick}
                  onExitEditing={handleExitEditing}
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
        </AnimatePresence>
      </motion.div>

      {/* Alignment toolbar - floating above canvas when multi-selected */}
      {selectedElementIds.length >= 2 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <AlignmentToolbar />
        </div>
      )}
    </div>
  );
}

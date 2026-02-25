'use client';

import { useDesignStore } from '@/store/design-store';
import { Button } from '@/components/ui/Button';
import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalSpaceBetween,
  AlignVerticalSpaceBetween,
  RectangleHorizontal,
  RectangleVertical,
  Group,
  Ungroup,
} from 'lucide-react';

export function AlignmentToolbar() {
  const {
    selectedElementIds,
    selectedElementId,
    elements,
    alignElements,
    distributeElements,
    matchDimensions,
    groupElements,
    ungroupElements,
  } = useDesignStore();

  const multiSelected = selectedElementIds.length >= 2;
  const canDistribute = selectedElementIds.length >= 3;
  const selectedElement = selectedElementId
    ? elements.find((el) => el.id === selectedElementId)
    : null;
  const isGroup = selectedElement?.type === 'group';

  if (!multiSelected && !isGroup) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-lg">
      {multiSelected && (
        <>
          {/* Alignment buttons */}
          <div className="flex items-center gap-0.5" title="Align">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => alignElements('left')}
              title="Align left edges"
            >
              <AlignStartVertical className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => alignElements('center-h')}
              title="Align horizontal centers"
            >
              <AlignCenterVertical className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => alignElements('right')}
              title="Align right edges"
            >
              <AlignEndVertical className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => alignElements('top')}
              title="Align top edges"
            >
              <AlignStartHorizontal className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => alignElements('center-v')}
              title="Align vertical centers"
            >
              <AlignCenterHorizontal className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => alignElements('bottom')}
              title="Align bottom edges"
            >
              <AlignEndHorizontal className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Distribution buttons */}
          <div className="flex items-center gap-0.5" title="Distribute">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => distributeElements('horizontal')}
              disabled={!canDistribute}
              title="Distribute horizontally"
            >
              <AlignHorizontalSpaceBetween className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => distributeElements('vertical')}
              disabled={!canDistribute}
              title="Distribute vertically"
            >
              <AlignVerticalSpaceBetween className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Match dimensions */}
          <div className="flex items-center gap-0.5" title="Match dimensions">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => matchDimensions('width')}
              title="Match width (widest)"
            >
              <RectangleHorizontal className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => matchDimensions('height')}
              title="Match height (tallest)"
            >
              <RectangleVertical className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Group */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={groupElements}
            title="Group elements (Ctrl+G)"
          >
            <Group className="w-4 h-4" />
          </Button>
        </>
      )}

      {isGroup && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={ungroupElements}
          title="Ungroup elements (Ctrl+Shift+G)"
        >
          <Ungroup className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

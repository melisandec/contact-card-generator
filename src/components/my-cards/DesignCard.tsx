'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Design } from '@/types';
import { Button } from '@/components/ui/Button';
import { Pencil, Copy, Trash2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesignCardProps {
  design: Design;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DesignCard({ design, onDuplicate, onDelete }: DesignCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formattedDate = new Date(design.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(design.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className={cn(
        'group relative bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-200',
        isHovered && 'shadow-lg border-indigo-200 scale-[1.02]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setConfirmDelete(false);
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[7/4] bg-slate-100 overflow-hidden">
        {design.thumbnail || design.thumbnailUrl ? (
          <img
            src={design.thumbnailUrl || design.thumbnail}
            alt={design.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Layers className="w-12 h-12" />
          </div>
        )}

        {/* Double-sided badge */}
        {design.isDoubleSided && (
          <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            2-sided
          </span>
        )}

        {/* Hover action bar */}
        <div
          className={cn(
            'absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Link href={`/editor?id=${design.id}`}>
            <Button size="sm" variant="default" title="Edit design" aria-label={`Edit ${design.name}`}>
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          </Link>
          <Button
            size="icon-sm"
            variant="secondary"
            onClick={() => onDuplicate(design.id)}
            title="Duplicate design"
            aria-label={`Duplicate ${design.name}`}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant={confirmDelete ? 'destructive' : 'secondary'}
            onClick={handleDelete}
            title={confirmDelete ? 'Click again to confirm' : 'Delete design'}
            aria-label={`Delete ${design.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Card info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-slate-800 truncate" title={design.name}>
          {design.name}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Edited {formattedDate}</p>
        {design.tags && design.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {design.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

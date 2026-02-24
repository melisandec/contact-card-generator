'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useDesigns, duplicateDesign, deleteDesign } from '@/hooks/useDesign';
import { DesignCard } from '@/components/my-cards/DesignCard';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Layers,
  Loader2,
  Pencil,
  Copy,
  Trash2,
} from 'lucide-react';
import { debounce } from '@/lib/utils';

type SortOption = 'updatedAt' | 'createdAt' | 'name';
type ViewMode = 'grid' | 'list';

export default function MyCardsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('updatedAt');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { designs, total, isLoading, error, mutate } = useDesigns({
    search,
    sort,
  });

  const debouncedSearch = useMemo(
    () => debounce((...args: unknown[]) => setSearch(args[0] as string), 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleDuplicate = useCallback(
    async (id: string) => {
      try {
        await duplicateDesign(id);
        mutate();
      } catch (err) {
        console.error('Failed to duplicate design:', err);
      }
    },
    [mutate]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteDesign(id);
        mutate();
      } catch (err) {
        console.error('Failed to delete design:', err);
      }
    },
    [mutate]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Cards</h1>
            <p className="text-sm text-slate-500 mt-1">
              {total > 0 ? `${total} saved design${total !== 1 ? 's' : ''}` : 'Your saved designs will appear here'}
            </p>
          </div>
          <Link href="/editor">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Create New Card
            </Button>
          </Link>
        </div>

        {/* Search and controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search designs..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full h-9 pl-9 pr-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Search designs"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Sort designs"
            >
              <option value="updatedAt">Last Edited</option>
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
            </select>

            {/* View mode toggle */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                aria-label="Grid view"
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                aria-label="List view"
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-slate-500">Failed to load designs. Please try again.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => mutate()}>
              Retry
            </Button>
          </div>
        ) : designs.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <Layers className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              {search ? 'No designs found' : 'No saved cards yet'}
            </h2>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              {search
                ? 'Try adjusting your search terms.'
                : 'Create your first card to get started. Your designs will be saved here for easy access.'}
            </p>
            {!search && (
              <Link href="/editor">
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  Create Your First Card
                </Button>
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {designs.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          /* List view */
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {designs.map((design) => (
              <div
                key={design.id}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
              >
                {/* Mini thumbnail */}
                <div className="w-16 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {design.thumbnail || design.thumbnailUrl ? (
                    <img
                      src={design.thumbnailUrl || design.thumbnail}
                      alt={design.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Layers className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-800 truncate">{design.name}</h3>
                  <p className="text-xs text-slate-400">
                    Edited {new Date(design.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Badges */}
                <div className="hidden sm:flex items-center gap-2">
                  {design.isDoubleSided && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">
                      2-sided
                    </span>
                  )}
                  {design.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link href={`/editor?id=${design.id}`}>
                    <Button size="icon-sm" variant="ghost" title="Edit" aria-label={`Edit ${design.name}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleDuplicate(design.id)}
                    title="Duplicate"
                    aria-label={`Duplicate ${design.name}`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleDelete(design.id)}
                    title="Delete"
                    className="text-red-400 hover:text-red-500 hover:bg-red-50"
                    aria-label={`Delete ${design.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

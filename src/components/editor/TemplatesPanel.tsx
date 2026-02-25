'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useDesignStore } from '@/store/design-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { Template } from '@/types';

const CATEGORIES = ['all', 'corporate', 'creative', 'minimal', 'tech', 'social', 'event', 'real-estate'];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TemplatesPanel() {
  const { loadDesign, loadFullDesign } = useDesignStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const queryParams = new URLSearchParams();
  if (activeCategory !== 'all') queryParams.set('category', activeCategory);
  if (search) queryParams.set('q', search);

  const { data, isLoading } = useSWR<{ templates: Template[] }>(
    `/api/templates?${queryParams.toString()}`,
    fetcher
  );

  const applyTemplate = (template: Template) => {
    if (template.isDoubleSided && template.frontLayers && template.backLayers) {
      loadFullDesign({
        frontLayers: template.frontLayers,
        backLayers: template.backLayers,
        frontBackground: template.background,
        backBackground: template.backBackground,
        isDoubleSided: true,
        width: template.width,
        height: template.height,
      });
    } else {
      loadDesign(template.elements, template.background, template.width, template.height);
    }
  };

  return (
    <div className="p-3 space-y-3">
      <Input
        placeholder="Search templates..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize',
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {data?.templates?.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onApply={() => applyTemplate(template)}
            />
          ))}
        </div>
      )}

      {data?.templates?.length === 0 && (
        <div className="text-center text-xs text-slate-400 py-8">
          No templates found
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template, onApply }: { template: Template; onApply: () => void }) {
  const bg = template.background;
  const bgStyle: React.CSSProperties = {};

  if (bg.type === 'solid') {
    bgStyle.backgroundColor = bg.color;
  } else if (bg.type === 'gradient' && bg.gradient) {
    const stops = bg.gradient.stops.map((s) => `${s.color} ${s.position}%`).join(', ');
    bgStyle.backgroundImage = `linear-gradient(${bg.gradient.angle ?? 135}deg, ${stops})`;
  }

  const textEls = template.elements.filter((e) => e.type === 'text').slice(0, 2);

  return (
    <div
      className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
      onClick={onApply}
    >
      <div className="aspect-video p-2 flex flex-col justify-end" style={bgStyle}>
        {textEls.map((el, i) => (
          <div
            key={i}
            className="truncate"
            style={{
              fontFamily: el.fontFamily,
              fontSize: Math.max(6, (el.fontSize ?? 16) * 0.25),
              fontWeight: el.fontWeight,
              color: el.color,
            }}
          >
            {el.content}
          </div>
        ))}
      </div>

      {/* Double-sided badge */}
      {template.isDoubleSided && (
        <span className="absolute top-1.5 right-1.5 bg-indigo-600 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
          2-sided
        </span>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <Button
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          onClick={(e) => { e.stopPropagation(); onApply(); }}
        >
          Apply
        </Button>
      </div>
      <div className="px-2 py-1.5 bg-white">
        <p className="text-xs font-medium text-slate-700 truncate">{template.name}</p>
        <p className="text-[10px] text-slate-400 capitalize">{template.category}</p>
      </div>
    </div>
  );
}

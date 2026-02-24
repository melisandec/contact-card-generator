'use client';

import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

interface Tab {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  tabsClassName?: string;
}

export function Tabs({ tabs, value, onValueChange, children, className, tabsClassName }: TabsProps) {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange} className={cn('flex flex-col', className)}>
      <RadixTabs.List className={cn('flex items-center border-b border-slate-200 bg-white', tabsClassName)}>
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 border-b-2 border-transparent -mb-px',
              'hover:text-slate-700 hover:bg-slate-50 transition-colors',
              'data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600'
            )}
          >
            {tab.icon}
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  );
}

export const TabContent = RadixTabs.Content;

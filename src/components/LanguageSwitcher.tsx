'use client';

import { useI18n, supportedLocales, type Locale } from '@/i18n';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const current = supportedLocales.find((l) => l.code === locale) ?? supportedLocales[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 transition-colors"
          title="Change language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{current.flag} {current.code.toUpperCase()}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[160px] bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 text-sm"
          sideOffset={4}
          align="end"
        >
          {supportedLocales.map((loc) => (
            <DropdownMenu.Item
              key={loc.code}
              className={cn(
                'px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer outline-none flex items-center gap-2',
                locale === loc.code ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
              )}
              onClick={() => setLocale(loc.code as Locale)}
            >
              <span>{loc.flag}</span>
              <span className="flex-1">{loc.nativeName}</span>
              {locale === loc.code && (
                <span className="text-[10px] text-indigo-500">✓</span>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

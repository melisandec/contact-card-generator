'use client';

import Link from 'next/link';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 gap-4">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-800">CardCrafter</span>
      </Link>

      <nav className="hidden md:flex items-center gap-6 ml-4">
        <Link href="/editor" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
          Editor
        </Link>
        <Link href="/my-cards" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
          My Cards
        </Link>
        <Link href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
          Templates
        </Link>
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Link href="/auth/signin">
          <Button variant="ghost" size="sm">Sign in</Button>
        </Link>
        <Link href="/auth/signup">
          <Button size="sm">Get started</Button>
        </Link>
      </div>
    </header>
  );
}

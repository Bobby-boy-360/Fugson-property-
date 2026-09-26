'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AdminShortletView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#12897F] flex items-center justify-center">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
        Coming Soon!!!
      </h1>
      <p className="text-sm text-slate-500 max-w-md">
        Shortlet management is still being built. Check back soon.
      </p>
    </div>
  );
}
import React, { useState } from 'react';
import { Copy, Check, FileCode, X, ExternalLink } from 'lucide-react';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NEXTJS_FILES = [
  {
    name: 'middleware.ts',
    path: 'middleware.ts',
    description: 'Next.js App Router Middleware with RBAC cookie inspection & redirects',
  },
  {
    name: 'app/login/page.tsx',
    path: 'app/login/page.tsx',
    description: 'Magic Link Request Screen with simulated verification links',
  },
  {
    name: 'app/(dashboards)/admin/layout.tsx',
    path: 'app/(dashboards)/admin/layout.tsx',
    description: 'Admin Master Layout with persistent sidebar & admin profile',
  },
  {
    name: 'app/(dashboards)/admin/page.tsx',
    path: 'app/(dashboards)/admin/page.tsx',
    description: 'Admin Dashboard, Metrics (₦2.88M), Recent Payments Table, & Tenant Details Modal',
  },
  {
    name: 'app/(dashboards)/agent/layout.tsx',
    path: 'app/(dashboards)/agent/layout.tsx',
    description: 'Restricted Agent Layout (ONLY My Properties, My Tenants, Commission Tracker)',
  },
  {
    name: 'app/(dashboards)/agent/page.tsx',
    path: 'app/(dashboards)/agent/page.tsx',
    description: 'Agent Dashboard with assigned properties & unremitted commissions table',
  },
  {
    name: 'app/pay/[token]/page.tsx',
    path: 'app/pay/[token]/page.tsx',
    description: 'Tenant Public Portal with WhatsApp token verification & payment controls',
  },
];

export default function CodeViewerModal({ isOpen, onClose }: CodeViewerModalProps) {
  const [selectedFile, setSelectedFile] = useState(NEXTJS_FILES[0].path);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0B1D2E] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#12897F] flex items-center justify-center text-white">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Next.js App Router Codebase Inspector</h2>
              <p className="text-xs text-slate-300">
                All 6 required Next.js foundational files with TypeScript, RBAC, and Tailwind CSS.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* File selector sidebar */}
          <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-3 space-y-1 overflow-y-auto">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Target Next.js Files
            </div>
            {NEXTJS_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => {
                  setSelectedFile(file.path);
                  setCopied(false);
                }}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition cursor-pointer ${
                  selectedFile === file.path
                    ? 'bg-[#12897F] text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <div className="font-mono text-xs truncate">{file.name}</div>
                <div
                  className={`text-[10px] mt-0.5 truncate ${
                    selectedFile === file.path ? 'text-teal-100' : 'text-slate-400'
                  }`}
                >
                  {file.description}
                </div>
              </button>
            ))}
          </div>

          {/* Instructions / File Details */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#12897F] bg-teal-50 px-2.5 py-1 rounded border border-teal-100">
                  {selectedFile}
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  {NEXTJS_FILES.find((f) => f.path === selectedFile)?.description}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs leading-relaxed space-y-2 border border-slate-800">
              <div className="text-emerald-400 font-semibold">// Location in Project:</div>
              <div className="text-white font-bold text-sm">/{selectedFile}</div>
              <div className="text-slate-400 pt-2 border-t border-slate-800">
                This file has been created directly in your repository workspace and is ready to copy into your Next.js App Router project or export via AI Studio settings.
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800">Next.js Integration Guide:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Deploy alongside your Node.js + PostgreSQL backend on Railway.</li>
                <li>Uses standard App Router conventions (<code className="bg-slate-200 px-1 rounded font-mono">layout.tsx</code>, <code className="bg-slate-200 px-1 rounded font-mono">page.tsx</code>, <code className="bg-slate-200 px-1 rounded font-mono">middleware.ts</code>).</li>
                <li>Interactive client components marked with <code className="bg-slate-200 px-1 rounded font-mono">'use client'</code>.</li>
                <li>Design system strictly adheres to PropertyPro's <code className="bg-slate-200 px-1 rounded font-mono">#0B1D2E</code> sidebar and <code className="bg-slate-200 px-1 rounded font-mono">#12897F</code> accent teal.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import TenantPublicPortal from '@/app/pay/[token]/page';

export default function TenantPage({
  onNavigate,
}: {
  onNavigate?: (path: string) => void;
}) {
  return (
    <TenantPublicPortal
      params={{ token: 'fg-tenant-98231' }}
      onNavigate={onNavigate}
    />
  );
}

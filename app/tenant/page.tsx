'use client';

import React from 'react';
import TenantPublicPortal from '@/app/pay/[token]/page';
import { getCurrentUser } from '@/src/utils/auth';

export default function TenantPage({
  onNavigate,
}: {
  onNavigate?: (path: string) => void;
}) {
  const currentUser = typeof window !== 'undefined' ? getCurrentUser() : null;
  return (
    <TenantPublicPortal
      params={{ token: currentUser?.tenantId }}
      onNavigate={onNavigate}
    />
  );
}

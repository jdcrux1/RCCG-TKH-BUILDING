'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    // Only refresh when the window tab is active and visible
    const handleRefresh = () => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    };

    const interval = setInterval(handleRefresh, intervalMs);

    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [router, intervalMs]);

  return null;
}

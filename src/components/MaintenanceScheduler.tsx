'use client';

import { useEffect } from 'react';

function getMsUntil3AM() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(3, 0, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

export default function MaintenanceScheduler() {
  useEffect(() => {
    const runMaintenance = async () => {
      try {
        await fetch('/api/db-maintenance', { cache: 'no-store' });
      } catch (e) {}
    };

    const scheduleNextRun = () => {
      const msUntil3AM = getMsUntil3AM();
      setTimeout(() => {
        runMaintenance();
        scheduleNextRun();
      }, msUntil3AM);
    };

    runMaintenance();
    scheduleNextRun();
  }, []);

  return null;
}
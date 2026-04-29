export function getTier(monthlyPledge: number): string {
  if (monthlyPledge >= 1000000) return 'Cornerstone Partner';
  if (monthlyPledge >= 500000) return 'Pillar Builder';
  if (monthlyPledge >= 200000) return 'Foundation Stone';
  if (monthlyPledge >= 100000) return 'Nehemiah Builder';
  if (monthlyPledge >= 50000) return 'Covenant Partners';
  if (monthlyPledge >= 20000) return 'Faithful Hand';
  if (monthlyPledge >= 10000) return 'Open-Heart';
  if (monthlyPledge >= 5000) return 'Willing Heart';
  return 'Supporter';
}

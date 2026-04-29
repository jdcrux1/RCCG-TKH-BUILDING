export function getTier(monthlyPledge: number): string {
  if (monthlyPledge === 1000000) return 'Cornerstone Partner';
  if (monthlyPledge === 500000) return 'Pillar Builder';
  if (monthlyPledge === 200000) return 'Foundation Stone';
  if (monthlyPledge === 100000) return 'Nehemiah Builder';
  if (monthlyPledge === 50000) return 'Covenant Partners';
  if (monthlyPledge === 20000) return 'Faithful Hand';
  if (monthlyPledge === 10000) return 'Open-Heart';
  if (monthlyPledge === 5000) return 'Willing Heart';
  return 'Supporter';
}

export const TIER_COLORS: Record<string, string> = {
  'Cornerstone Partner': '#D4AF37',
  'Pillar Builder': '#E5E4E2',
  'Foundation Stone': '#CD7F32',
  'Nehemiah Builder': '#50C878',
  'Covenant Partners': '#0F52BA',
  'Faithful Hand': '#008080',
  'Open-Heart': '#FF7F50',
  'Willing Heart': '#B57EDC',
  'Supporter': '#C0C0C0'
};

export function getTierColor(tier: string): string {
  return TIER_COLORS[tier] || '#C0C0C0';
}

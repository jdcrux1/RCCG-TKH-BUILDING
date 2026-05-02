import { randomInt } from 'crypto';

// Tier thresholds in NAIRA (not kobo)
// getTier receives amount in NAIRA, converts to kobo internally for storage
const TIERS = [
  { name: 'Cornerstone Partner', min: 1000000 },
  { name: 'Pillar Builder', min: 500000 },
  { name: 'Foundation Stone', min: 200000 },
  { name: 'Nehemiah Builder', min: 100000 },
  { name: 'Covenant Partners', min: 50000 },
  { name: 'Faithful Hand', min: 20000 },
  { name: 'Open-Heart', min: 10000 },
  { name: 'Willing Heart', min: 5000 },
] as const;

export function getTier(monthlyPledgeNaira: number): string {
  // Handle invalid input
  if (!monthlyPledgeNaira || monthlyPledgeNaira < 5000) {
    return 'Supporter';
  }
  
  // Use >= logic: find the first tier where pledge >= min
  for (const tier of TIERS) {
    if (monthlyPledgeNaira >= tier.min) {
      return tier.name;
    }
  }
  
  return 'Supporter';
}

export function getTierFromKobo(amountKobo: number): string {
  // Convert kobo to naira for tier calculation
  const naira = amountKobo / 100;
  return getTier(naira);
}

// Convert naira to kobo for storage
export function nairaToKobo(naira: number): bigint {
  return BigInt(Math.round(naira * 100));
}

// Convert kobo to naira for display
export function koboToNaira(kobo: number): number {
  return kobo / 100;
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

// SECURE: Cryptographically secure PIN generation
export function generateSecurePin(): string {
  // Use Node's crypto.randomInt for secure random 4-digit PIN
  // Range: 1000-9999
  const pin = randomInt(1000, 10000);
  return pin.toString();
}

// Generate from last 4 digits of phone (legacy fallback)
export function generatePinFromPhone(phone: string): string {
  // Take last 4 digits, pad with leading zeros if needed
  const last4 = phone.replace(/\D/g, '').slice(-4);
  return last4.padStart(4, '0');
}

export const VALID_TIERS: string[] = TIERS.map(t => t.name);

export function isValidTier(tier: string): boolean {
  return VALID_TIERS.includes(tier);
}
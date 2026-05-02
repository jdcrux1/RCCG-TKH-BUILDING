export function sanitizePhoneNumber(phone: string): string {
  const digits = phone.replace(/[\s\-\(\)]/g, '');
  
  if (digits.startsWith('+234')) {
    return '+234' + digits.slice(4);
  }
  if (digits.startsWith('234')) {
    return '+234' + digits.slice(3);
  }
  if (digits.startsWith('0')) {
    return '+234' + digits.slice(1);
  }
  if (/^\d{10}$/.test(digits)) {
    return '+234' + digits;
  }
  return '+234' + digits.slice(-10);
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatTimestampWAT(date: Date | string): string {
  const d = new Date(date);
  const watOffset = 60 * 60 * 1000;
  const watTime = new Date(d.getTime() + watOffset);
  return watTime.toISOString().replace('T', ' ').slice(0, 19);
}
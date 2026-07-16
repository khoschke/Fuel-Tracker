// All date keys are the device's local calendar day (YYYY-MM-DD), not UTC,
// so a meal logged at 11pm stays on today and rolls over at local midnight.
export function todayKey(): string {
  return dateKey(new Date());
}

export function dateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function lastNDayKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    keys.push(dateKey(d));
  }
  return keys;
}

export function daysUntil(targetDateKey: string): number {
  const [y, m, d] = targetDateKey.split('-').map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}

export function shortDayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString('en-AU', { weekday: 'short' });
}

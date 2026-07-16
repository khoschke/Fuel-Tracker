export function round(n: number): number {
  return Math.round(n);
}

export function clampToZero(n: number): number {
  return n < 0 ? 0 : n;
}

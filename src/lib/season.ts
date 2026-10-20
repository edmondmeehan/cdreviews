// Browser-safe seasonal switches. Halloween dress-up runs Oct 20 – Nov 1 (local time).
export function isHalloweenSeason(now: Date = new Date()): boolean {
  const m = now.getMonth(); // 0 = Jan
  const d = now.getDate();
  return (m === 9 && d >= 20) || (m === 10 && d <= 1);
}

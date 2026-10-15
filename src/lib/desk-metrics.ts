export type TrafficRow = { path: string; views: number };

/** Calendar-day boundaries preserve local midnight across clock changes. */
export function trafficBounds(now = new Date()) {
  const midnight = (daysAgo: number) => {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - daysAgo);
    return day.toISOString();
  };
  return { today: midnight(0), week: midnight(6), previousWeek: midnight(13), month: midnight(29) };
}

export const totalViews = (rows: TrafficRow[] = []) => rows.reduce((sum, row) => sum + Number(row.views), 0);

export function weeklyChange(current: number, previous: number) {
  return previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;
}
import type { DateInfo } from './worklog.ts';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatDateHeader(date: Date): string {
  const day = DAYS[date.getDay()];
  const d = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${d} ${month} ${year}`;
}

export function parseHeaderDate(header: string): Date | null {
  const match = header.match(/^(\w+)\s+(\d+)\s+(\w+)\s+(\d{4})$/);
  if (!match) return null;
  const [, , day, month, year] = match;
  const monthIdx = MONTHS.indexOf(month!);
  if (monthIdx === -1) return null;
  return new Date(Number(year), monthIdx, Number(day));
}

export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function yesterday(): Date {
  const d = today();
  d.setDate(d.getDate() - 1);
  return d;
}

export function getWeekRange(offset: number = 0): { start: Date; end: Date } {
  const d = today();
  const dayOfWeek = d.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const start = new Date(d);
  start.setDate(d.getDate() + mondayOffset + offset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function isInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

export function parseUserDate(input: string): Date | null {
  if (input === 'today') return today();
  if (input === 'yesterday') return yesterday();

  const dayMatch = DAYS.findIndex(d => d.toLowerCase() === input.toLowerCase());
  if (dayMatch !== -1) {
    const d = today();
    const current = d.getDay();
    const diff = current >= dayMatch ? current - dayMatch : 7 - (dayMatch - current);
    d.setDate(d.getDate() - diff);
    return d;
  }

  const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }

  const parsed = new Date(input + 'T00:00:00');
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

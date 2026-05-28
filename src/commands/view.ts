import { styleText } from 'node:util';
import { readWorklog } from '../lib/worklog.ts';
import { readConfig } from '../lib/config.ts';
import { getFlavor } from '../lib/render.ts';
import { today, yesterday, isSameDay, isInRange, getWeekRange, parseUserDate } from '../lib/date.ts';

function printEmpty(label: string): void {
  console.log(styleText('dim', `No entries for ${label}.`));
}

export async function viewToday(): Promise<void> {
  const [sections, config] = await Promise.all([readWorklog(), readConfig()]);
  const flavor = getFlavor(config.flavor);
  const d = today();
  const section = sections.find(s => isSameDay(s.date, d));
  if (!section) return printEmpty('today');
  flavor.printSection(section.header, section.entries);
}

export async function viewYesterday(): Promise<void> {
  const [sections, config] = await Promise.all([readWorklog(), readConfig()]);
  const flavor = getFlavor(config.flavor);
  const d = yesterday();
  const section = sections.find(s => isSameDay(s.date, d));
  if (!section) return printEmpty('yesterday');
  flavor.printSection(section.header, section.entries);
}

export async function viewDate(input: string): Promise<void> {
  const date = parseUserDate(input);
  if (!date) {
    console.error(styleText('red', `Cannot parse date: ${input}`));
    process.exit(1);
  }
  const [sections, config] = await Promise.all([readWorklog(), readConfig()]);
  const flavor = getFlavor(config.flavor);
  const section = sections.find(s => isSameDay(s.date, date));
  if (!section) return printEmpty(input);
  flavor.printSection(section.header, section.entries);
}

export async function viewWeek(offset: number = 0): Promise<void> {
  const { start, end } = getWeekRange(offset);
  const [sections, config] = await Promise.all([readWorklog(), readConfig()]);
  const flavor = getFlavor(config.flavor);
  const matches = sections.filter(s => isInRange(s.date, start, end));

  if (matches.length === 0) {
    return printEmpty(offset === 0 ? 'this week' : 'last week');
  }

  for (const section of matches) {
    flavor.printSection(section.header, section.entries);
  }
}

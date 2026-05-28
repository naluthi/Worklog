import { readFile, writeFile, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { formatDateHeader, parseHeaderDate } from './date.ts';

export interface DateInfo {
  header: string;
  date: Date;
  entries: string[];
}

const WORKLOG_PATH = join(homedir(), 'worklog.md');

export function getWorklogPath(): string {
  return WORKLOG_PATH;
}

export async function readWorklog(): Promise<DateInfo[]> {
  if (!existsSync(WORKLOG_PATH)) return [];

  const content = await readFile(WORKLOG_PATH, 'utf-8');
  const sections: DateInfo[] = [];
  let current: DateInfo | null = null;

  for (const line of content.split('\n')) {
    const headerMatch = line.match(/^## (.+?)\s+—\s+\d+$/);
    if (headerMatch) {
      if (current) sections.push(current);
      const date = parseHeaderDate(headerMatch[1]!);
      current = { header: headerMatch[1]!, date: date ?? new Date(), entries: [] };
      continue;
    }

    if (current && line.startsWith('- ')) {
      current.entries.push(line.slice(2));
    } else if (current && /^\s+- /.test(line) && current.entries.length > 0) {
      current.entries[current.entries.length - 1] += '\n' + line;
    }
  }

  if (current) sections.push(current);
  return sections;
}

export async function addEntry(entry: string, date: Date): Promise<void> {
  const sections = await readWorklog();
  const header = formatDateHeader(date);

  const existing = sections.find(s => s.header === header);
  if (existing) {
    existing.entries.push(entry);
  } else {
    const newSection: DateInfo = { header, date, entries: [entry] };
    const insertIdx = sections.findIndex(s => s.date < date);
    if (insertIdx === -1) {
      sections.push(newSection);
    } else {
      sections.splice(insertIdx, 0, newSection);
    }
  }

  await writeWorklog(sections);
}

async function writeWorklog(sections: DateInfo[]): Promise<void> {
  let content = '# Worklog\n';

  for (const section of sections) {
    content += `\n## ${section.header} — ${section.entries.length}\n\n`;
    for (const entry of section.entries) {
      const lines = entry.split('\n');
      content += `- ${lines[0]}\n`;
      for (let i = 1; i < lines.length; i++) {
        content += `${lines[i]}\n`;
      }
    }
  }

  const tmp = WORKLOG_PATH + '.tmp';
  await writeFile(tmp, content, 'utf-8');
  await rename(tmp, WORKLOG_PATH);
}

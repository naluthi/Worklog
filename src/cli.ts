#!/usr/bin/env node

import { add } from './commands/add.ts';
import { viewToday, viewYesterday, viewDate, viewWeek } from './commands/view.ts';
import { search } from './commands/search.ts';
import { flavor } from './commands/flavor.ts';
import { getWorklogPath } from './lib/worklog.ts';
import { execSync } from 'node:child_process';
import { styleText } from 'node:util';

const HELP = `
${styleText('bold', 'wl')} — worklog tracker

${styleText('bold', 'Usage:')}
  wl "description"              Add entry for today
  wl add "description"          Add entry for today
  wl add -d <date> "desc"      Add entry for a specific date

  wl today                      Show today's entries
  wl yesterday                  Show yesterday's entries
  wl show <date>                Show entries for a date
  wl week                       Show this week
  wl week last                  Show last week

  wl search "query"             Search all entries

  wl flavor                     List available flavors
  wl flavor set <name>          Set active flavor
  wl flavor preview <name>      Preview a flavor

  wl edit                       Open worklog in $EDITOR
  wl help                       Show this help
`;

const [cmd, ...rest] = process.argv.slice(2);

const commands: Record<string, (args: string[]) => Promise<void>> = {
  add: (args) => add(args),
  today: () => viewToday(),
  yesterday: () => viewYesterday(),
  show: (args) => viewDate(args[0] ?? ''),
  week: async (args) => {
    const offset = args[0] === 'last' ? -1 : 0;
    await viewWeek(offset);
  },
  search: (args) => search(args),
  flavor: (args) => flavor(args),
  edit: async () => {
    const editor = process.env.EDITOR || 'code';
    execSync(`${editor} "${getWorklogPath()}"`, { stdio: 'inherit' });
  },
  help: async () => { console.log(HELP); },
};

if (!cmd) {
  await viewToday();
} else if (commands[cmd]) {
  await commands[cmd]!(rest);
} else {
  await add([cmd, ...rest]);
}

import { styleText } from 'node:util';
import { addEntry } from '../lib/worklog.ts';
import { today, parseUserDate } from '../lib/date.ts';

export async function add(args: string[]): Promise<void> {
  let date = today();
  let text: string[];

  if (args[0] === '-d' && args[1]) {
    const parsed = parseUserDate(args[1]);
    if (!parsed) {
      console.error(styleText('red', `Invalid date: ${args[1]}`));
      process.exit(1);
    }
    date = parsed;
    text = args.slice(2);
  } else {
    text = args;
  }

  const entry = text.join(' ').trim();
  if (!entry) {
    console.error(styleText('red', 'Usage: wl add "description"'));
    process.exit(1);
  }

  await addEntry(entry, date);
  console.log(styleText('green', '✓') + ' ' + entry);
}

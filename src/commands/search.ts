import { styleText } from 'node:util';
import { readWorklog } from '../lib/worklog.ts';
import { readConfig } from '../lib/config.ts';
import { getFlavor } from '../lib/render.ts';

export async function search(args: string[]): Promise<void> {
  const query = args.join(' ').trim().toLowerCase();
  if (!query) {
    console.error(styleText('red', 'Usage: wl search "query"'));
    process.exit(1);
  }

  const [sections, config] = await Promise.all([readWorklog(), readConfig()]);
  const flavor = getFlavor(config.flavor);
  let found = false;

  for (const section of sections) {
    const matches = section.entries.filter(e => e.toLowerCase().includes(query));
    if (matches.length > 0) {
      found = true;
      flavor.printSearchResult(section.header, matches, query);
    }
  }

  if (!found) {
    console.log(styleText('dim', `No entries matching "${query}".`));
  }
}

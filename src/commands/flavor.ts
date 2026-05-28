import { styleText } from 'node:util';
import { readConfig, writeConfig } from '../lib/config.ts';
import { FLAVORS, getFlavor } from '../lib/render.ts';

const PREVIEW_ENTRIES = [
  '[FIX] Commissions widgets showed 0 due to INNER JOIN dropping NULL SDR attribution rows. Switched to LEFT JOIN. [PR #2314]',
  '[FEAT] Added Subscriptions tab to Reporting → Commissions with expanded nav permissions. [PR #2313]',
  '[CHORE] Removed legacy commissions section from dashboard — consolidated to dedicated page. [PR #2269]',
];

export async function flavor(args: string[]): Promise<void> {
  const sub = args[0];

  if (!sub || sub === 'list') {
    const config = await readConfig();
    console.log(styleText('bold' as Parameters<typeof styleText>[0], 'Available flavors:\n'));
    for (const f of Object.values(FLAVORS)) {
      const active = f.name === config.flavor ? styleText('green' as Parameters<typeof styleText>[0], ' ◀ active') : '';
      console.log(`  ${styleText('bold' as Parameters<typeof styleText>[0], f.name)}${active}`);
      console.log(`  ${styleText('dim' as Parameters<typeof styleText>[0], f.description)}`);
      console.log();
    }
    console.log(styleText('dim' as Parameters<typeof styleText>[0], 'Set with: wl flavor set <name>'));
    console.log(styleText('dim' as Parameters<typeof styleText>[0], 'Preview:  wl flavor preview <name>'));
    return;
  }

  if (sub === 'set') {
    const name = args[1]?.toLowerCase();
    if (!name || !FLAVORS[name]) {
      console.error(styleText('red' as Parameters<typeof styleText>[0], `Unknown flavor: ${args[1] ?? '(none)'}`));
      console.error(`Available: ${Object.keys(FLAVORS).join(', ')}`);
      process.exit(1);
    }
    await writeConfig({ flavor: name });
    console.log(styleText('green' as Parameters<typeof styleText>[0], '✓') + ` Flavor set to ${styleText('bold' as Parameters<typeof styleText>[0], name)}`);
    return;
  }

  if (sub === 'preview') {
    const name = args[1]?.toLowerCase();
    if (!name || !FLAVORS[name]) {
      console.error(styleText('red' as Parameters<typeof styleText>[0], `Unknown flavor: ${args[1] ?? '(none)'}`));
      console.error(`Available: ${Object.keys(FLAVORS).join(', ')}`);
      process.exit(1);
    }
    console.log(styleText('dim' as Parameters<typeof styleText>[0], `Preview of "${name}" flavor:\n`));
    const f = getFlavor(name);
    f.printSection('Wednesday 27 May 2026', PREVIEW_ENTRIES);
    return;
  }

  console.error(styleText('red' as Parameters<typeof styleText>[0], `Unknown subcommand: ${sub}`));
  console.error('Usage: wl flavor [list|set <name>|preview <name>]');
  process.exit(1);
}

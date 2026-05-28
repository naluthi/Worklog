import { styleText } from 'node:util';

type Format = Parameters<typeof styleText>[0];

export interface ParsedEntry {
  tag: 'FIX' | 'FEAT' | 'CHORE' | null;
  body: string;
  pr: string | null;
  raw: string;
}

export function parseEntry(raw: string): ParsedEntry {
  const lines = raw.split('\n');
  const mainLine = lines[0]!;
  const subLines = lines.slice(1).map(l => l.replace(/^\s+- /, '').trim()).filter(Boolean);

  const tagMatch = mainLine.match(/^\[(FIX|FEAT|CHORE)\]\s*/);
  const prMatch = raw.match(/\[PR #(\d+)\]/);

  let tag: ParsedEntry['tag'] = null;
  let pr: string | null = null;

  if (tagMatch) {
    tag = tagMatch[1] as ParsedEntry['tag'];
  }
  if (prMatch) {
    pr = `PR #${prMatch[1]}`;
  }

  let mainBody = mainLine;
  if (tagMatch) mainBody = mainBody.slice(tagMatch[0].length);
  if (prMatch && mainBody.includes(prMatch[0])) {
    mainBody = mainBody.replace(prMatch[0], '').trim();
  }

  let body: string;
  if (subLines.length > 0) {
    const subBody = subLines.map(s => s.replace(/\[PR #\d+\]\s*$/, '').trim()).join(' ');
    body = mainBody ? `${mainBody} ${subBody}` : subBody;
  } else {
    body = mainBody;
  }

  return { tag, body: body.trim(), pr, raw };
}

export interface Flavor {
  name: string;
  description: string;
  printSection(header: string, entries: string[]): void;
  printSearchResult(header: string, entries: string[], query: string): void;
}

function highlightQuery(text: string, query: string): string {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    (m) => styleText(['bold', 'yellow'] as Format, m),
  );
}

// ─── Classic ───────────────────────────────────────────────────
// Clean, colorful tags with breathing room between entries

const TAG_STYLES: Record<string, { bg: Format; fg: Format; label: string }> = {
  FIX:   { bg: ['bgRed', 'white', 'bold'] as Format, fg: 'red' as Format, label: ' FIX  ' },
  FEAT:  { bg: ['bgGreen', 'white', 'bold'] as Format, fg: 'green' as Format, label: ' FEAT ' },
  CHORE: { bg: ['bgYellow', 'black', 'bold'] as Format, fg: 'yellow' as Format, label: ' CHORE' },
};

function classicEntry(entry: string): void {
  const parsed = parseEntry(entry);
  const style = parsed.tag ? TAG_STYLES[parsed.tag] : null;

  const tagStr = style
    ? styleText(style.bg, style.label) + ' '
    : '       ';

  const prStr = parsed.pr
    ? ' ' + styleText('cyan' as Format, parsed.pr)
    : '';

  const body = style ? parsed.body : parsed.raw;
  console.log(`  ${tagStr}${body}${prStr}`);
  console.log();
}

const classic: Flavor = {
  name: 'classic',
  description: 'Colored tag pills, PR highlights, breathing room between entries',
  printSection(header, entries) {
    const line = styleText('dim' as Format, '─'.repeat(50));
    console.log(`  ${styleText(['bold', 'white'] as Format, header)}  ${styleText('dim' as Format, `· ${entries.length} items`)}`);
    console.log(`  ${line}`);
    console.log();
    for (const entry of entries) classicEntry(entry);
  },
  printSearchResult(header, entries, query) {
    console.log(`  ${styleText(['bold', 'white'] as Format, header)}`);
    console.log();
    for (const entry of entries) {
      const parsed = parseEntry(entry);
      const style = parsed.tag ? TAG_STYLES[parsed.tag] : null;
      const tagStr = style ? styleText(style.bg, style.label) + ' ' : '       ';
      const body = highlightQuery(style ? parsed.body : parsed.raw, query);
      const prStr = parsed.pr ? ' ' + styleText('cyan' as Format, parsed.pr) : '';
      console.log(`  ${tagStr}${body}${prStr}`);
      console.log();
    }
  },
};

// ─── Neon ──────────────────────────────────────────────────────
// High-energy, icons, double-line borders, bright magenta accents

const NEON_ICONS: Record<string, string> = { FIX: '✗', FEAT: '✦', CHORE: '⚙' };
const NEON_COLORS: Record<string, Format> = {
  FIX: ['redBright', 'bold'] as Format,
  FEAT: ['greenBright', 'bold'] as Format,
  CHORE: ['yellowBright', 'bold'] as Format,
};

function neonEntry(entry: string): void {
  const parsed = parseEntry(entry);
  const color = parsed.tag ? NEON_COLORS[parsed.tag] : ('white' as Format);
  const icon = parsed.tag ? NEON_ICONS[parsed.tag] : '·';

  const tagStr = parsed.tag
    ? styleText(color!, `${icon} ${parsed.tag}`)
    : styleText('dim' as Format, icon!);

  const prStr = parsed.pr
    ? ' ' + styleText(['cyanBright', 'bold'] as Format, parsed.pr)
    : '';

  const pipe = styleText('magenta' as Format, '│');
  const body = parsed.tag ? parsed.body : parsed.raw;
  console.log(`  ${pipe}  ${tagStr}  ${body}${prStr}`);
  console.log(`  ${pipe}`);
}

const neon: Flavor = {
  name: 'neon',
  description: 'Bright icons, magenta accents, double-line borders — high energy',
  printSection(header, entries) {
    const border = styleText('magenta' as Format, '═'.repeat(56));
    const pipe = styleText('magenta' as Format, '│');
    console.log(`  ${border}`);
    console.log(`  ${pipe}  ${styleText(['bold', 'magentaBright'] as Format, header)}${styleText('magenta' as Format, `  ·  ${entries.length}`)}`);
    console.log(`  ${border}`);
    console.log(`  ${pipe}`);
    for (const entry of entries) neonEntry(entry);
    console.log();
  },
  printSearchResult(header, entries, query) {
    const pipe = styleText('magenta' as Format, '│');
    console.log(`  ${styleText(['bold', 'magentaBright'] as Format, header)}`);
    console.log(`  ${pipe}`);
    for (const entry of entries) {
      const parsed = parseEntry(entry);
      const color = parsed.tag ? NEON_COLORS[parsed.tag] : ('white' as Format);
      const icon = parsed.tag ? NEON_ICONS[parsed.tag] : '·';
      const tagStr = parsed.tag ? styleText(color!, `${icon} ${parsed.tag}`) : styleText('dim' as Format, icon!);
      const body = highlightQuery(parsed.tag ? parsed.body : parsed.raw, query);
      const prStr = parsed.pr ? ' ' + styleText(['cyanBright', 'bold'] as Format, parsed.pr) : '';
      console.log(`  ${pipe}  ${tagStr}  ${body}${prStr}`);
      console.log(`  ${pipe}`);
    }
    console.log();
  },
};

// ─── Minimal ───────────────────────────────────────────────────
// Stripped down, subtle color, tight spacing — good for piping

function minimalEntry(entry: string): void {
  const parsed = parseEntry(entry);

  const tagColors: Record<string, Format> = {
    FIX: 'red', FEAT: 'green', CHORE: 'yellow',
  };
  const tagStr = parsed.tag
    ? styleText(tagColors[parsed.tag]!, `[${parsed.tag}]`)
    : '';

  const prStr = parsed.pr
    ? styleText('dim' as Format, ` #${parsed.pr.replace('PR #', '')}`)
    : '';

  const body = parsed.tag ? parsed.body : parsed.raw;
  console.log(`  ${tagStr ? tagStr + ' ' : ''}${body}${prStr}`);
}

const minimal: Flavor = {
  name: 'minimal',
  description: 'Tight spacing, subtle color, no decoration — clean and pipeable',
  printSection(header, entries) {
    console.log(`${styleText('bold' as Format, header)} ${styleText('dim' as Format, `(${entries.length})`)}`);
    for (const entry of entries) minimalEntry(entry);
    console.log();
  },
  printSearchResult(header, entries, query) {
    console.log(styleText('bold' as Format, header));
    for (const entry of entries) {
      const parsed = parseEntry(entry);
      const tagColors: Record<string, Format> = { FIX: 'red', FEAT: 'green', CHORE: 'yellow' };
      const tagStr = parsed.tag ? styleText(tagColors[parsed.tag]!, `[${parsed.tag}]`) : '';
      const body = highlightQuery(parsed.tag ? parsed.body : parsed.raw, query);
      const prStr = parsed.pr ? styleText('dim' as Format, ` #${parsed.pr.replace('PR #', '')}`) : '';
      console.log(`  ${tagStr ? tagStr + ' ' : ''}${body}${prStr}`);
    }
    console.log();
  },
};

// ─── Standup ───────────────────────────────────────────────────
// Groups entries by type, shows counts — built for reading aloud

interface TypeGroup {
  label: string;
  color: Format;
  icon: string;
  entries: ParsedEntry[];
}

function groupEntries(entries: string[]): TypeGroup[] {
  const fixes: ParsedEntry[] = [];
  const feats: ParsedEntry[] = [];
  const chores: ParsedEntry[] = [];
  const other: ParsedEntry[] = [];

  for (const e of entries) {
    const parsed = parseEntry(e);
    if (parsed.tag === 'FIX') fixes.push(parsed);
    else if (parsed.tag === 'FEAT') feats.push(parsed);
    else if (parsed.tag === 'CHORE') chores.push(parsed);
    else other.push(parsed);
  }

  const groups: TypeGroup[] = [];
  if (fixes.length) groups.push({ label: 'Fixes', color: 'red' as Format, icon: '🔧', entries: fixes });
  if (feats.length) groups.push({ label: 'Features', color: 'green' as Format, icon: '✨', entries: feats });
  if (chores.length) groups.push({ label: 'Chores', color: 'yellow' as Format, icon: '🔩', entries: chores });
  if (other.length) groups.push({ label: 'Other', color: 'white' as Format, icon: '·', entries: other });
  return groups;
}

const standup: Flavor = {
  name: 'standup',
  description: 'Groups by type with counts — optimized for reading at standups',
  printSection(header, entries) {
    const top = styleText('dim' as Format, '┌─') + ` ${styleText(['bold', 'white'] as Format, header)} ` + styleText('dim' as Format, '─'.repeat(Math.max(0, 40 - header.length)) + `── ${entries.length} items ─┐`);
    console.log(top);
    console.log();

    const groups = groupEntries(entries);
    for (const group of groups) {
      const countStr = styleText('dim' as Format, `(${group.entries.length})`);
      console.log(`  ${group.icon} ${styleText(['bold', group.color] as Format, group.label)} ${countStr}`);
      for (const parsed of group.entries) {
        const prStr = parsed.pr ? '  ' + styleText('cyan' as Format, parsed.pr) : '';
        console.log(`    ${styleText('dim' as Format, '•')} ${parsed.body}${prStr}`);
      }
      console.log();
    }

    const bottom = styleText('dim' as Format, '└' + '─'.repeat(58) + '┘');
    console.log(bottom);
    console.log();
  },
  printSearchResult(header, entries, query) {
    console.log(`  ${styleText(['bold', 'white'] as Format, header)}`);
    console.log();
    const groups = groupEntries(entries);
    for (const group of groups) {
      console.log(`  ${group.icon} ${styleText(['bold', group.color] as Format, group.label)}`);
      for (const parsed of group.entries) {
        const body = highlightQuery(parsed.body, query);
        const prStr = parsed.pr ? '  ' + styleText('cyan' as Format, parsed.pr) : '';
        console.log(`    ${styleText('dim' as Format, '•')} ${body}${prStr}`);
      }
      console.log();
    }
  },
};

// ─── Registry ──────────────────────────────────────────────────

export const FLAVORS: Record<string, Flavor> = { classic, neon, minimal, standup };

export function getFlavor(name: string): Flavor {
  return FLAVORS[name] ?? classic;
}

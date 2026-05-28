import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CONFIG_PATH = join(homedir(), '.wlconfig.json');

interface Config {
  flavor: string;
}

const DEFAULT_CONFIG: Config = { flavor: 'classic' };

export async function readConfig(): Promise<Config> {
  if (!existsSync(CONFIG_PATH)) return { ...DEFAULT_CONFIG };
  try {
    const raw = await readFile(CONFIG_PATH, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function writeConfig(config: Partial<Config>): Promise<void> {
  const current = await readConfig();
  const merged = { ...current, ...config };
  await writeFile(CONFIG_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
}

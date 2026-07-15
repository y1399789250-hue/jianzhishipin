import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const tool = process.argv[2];
const args = process.argv.slice(3);

if (!tool || !['ffmpeg', 'ffprobe'].includes(tool)) {
  console.error('Usage: node scripts/run_media_tool.mjs <ffmpeg|ffprobe> [...args]');
  process.exit(1);
}

const nodeModules = path.join(process.cwd(), 'node_modules');
const packageName = fs
  .readdirSync(nodeModules)
  .flatMap((entry) => {
    const full = path.join(nodeModules, entry);
    if (entry !== '@remotion' || !fs.statSync(full).isDirectory()) return [];
    return fs.readdirSync(full).map((child) => path.join(entry, child));
  })
  .find((entry) => entry.split(path.sep).join('/').startsWith('@remotion/compositor-'));

if (!packageName) {
  console.error('Could not find @remotion/compositor-* package with media tools.');
  process.exit(1);
}

const exe = process.platform === 'win32' ? `${tool}.exe` : tool;
const bin = path.join(process.cwd(), 'node_modules', packageName, exe);

if (!fs.existsSync(bin)) {
  console.error(`Media tool not found: ${bin}`);
  process.exit(1);
}

const result = spawnSync(bin, args, {stdio: 'inherit'});
process.exit(result.status ?? 1);

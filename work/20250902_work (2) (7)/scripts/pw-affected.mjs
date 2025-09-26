#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import process from 'node:process';

const SPEC_PATTERN = /\.spec\.[^\/]+$/i;
const workspace = process.cwd();
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function runGitCommand(args) {
  try {
    const output = execFileSync('git', args, {
      cwd: workspace,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    return [];
  }
}

function collectChangedSpecs() {
  const candidates = new Set();

  const diffHead = runGitCommand(['diff', '--name-only', 'HEAD', '--', 'tests']);
  diffHead.forEach((file) => candidates.add(file));

  const diffCached = runGitCommand(['diff', '--name-only', '--cached', 'HEAD', '--', 'tests']);
  diffCached.forEach((file) => candidates.add(file));

  const untracked = runGitCommand(['ls-files', '--others', '--exclude-standard', '--', 'tests']);
  untracked.forEach((file) => candidates.add(file));

  const resolved = [];
  for (const relative of candidates) {
    if (!SPEC_PATTERN.test(relative)) {
      continue;
    }
    const absolute = path.resolve(workspace, relative);
    if (fs.existsSync(absolute)) {
      const relPath = path.relative(workspace, absolute).split(path.sep).join('/');
      resolved.push(relPath);
    }
  }
  return resolved.sort();
}

function runPlaywright(testArgs, description) {
  const finalArgs = ['playwright', 'test', '--reporter=line', '--trace=off', '--workers=1'].concat(testArgs);
  console.log('[pw-affected] Running ' + description + ': ' + finalArgs.slice(2).join(' '));
  const child = spawn(npx, finalArgs, {
    cwd: workspace,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32'
  });

  child.on('error', (error) => {
    console.error('[pw-affected] Failed to start Playwright: ' + error.message);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.error('[pw-affected] Playwright terminated by signal ' + signal);
      process.exit(1);
    }
    process.exit(code == null ? 1 : code);
  });
}

function main() {
  const specs = collectChangedSpecs();
  if (specs.length > 0) {
    runPlaywright(specs, 'changed specs (' + specs.length + ')');
  } else {
    runPlaywright(['-g', 'smoke'], 'fallback smoke grep');
  }
}

main();

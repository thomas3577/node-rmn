import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const binPath = join(__dirname, '..', 'bin', 'rmn.js');
const { version } = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const withProjectDir = fn => {
  const dir = mkdtempSync(join(tmpdir(), 'node-rmn-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const createNodeModules = projectDir => {
  const nodeModulesPath = join(projectDir, 'node_modules');
  mkdirSync(nodeModulesPath);
  writeFileSync(join(nodeModulesPath, 'marker.txt'), 'delete me');

  return nodeModulesPath;
};

test('--version prints the package version', () => {
  const output = execFileSync('node', [binPath, '--version'], { encoding: 'utf-8' });

  assert.equal(output.trim(), `v${version}`);
});

test('errors when no node_modules can be found', () => {
  withProjectDir(dir => {
    const output = execFileSync('node', [binPath], { cwd: dir, encoding: 'utf-8' });

    assert.match(output, /Could not find node_modules/);
  });
});

test('deletes node_modules without prompting by default', () => {
  withProjectDir(dir => {
    const nodeModulesPath = createNodeModules(dir);
    const output = execFileSync('node', [binPath], { cwd: dir, encoding: 'utf-8' });

    assert.match(output, /Done!/);
    assert.equal(existsSync(nodeModulesPath), false);
  });
});

test('finds node_modules from a nested subdirectory', () => {
  withProjectDir(dir => {
    const nodeModulesPath = createNodeModules(dir);
    const subDir = join(dir, 'src', 'nested');
    mkdirSync(subDir, { recursive: true });

    const output = execFileSync('node', [binPath], { cwd: subDir, encoding: 'utf-8' });

    assert.match(output, /Done!/);
    assert.equal(existsSync(nodeModulesPath), false);
  });
});

test('--show-before aborts deletion when the answer is no', () => {
  withProjectDir(dir => {
    const nodeModulesPath = createNodeModules(dir);
    const output = execFileSync('node', [binPath, '--show-before'], {
      cwd: dir,
      encoding: 'utf-8',
      input: 'n\n'
    });

    assert.match(output, /Aborted!/);
    assert.equal(existsSync(nodeModulesPath), true);
  });
});

test('--show-before deletes when the answer is yes', () => {
  withProjectDir(dir => {
    const nodeModulesPath = createNodeModules(dir);
    const output = execFileSync('node', [binPath, '--show-before'], {
      cwd: dir,
      encoding: 'utf-8',
      input: 'y\n'
    });

    assert.match(output, /Done!/);
    assert.equal(existsSync(nodeModulesPath), false);
  });
});

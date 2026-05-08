import { join, resolve, sep, dirname } from 'node:path';
import { readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import arg from 'arg';
import yesno from 'yesno';

const nodeModulesFolder = 'node_modules';
const log = console.log;

const getVersion = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const packageFileName = './package.json';
  const packageJsonPath = join(__dirname, packageFileName);
  const packageJsonString = await readFile(packageJsonPath, 'utf-8');
  const { version } = JSON.parse(packageJsonString);

  return version;
};

const promptFor = async path => await yesno({
  question: `\n  Path: ${path}\n\nThis directory is to be deleted? yes [Y] or no [n] (default):`,
  defaultValue: false,
  yesValues: ['yes', 'y', 'Y'],
  noValues: ['no', 'n']
});

const getArgs = argv => arg({
  '--show-before': Boolean,
  '-s': '--show-before',
  '--version': Boolean,
  '-v': '--version'
}, {
  argv: argv.slice(2)
});

const findPath = () => {
  let currentPath = resolve();

  while (true) {
    const nodeModulesPath = join(currentPath, nodeModulesFolder);
    if (existsSync(nodeModulesPath)) {
      return nodeModulesPath;
    }

    const parentPath = dirname(currentPath);
    if (parentPath === currentPath) {
      return null;
    }

    currentPath = parentPath;
  }
};

export const cli = async argv => {
  try {
    const args = getArgs(argv);
    if (args['--version']) {
      const version = await getVersion();
      return log(`v${version}`);
    }

    const nodeModulesPath = findPath();
    if (!nodeModulesPath) {
      return log('Error! Could not find node_modules');
    }

    const ask = args['--show-before'] || false;
    const answer = !ask || await promptFor(nodeModulesPath);
    if (!answer) {
      return log('Aborted!');
    }

    await rm(nodeModulesPath, { recursive: true, force: true });
    return log('Done!');
  } catch (err) {
    return log('Error!', err);
  }
};

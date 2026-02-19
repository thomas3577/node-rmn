import { join, resolve, sep, dirname } from 'node:path';
import { readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import arg from 'arg';
import yesno from 'yesno';

const nodeModulesFolder = './node_modules';
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

const promptFor = async (ask, path) => await yesno({
  question: `\n  Path: ${path}\n\nThis directory is to be deleted? yes [Y] or no [n] (default):`,
  defaultValue: false,
  yesValues: ['yes', 'Y'],
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
  let path = resolve();
  let nodeModulesPath = join(path, nodeModulesFolder);

  if (!existsSync(nodeModulesPath)) {
    nodeModulesPath = path
      .split(sep)
      .reverse()
      .find((folder) => {
        path = path.substring(0, path.length - (folder.length + 1));

        return path.length > 0 && existsSync(join(path, nodeModulesFolder));
      });
  }

  return nodeModulesPath;
};

export const cli = async argv => {
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
  const answer = !ask || await promptFor(ask, nodeModulesPath);

  return answer
    ? await rm(nodeModulesFolder, { recursive: true, force: true })
      .then(() => log('Done!'))
      .catch(err => log('Error!', err))
    : log('Aborted!');
};

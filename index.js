import { join, resolve, sep } from 'node:path';
import { existsSync } from 'node:fs';
import { rimraf } from 'rimraf';
import arg from 'arg';
import yesno from 'yesno';

const nodeModulesFolder = './node_modules';
const log = console.log;

const promptFor = async (ask, path) => await yesno({
  question: `\n  Path: ${path}\n\nThis directory is to be deleted? yes [Y] or no [n] (default):`,
  defaultValue: false,
  yesValues: ['yes', 'Y'],
  noValues: ['no', 'n']
});

const getArgs = argv => arg({
  '--show-before': Boolean,
  '-s': '--show-before'
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

export const rmn = async () => {
  const nodeModulesPath = findPath();

  return nodeModulesPath
    ? await rimraf(nodeModulesPath)
    : log('Error! Could not find node_modules');
};

export const cli = async argv => {
  const nodeModulesPath = findPath();

  if (!nodeModulesPath) {
    return log('Error! Could not find node_modules');
  }

  const args = getArgs(argv);
  const ask = args['--show-before'] || false;
  const answer = !ask || await promptFor(ask, nodeModulesPath);

  return answer
    ? await rimraf(nodeModulesFolder)
      .catch(err => log('Error!', err))
      .then(() => log('Done!'))
    : log('Aborted!');
};

rmn();

import { join, resolve, sep } from 'path';
import { existsSync } from 'fs';
import arg from 'arg';
import yesno from 'yesno';
import rmfr from 'rmfr';

const nodeModulesFolder = './node_modules';
const log = console.log;

const promptFor = async (ask, path) => {
  return await yesno({
    question: `\n  Path: ${path}\n\nThis directory is to be deleted? yes [Y] or no [n] (default):`,
    defaultValue: false,
    yesValues: ['yes', 'Y'],
    noValues: ['no', 'n']
  });
};

const getArgs = (argv) => {
  return arg({
    '--show-before': Boolean,
    '-s': '--show-before'
  }, {
    argv: argv.slice(2)
  });
};

const findPath = () => {
  let path = resolve();
  let nodeModulesPath = join(path, nodeModulesFolder);

  if (existsSync(nodeModulesPath)) {
    return nodeModulesPath;
  }

  nodeModulesPath = path()
    .split(sep)
    .reverse()
    .find((folder) => {
      path = path.substring(0, path.length - (folder.length + 1));

      return path.length > 0 && existsSync(join(path, nodeModulesFolder));
    });

  return nodeModulesPath;
};

export const rmn = async () => {
  const nodeModulesPath = findPath();

  if (!nodeModulesPath) {
    return log('Error! Could not find node_modules');
  }

  await rmfr(nodeModulesPath);
};

export const cli = async (argv) => {
  const nodeModulesPath = findPath();

  if (!nodeModulesPath) {
    return log('Error! Could not find node_modules');
  }

  const args = getArgs(argv);
  const ask = args['--show-before'] || false;
  const answer = !ask || await promptFor(ask, nodeModulesPath);

  if (answer) {
    return await rmfr(nodeModulesFolder)
      .catch((err) => log('Error!', err))
      .then(() => log('Done!'));
  }

  log('Aborted!');
};

export default rmn;

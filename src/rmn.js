import { join, resolve } from 'path';
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

export const cli = async (argv) => {
  const nodeModulesPath = join(resolve(), nodeModulesFolder);
  const exists = existsSync(nodeModulesPath);

  if (!exists) {
    return console.error(`Directory not exists! \n  Path: ${nodeModulesPath}\nAborted!`);
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

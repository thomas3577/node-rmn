import { join, resolve } from 'path';
import { existsSync } from 'fs';
import arg from 'arg';
import yesno from 'yesno';
import rmfr from 'rmfr';

const nodeModulesFolder = './node_modules';
const deletePath = join(resolve(), nodeModulesFolder);

const promptFor = async (ask) => {
  if (ask) {
    return await yesno({
      question: `\n  Path: ${deletePath}\n\nThis directory is to be deleted? yes [Y] or no [n] (default):`,
      defaultValue: false,
      yesValues: ['yes', 'Y'],
      noValues: ['no', 'n']
    });
  }

  return true;
};

const doPrompt = (rawArgs) => {
  const args = arg({
    '--show-before': Boolean,
    '-s': '--show-before'
  }, {
    argv: rawArgs.slice(2)
  });

  return args['--show-before'] || false;
};

export const cli = async (args) => {
  const directorsExists = existsSync(deletePath);

  if (!directorsExists) {
    return console.error(`Directory not exists! \n  Path: ${deletePath}\nAborted!`);
  }

  const answer = await promptFor(doPrompt(args));

  if (answer) {
    return await rmfr(nodeModulesFolder)
      .catch((err) => console.error('Error!', err))
      .then(() => console.log('Done!'));
  }

  console.log('Aborted!');
};

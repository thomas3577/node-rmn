import arg from 'arg';
import yesno from 'yesno';
import rmfr from 'rmfr';
import { join, resolve } from 'path';

const nodeModulesFolder = './node_modules';
const deletePath = join(resolve(), nodeModulesFolder);

const promptFor = async (ask) => {
  if (ask) {
    return await yesno({
      question: `\nDo you want to delete ${deletePath}? \nyes [Y] or no [n] (default):`,
      defaultValue: false,
      yesValues: ['yes', 'Y'],
      noValues: ['no', 'n']
    });
  }

  return true;
};

const doPrompt = (rawArgs) => {
  const args = arg({
    '--pre': Boolean,
    '-p': '--pre'
  }, {
    argv: rawArgs.slice(2)
  });

  return args['--pre'] || false;
};

export const cli = async (args) => {
  const answer = await promptFor(doPrompt(args));

  if (answer) {
    await rmfr(nodeModulesFolder)
      .catch((err) => console.error('Error!', err))
      .then(() => console.log('Done!'));
  }
};

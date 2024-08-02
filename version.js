import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const getVersion = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const packageFileName = './package.json';
  const packageJsonPath = join(__dirname, packageFileName);
  const packageJsonString = await readFile(packageJsonPath, 'utf-8');
  const { version } = JSON.parse(packageJsonString);

  return version;
};

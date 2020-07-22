import { TARGET_DIRECTORY } from './constants';
import fs from 'fs-extra';
import path from 'path';
import { installDependencies } from '@/utils';

afterAll(() => {
  fs.removeSync(TARGET_DIRECTORY);
});

it('install dependencies', async () => {
  const packageFile = path.join(TARGET_DIRECTORY, 'package.json');
  fs.ensureFileSync(packageFile);
  fs.writeJsonSync(packageFile, {});

  const result = await installDependencies(TARGET_DIRECTORY);

  expect(result).toBe(true);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'yarn.lock'))).toBe(true);
});

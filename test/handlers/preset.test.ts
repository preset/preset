import { Name } from '@/Container';
import { PresetActionContract } from '@/Contracts';
import { TARGET_DIRECTORY, stubs } from '../constants';
import { handle } from './handlers.test';
import { Log } from '@/Logger';
import fs from 'fs-extra';
import path from 'path';

beforeAll(() => fs.removeSync(TARGET_DIRECTORY));
afterEach(() => fs.removeSync(TARGET_DIRECTORY));

it('installs an external preset', async () => {
  Log.fake();

  await handle<PresetActionContract>(
    Name.PresetHandler,
    {
      preset: stubs.COPY_SINGLE_FILE,
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'hello.txt'))).toBe(true);
});

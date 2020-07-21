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
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'copy-flag.txt'))).toBe(false);
});

it('handles command line arguments', async () => {
  Log.fake();

  await handle<PresetActionContract>(
    Name.PresetHandler,
    {
      preset: stubs.COPY_SINGLE_FILE,
      arguments: ['--copy-flag'],
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'hello.txt'))).toBe(true);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'copy-flag.txt'))).toBe(true);
});

it('inherits command line arguments', async () => {
  Log.fake();

  await handle<PresetActionContract>(
    Name.PresetHandler,
    {
      preset: stubs.COPY_SINGLE_FILE,
      inherit: true,
    },
    {
      targetDirectory: TARGET_DIRECTORY,
      argv: ['--copy-flag'],
    }
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'hello.txt'))).toBe(true);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'copy-flag.txt'))).toBe(true);
});

it('does not inherit command line arguments if told so', async () => {
  Log.fake();

  await handle<PresetActionContract>(
    Name.PresetHandler,
    {
      preset: stubs.COPY_SINGLE_FILE,
      inherit: false,
    },
    {
      targetDirectory: TARGET_DIRECTORY,
      argv: ['--copy-flag'],
    }
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'hello.txt'))).toBe(true);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'copy-flag.txt'))).toBe(false);
});

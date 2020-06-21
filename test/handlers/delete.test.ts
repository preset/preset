import { mock } from 'jest-mock-extended';
import { DeleteActionContract, ContextContract } from '@/Contracts';
import { Name } from '@/Container';
import { TARGET_DIRECTORY, templates } from '../constants';
import { handle } from './handlers.test';
import fs from 'fs-extra';
import path from 'path';

beforeEach(async () => {
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'hello.txt'));
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'sub', 'world.txt'));
});

beforeAll(() => fs.removeSync(TARGET_DIRECTORY));
afterAll(() => fs.removeSync(TARGET_DIRECTORY));

it('deletes everything in a folder with a glob', async () => {
  await handle<DeleteActionContract>(
    Name.DeleteHandler,
    {
      files: '**/*',
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'hello.txt'))).toBe(false);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub', 'world.txt'))).toBe(false);
});

it('deletes a specific file', async () => {
  await handle<DeleteActionContract>(
    Name.DeleteHandler,
    {
      files: 'sub/world.txt',
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'hello.txt'))).toBe(true);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub', 'world.txt'))).toBe(false);
});

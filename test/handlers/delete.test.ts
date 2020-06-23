import { DeleteActionContract } from '@/Contracts';
import { Name } from '@/Container';
import { TARGET_DIRECTORY } from '../constants';
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
      files: '**/**',
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'hello.txt'))).toBe(false);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub', 'world.txt'))).toBe(false);
});

it('deletes specific directories', async () => {
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'sub', 'hello.txt'));
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'sub2', 'hello.txt'));
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'sub3', 'hello.txt'));
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'hello.txt'));

  await handle<DeleteActionContract>(
    Name.DeleteHandler,
    {
      directories: ['sub', 'sub2'],
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub'))).toBe(false);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub2'))).toBe(false);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub3', 'hello.txt'))).toBe(true);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'hello.txt'))).toBe(true);
});

it('deletes specific files', async () => {
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'sub', 'hello.txt'));
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'sub', 'world.txt'));
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'sub2', 'hello.txt'));
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'hello.txt'));

  await handle<DeleteActionContract>(
    Name.DeleteHandler,
    {
      files: ['sub/*.txt', 'hello.txt'],
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub', 'hello.txt'))).toBe(false);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub', 'world.txt'))).toBe(false);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub2', 'hello.txt'))).toBe(true);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'hello.txt'))).toBe(false);
});

it('deletes nothing by default', async () => {
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'sub', 'hello.txt'));
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'hello.txt'));

  await handle<DeleteActionContract>(
    Name.DeleteHandler,
    {},
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub', 'hello.txt'))).toBe(true);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'hello.txt'))).toBe(true);
});

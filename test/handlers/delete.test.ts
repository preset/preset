import { ContextContract, DeleteHandler, DeleteActionContract } from '../../src';
import { mock } from 'jest-mock-extended';
import { sleep, delay } from '../sleep';
import path from 'path';
import fs from 'fs-extra';

const TARGET_DIRECTORY = path.join(__dirname, '..', '__target__');
const TEMPLATES_DIRECTORY = path.join(__dirname, '..', '__templates__');

beforeEach(async () => {
  await sleep(delay);
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'delete', 'hello.txt'));
  fs.ensureFileSync(path.join(TARGET_DIRECTORY, 'delete', 'sub', 'world.txt'));
});

beforeAll(() => {
  fs.removeSync(TARGET_DIRECTORY);
});

afterAll(() => {
  fs.removeSync(TARGET_DIRECTORY);
});

it('deletes everything in a folder with a glob', async () => {
  await new DeleteHandler().handle(
    mock<DeleteActionContract>({
      files: '**/*',
    }),
    mock<ContextContract>({
      targetDirectory: path.join(TARGET_DIRECTORY, 'delete'),
    })
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'delete', 'hello.txt'))).toBe(false);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'delete', 'sub', 'world.txt'))).toBe(false);
});

it('deletes a specific file', async () => {
  await new DeleteHandler().handle(
    mock<DeleteActionContract>({
      files: 'sub/world.txt',
    }),
    mock<ContextContract>({
      targetDirectory: path.join(TARGET_DIRECTORY, 'delete'),
    })
  );

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'delete', 'hello.txt'))).toBe(true);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'delete', 'sub', 'world.txt'))).toBe(false);
});

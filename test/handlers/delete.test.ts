import { ContextContract, DeleteHandler, DeleteActionContract } from '../../src';
import { mock } from 'jest-mock-extended';
import path from 'path';
import fs from 'fs-extra';

const TARGET_DIRECTORY = path.join(__dirname, '..', '__target__');
const TEMPLATES_DIRECTORY = path.join(__dirname, '..', '__templates__');

beforeEach(async () => {
  await fs.ensureFile(path.join(TARGET_DIRECTORY, 'delete', 'hello.txt'));
  await fs.ensureFile(path.join(TARGET_DIRECTORY, 'delete', 'sub', 'world.txt'));
});

beforeAll(async () => {
  await fs.remove(TARGET_DIRECTORY);
});

afterAll(async () => {
  await fs.remove(TARGET_DIRECTORY);
});

describe('Delete Handler', () => {
  it('deletes everything in a folder with a glob', async () => {
    await new DeleteHandler().handle(
      mock<DeleteActionContract>({
        files: '**/*',
      }),
      mock<ContextContract>({
        targetDirectory: path.join(TARGET_DIRECTORY, 'delete'),
      })
    );

    expect(await fs.pathExists(path.join(TARGET_DIRECTORY, 'delete', 'hello.txt'))).toBe(false);
    expect(await fs.pathExists(path.join(TARGET_DIRECTORY, 'delete', 'sub', 'world.txt'))).toBe(false);
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

    expect(await fs.pathExists(path.join(TARGET_DIRECTORY, 'delete', 'hello.txt'))).toBe(true);
    expect(await fs.pathExists(path.join(TARGET_DIRECTORY, 'delete', 'sub', 'world.txt'))).toBe(false);
  });
});

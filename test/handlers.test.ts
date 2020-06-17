import { CopyHandler, ContextContract, CopyActionContract, Log } from '../src';
import { mock } from 'jest-mock-extended';
import path from 'path';
import fs from 'fs-extra';

const TARGET_DIRECTORY = path.join(__dirname, 'target');
const TEMPLATES_DIRECTORY = path.join(__dirname, 'templates');

beforeEach(async () => {
  await fs.emptyDir(TARGET_DIRECTORY);
});

afterAll(async () => {
  await fs.remove(TARGET_DIRECTORY);
});

describe('Copy Handler', () => {
  it('copies everything in a folder with a glob', async () => {
    await fs.emptyDir(TARGET_DIRECTORY);

    await new CopyHandler().handle(
      mock<CopyActionContract>({
        files: '**/*',
        target: '',
      }),
      mock<ContextContract>({
        targetDirectory: path.join(TARGET_DIRECTORY, 'copy'),
        presetTemplates: path.join(TEMPLATES_DIRECTORY, 'copy'),
      })
    );

    expect(await fs.pathExists(path.join(TARGET_DIRECTORY, 'copy', 'hello.txt'))).toBe(true);
    expect(await fs.pathExists(path.join(TARGET_DIRECTORY, 'copy', 'sub', 'world.txt'))).toBe(true);
  });
});

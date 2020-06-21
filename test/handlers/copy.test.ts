import { CopyActionContract, ContextContract } from '@/Contracts';
import { Prompt } from '@/Prompt';
import { Name } from '@/Container';
import { Log } from '@/Logger';
import { validate, handle } from './handlers.test';
import { TARGET_DIRECTORY, templates, stubs } from '../constants';
import path from 'path';
import fs from 'fs-extra';

describe('Validator', () => {
  it('returns a complete action object when validating a partial one', async () => {
    const result = await validate<CopyActionContract>('copy', {
      type: 'copy',
    });

    expect(result).toStrictEqual<CopyActionContract>({
      type: 'copy',
      files: '*',
      directories: [],
      target: '',
      strategy: 'ask',
    });
  });

  it('does not override a property when validating a partial object', async () => {
    const result = await validate<CopyActionContract>('copy', {
      files: ['file1.txt', 'file2.txt'],
    });

    expect(result).toStrictEqual<CopyActionContract>({
      type: 'copy',
      directories: [],
      files: ['file1.txt', 'file2.txt'],
      target: '',
      strategy: 'ask',
    });
  });

  it('replaces an unkown strategy by a the default one', async () => {
    Log.fake();
    const result = await validate<CopyActionContract>('copy', {
      // @ts-expect-error
      strategy: 'idk',
    });

    expect(result).toMatchObject<Partial<CopyActionContract>>({
      strategy: 'ask',
    });
    expect(Log.history).toContainEqual('warn Unknown strategy idk for a copy action.');
  });
});

describe('Handler', () => {
  beforeEach(() => fs.emptyDirSync(TARGET_DIRECTORY));
  afterAll(() => fs.removeSync(TARGET_DIRECTORY));

  async function handleCopy(action: Partial<CopyActionContract>, context: Partial<ContextContract> = {}) {
    return await handle<CopyActionContract>(Name.CopyHandler, action, {
      targetDirectory: TARGET_DIRECTORY,
      presetTemplates: path.join(templates.COPY_WITH_SUBFOLDER),
      ...context,
    });
  }

  it('copies everything in a folder with a glob', async () => {
    const success = await handleCopy({
      files: '**/*',
      target: '',
    });

    expect(success).toBe(true);
    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'hello.txt'))).toBe(true);
    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub', 'world.txt'))).toBe(true);
  });

  it('copies a specific file in a specific folder', async () => {
    const success = await handleCopy({
      files: 'sub/world.txt',
      target: 'first-subfolder',
    });

    const target = path.join(TARGET_DIRECTORY, 'first-subfolder', 'sub', 'world.txt');
    expect(success).toBe(true);
    expect(fs.pathExistsSync(target)).toBe(true);
    expect(fs.readFileSync(target).toString()).toContain('world');
  });

  it('overrides existing files when using the override strategy', async () => {
    const originalFile = path.join(TARGET_DIRECTORY, 'hello.txt');
    const originalFileInSubfolder = path.join(TARGET_DIRECTORY, 'sub', 'world.txt');

    fs.outputFileSync(originalFile, 'Original content');
    fs.outputFileSync(originalFileInSubfolder, 'Original content');

    await handleCopy({
      files: '**/*',
      target: '',
      strategy: 'override',
    });

    expect(fs.pathExistsSync(originalFile)).toBe(true);
    expect(fs.pathExistsSync(originalFileInSubfolder)).toBe(true);
    expect(fs.readFileSync(originalFile).toString()).toContain('hello');
    expect(fs.readFileSync(originalFileInSubfolder).toString()).toContain('world');
  });

  it('overrides existing files after user answered yes when using the ask strategy', async () => {
    Prompt.fake();
    Log.fake();

    Prompt.on('prompt', prompt => {
      prompt.answer('y');
    });

    const originalFile = path.join(TARGET_DIRECTORY, 'hello.txt');
    const originalFileInSubfolder = path.join(TARGET_DIRECTORY, 'sub', 'world.txt');

    fs.outputFileSync(originalFile, 'Original content');
    fs.outputFileSync(originalFileInSubfolder, 'Original content');

    await handleCopy({
      files: '**/*',
      target: '',
      strategy: 'ask',
    });

    expect(fs.pathExistsSync(originalFile)).toBe(true);
    expect(fs.pathExistsSync(originalFileInSubfolder)).toBe(true);
    expect(fs.readFileSync(originalFile).toString()).toContain('hello');
    expect(fs.readFileSync(originalFileInSubfolder).toString()).toContain('world');
  });

  it('keeps existing files after user answered no when using the ask strategy', async () => {
    Prompt.fake();
    Log.fake();

    Prompt.on('prompt', prompt => {
      prompt.answer(false);
    });

    const originalFile = path.join(TARGET_DIRECTORY, 'hello.txt');
    const originalFileInSubfolder = path.join(TARGET_DIRECTORY, 'sub', 'world.txt');

    fs.outputFileSync(originalFile, 'Original content');
    fs.outputFileSync(originalFileInSubfolder, 'Original content');

    await handleCopy({
      files: '**/*',
      target: '',
      strategy: 'ask',
    });

    expect(fs.pathExistsSync(originalFile)).toBe(true);
    expect(fs.pathExistsSync(originalFileInSubfolder)).toBe(true);
    expect(fs.readFileSync(originalFile).toString()).toContain('Original content');
    expect(fs.readFileSync(originalFileInSubfolder).toString()).toContain('Original content');
  });

  it('skips existing files when they exist and when using the skip strategy', async () => {
    const originalFile = path.join(TARGET_DIRECTORY, 'hello.txt');
    const originalFileInSubfolder = path.join(TARGET_DIRECTORY, 'sub', 'world.txt');

    fs.outputFileSync(originalFile, 'Original content');

    await handleCopy({
      files: '**/*',
      target: '',
      strategy: 'skip',
    });

    expect(fs.pathExistsSync(originalFile)).toBe(true);
    expect(fs.pathExistsSync(originalFileInSubfolder)).toBe(true);
    expect(fs.readFileSync(originalFile).toString()).toContain('Original content');
    expect(fs.readFileSync(originalFileInSubfolder).toString()).toContain('world');
  });

  it('copies a map of directories to their targets', async () => {
    const success = await handleCopy(
      {
        directories: {
          sub1: 'root1',
          'sub1/sub2': 'root2',
        },
        strategy: 'skip',
      },
      {
        presetTemplates: templates.COPY_WITH_SUBFOLDERS,
      }
    );

    expect(success).toBe(true);
    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'root1', 'file1.txt'))).toBe(true);
    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'root1', 'sub2', 'file3.txt'))).toBe(true);
    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'root2', 'file3.txt'))).toBe(true);
  });
});

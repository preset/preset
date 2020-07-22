import { CopyActionContract, ContextContract } from '@/Contracts';
import { Name } from '@/Container';
import { validate, handle } from './handlers.test';
import { TARGET_DIRECTORY, templates } from '../constants';
import path from 'path';
import fs from 'fs-extra';

describe('Validator', () => {
  it('returns a complete action object when validating a partial one', async () => {
    const result = await validate<CopyActionContract>('copy', {
      type: 'copy',
    });

    expect(result).toStrictEqual<CopyActionContract>({
      type: 'copy',
      files: '**/**',
      ignoreDotfiles: false,
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
      ignoreDotfiles: false,
      target: '',
      strategy: 'ask',
    });
  });

  it('throws when an unknown strategy is given', async () => {
    const test = async () => {
      await validate<CopyActionContract>('copy', {
        strategy: 'idk' as any,
      });
    };

    await expect(test).rejects.toThrow('Unknown strategy idk');
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

  it.skip('overrides existing files after user answered yes when using the ask strategy', async () => {
    // @ts-ignore
    // enquirer.on('prompt', prompt => {
    //   prompt.value = true;
    //   prompt.submit();
    // });

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

  it.skip('keeps existing files after user answered no when using the ask strategy', async () => {
    // Prompt.on('prompt', prompt => {
    //   prompt.answer(false);
    // });

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

  it.skip('skips existing files when they exist and when using the skip strategy', async () => {
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

  it('copies the whole templates directory by default', async () => {
    const action = await validate<CopyActionContract>('copy', {
      type: 'copy',
    });
    const success = await handleCopy(action as CopyActionContract, {
      presetTemplates: templates.COPY_WITH_SUBFOLDERS,
    });

    expect(success).toBe(true);
    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'root.txt'))).toBe(true);
    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub1', 'file1.txt'))).toBe(true);
    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'sub1', 'sub2', 'file3.txt'))).toBe(true);
  });

  it('it transforms .dotfile files into actual dotfiles', async () => {
    await handleCopy(
      {
        files: '**/*',
        target: '',
        strategy: 'skip',
      },
      {
        presetTemplates: templates.COPY_WITH_DOTFILES,
      }
    );

    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, '.file'))).toBe(true);
    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, '.gitignore'))).toBe(true);
    expect(fs.readFileSync(path.join(TARGET_DIRECTORY, '.gitignore')).toString()).toContain('node_modules');
  });

  it('ignores dot files when told to', async () => {
    await handleCopy(
      {
        files: '**/*',
        target: '',
        ignoreDotfiles: true,
        strategy: 'skip',
      },
      {
        presetTemplates: templates.COPY_WITH_DOTFILES,
      }
    );

    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, '.file'))).toBe(false);
    expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, '.gitignore'))).toBe(true);
    expect(fs.readFileSync(path.join(TARGET_DIRECTORY, '.gitignore')).toString()).toContain('node_modules');
  });
});

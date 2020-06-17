import { Prompt, CopyHandler, ContextContract, CopyActionContract, Log } from '../../src';
import { mock } from 'jest-mock-extended';
import path from 'path';
import fs from 'fs-extra';

const TARGET_DIRECTORY = path.join(__dirname, '..', '__target__');
const TEMPLATES_DIRECTORY = path.join(__dirname, '..', '__templates__');

beforeEach(async () => {
  await fs.emptyDir(TARGET_DIRECTORY);
});

beforeAll(async () => {
  await fs.remove(TARGET_DIRECTORY);
});

afterAll(async () => {
  await fs.remove(TARGET_DIRECTORY);
});

describe('Copy Handler', () => {
  it('copies everything in a folder with a glob', async () => {
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

  it('copies a specific file in a specific folder', async () => {
    await new CopyHandler().handle(
      mock<CopyActionContract>({
        files: 'sub/world.txt',
        target: 'first-subfolder',
      }),
      mock<ContextContract>({
        targetDirectory: path.join(TARGET_DIRECTORY, 'copy'),
        presetTemplates: path.join(TEMPLATES_DIRECTORY, 'copy'),
      })
    );

    const target = path.join(TARGET_DIRECTORY, 'copy', 'first-subfolder', 'sub', 'world.txt');
    expect(await fs.pathExists(target)).toBe(true);
    expect((await fs.readFile(target)).toString()).toBe('world\n');
  });

  async function copyWithOriginalFiles(
    copyAction: CopyActionContract,
    originalFile: string | false,
    originalFileInSubfolder: string | false,
    originalContent: string = 'Original content'
  ) {
    if (false !== originalFile) {
      await fs.outputFile(originalFile, originalContent);
    }

    if (false !== originalFileInSubfolder) {
      await fs.outputFile(originalFileInSubfolder, originalContent);
    }

    await new CopyHandler().handle(
      copyAction,
      mock<ContextContract>({
        targetDirectory: path.join(TARGET_DIRECTORY, 'copy'),
        presetTemplates: path.join(TEMPLATES_DIRECTORY, 'copy'),
      })
    );
  }

  it('overrides existing files when using the override strategy', async () => {
    const originalFile = path.join(TARGET_DIRECTORY, 'copy', 'hello.txt');
    const originalFileInSubfolder = path.join(TARGET_DIRECTORY, 'copy', 'sub', 'world.txt');

    await copyWithOriginalFiles(
      mock<CopyActionContract>({
        files: '**/*',
        target: '',
        strategy: 'override',
      }),
      originalFile,
      originalFileInSubfolder
    );

    expect(await fs.pathExists(originalFile)).toBe(true);
    expect(await fs.pathExists(originalFileInSubfolder)).toBe(true);
    expect((await fs.readFile(originalFile)).toString()).toBe('hello\n');
    expect((await fs.readFile(originalFileInSubfolder)).toString()).toBe('world\n');
  });

  it('overrides existing files after user answered yes when using the ask strategy', async () => {
    Prompt.fake();
    Log.fake();

    Prompt.prompt.on('prompt', prompt => {
      if ('confirm' === prompt.type) {
        prompt.answer('y');
      }
    });

    const originalFile = path.join(TARGET_DIRECTORY, 'copy', 'hello.txt');
    const originalFileInSubfolder = path.join(TARGET_DIRECTORY, 'copy', 'sub', 'world.txt');
    await copyWithOriginalFiles(
      mock<CopyActionContract>({
        files: '**/*',
        target: '',
        strategy: 'ask',
      }),
      originalFile,
      originalFileInSubfolder
    );

    expect(await fs.pathExists(originalFile)).toBe(true);
    expect(await fs.pathExists(originalFileInSubfolder)).toBe(true);
    expect((await fs.readFile(originalFile)).toString()).toBe('hello\n');
    expect((await fs.readFile(originalFileInSubfolder)).toString()).toBe('world\n');
  });

  it('keeps existing files after user answered no when using the ask strategy', async () => {
    Prompt.fake();
    Log.fake();

    Prompt.prompt.on('prompt', prompt => {
      prompt.answer(false);
    });

    const originalContent = 'Original content';
    const originalFile = path.join(TARGET_DIRECTORY, 'copy', 'hello.txt');
    const originalFileInSubfolder = path.join(TARGET_DIRECTORY, 'copy', 'sub', 'world.txt');
    await copyWithOriginalFiles(
      mock<CopyActionContract>({
        files: '**/*',
        target: '',
        strategy: 'ask',
      }),
      originalFile,
      originalFileInSubfolder,
      originalContent
    );

    expect(await fs.pathExists(originalFile)).toBe(true);
    expect(await fs.pathExists(originalFileInSubfolder)).toBe(true);
    expect((await fs.readFile(originalFile)).toString()).toBe(originalContent);
    expect((await fs.readFile(originalFileInSubfolder)).toString()).toBe(originalContent);
  });

  it('skips existing files when they exist and when using the skip strategy', async () => {
    const originalContent = 'Original content';
    const originalFile = path.join(TARGET_DIRECTORY, 'copy', 'hello.txt');
    const newFileFileInSubfolder = path.join(TARGET_DIRECTORY, 'copy', 'sub', 'world.txt');

    await copyWithOriginalFiles(
      mock<CopyActionContract>({
        files: '**/*',
        target: '',
        strategy: 'skip',
      }),
      originalFile,
      false,
      originalContent
    );

    expect(await fs.pathExists(originalFile)).toBe(true);
    expect(await fs.pathExists(newFileFileInSubfolder)).toBe(true);
    expect((await fs.readFile(originalFile)).toString()).toBe(originalContent);
    expect((await fs.readFile(newFileFileInSubfolder)).toString()).toBe('world\n');
  });
});

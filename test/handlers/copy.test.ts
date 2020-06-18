import { Prompt, CopyHandler, ContextContract, CopyActionContract, Log } from '../../src';
import { sleep, delay } from '../sleep';
import { mock } from 'jest-mock-extended';
import path from 'path';
import fs from 'fs-extra';

const TARGET_DIRECTORY = path.join(__dirname, '..', '__target__');
const TEMPLATES_DIRECTORY = path.join(__dirname, '..', '__templates__');

beforeEach(async () => {
  await sleep(delay);
  fs.emptyDirSync(TARGET_DIRECTORY);
});

beforeAll(() => {
  fs.removeSync(TARGET_DIRECTORY);
});

afterAll(() => {
  fs.removeSync(TARGET_DIRECTORY);
});

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

  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'copy', 'hello.txt'))).toBe(true);
  expect(fs.pathExistsSync(path.join(TARGET_DIRECTORY, 'copy', 'sub', 'world.txt'))).toBe(true);
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
  expect(fs.pathExistsSync(target)).toBe(true);
  expect(fs.readFileSync(target).toString()).toBe('world\r\n');
});

async function copyWithOriginalFiles(
  copyAction: CopyActionContract,
  originalFile: string | false,
  originalFileInSubfolder: string | false,
  originalContent: string = 'Original content'
) {
  if (false !== originalFile) {
    fs.outputFileSync(originalFile, originalContent);
  }

  if (false !== originalFileInSubfolder) {
    fs.outputFileSync(originalFileInSubfolder, originalContent);
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

  expect(fs.pathExistsSync(originalFile)).toBe(true);
  expect(fs.pathExistsSync(originalFileInSubfolder)).toBe(true);
  expect(fs.readFileSync(originalFile).toString()).toBe('hello\r\n');
  expect(fs.readFileSync(originalFileInSubfolder).toString()).toBe('world\r\n');
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

  expect(fs.pathExistsSync(originalFile)).toBe(true);
  expect(fs.pathExistsSync(originalFileInSubfolder)).toBe(true);
  expect(fs.readFileSync(originalFile).toString()).toBe('hello\r\n');
  expect(fs.readFileSync(originalFileInSubfolder).toString()).toBe('world\r\n');
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

  expect(fs.pathExistsSync(originalFile)).toBe(true);
  expect(fs.pathExistsSync(originalFileInSubfolder)).toBe(true);
  expect(fs.readFileSync(originalFile).toString()).toBe(originalContent);
  expect(fs.readFileSync(originalFileInSubfolder).toString()).toBe(originalContent);
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

  expect(fs.pathExistsSync(originalFile)).toBe(true);
  expect(fs.pathExistsSync(newFileFileInSubfolder)).toBe(true);
  expect(fs.readFileSync(originalFile).toString()).toBe(originalContent);
  expect(fs.readFileSync(newFileFileInSubfolder).toString()).toBe('world\r\n');
});

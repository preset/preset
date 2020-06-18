import { ContextContract, UpdateJsonFileHandler, UpdateJsonFileActionContract, Log } from '../../src';
import { mock } from 'jest-mock-extended';
import { sleep, delay } from '../sleep';
import path from 'path';
import fs from 'fs-extra';

const TARGET_DIRECTORY = path.join(__dirname, '..', '__target__');
const PACKAGE_PATH = path.join(TARGET_DIRECTORY, 'edit-json-file', 'package.json');

beforeEach(async () => {
  await sleep(delay);
});

beforeAll(() => {
  fs.emptyDirSync(TARGET_DIRECTORY);
});

afterAll(() => {
  fs.removeSync(TARGET_DIRECTORY);
});

it('merges specified content with existing content', async () => {
  fs.ensureFileSync(PACKAGE_PATH);
  fs.writeJsonSync(PACKAGE_PATH, {
    author: 'Jon Doe <jon@hey.com>', // $300 handle
    dependencies: {
      vue: '^2.0.0',
      lodash: '^1',
    },
  });

  await new UpdateJsonFileHandler().handle(
    {
      target: 'package.json',
      merge: {
        dependencies: {
          '@supportjs/text': '^1.0',
          lodash: '^4',
        },
      },
      type: 'update-json-file',
      strategy: 'create',
    },
    mock<ContextContract>({
      targetDirectory: path.join(TARGET_DIRECTORY, 'edit-json-file'),
    })
  );

  expect(fs.readJsonSync(PACKAGE_PATH)).toStrictEqual({
    author: 'Jon Doe <jon@hey.com>', // $300 handle
    dependencies: {
      vue: '^2.0.0',
      lodash: '^4',
      '@supportjs/text': '^1.0',
    },
  });
});

it('removes specified paths from existing content', async () => {
  fs.ensureFileSync(PACKAGE_PATH);
  fs.writeJsonSync(PACKAGE_PATH, {
    author: 'Jon Doe <jon@hey.com>', // $300 handle
    dependencies: {
      '@supportjs/text': '^1.0',
      vue: '^2.0.0',
      lodash: '^1',
    },
  });

  await new UpdateJsonFileHandler().handle(
    {
      target: 'package.json',
      remove: ['dependencies.vue', 'author'],
      type: 'update-json-file',
      strategy: 'create',
    },
    mock<ContextContract>({
      targetDirectory: path.join(TARGET_DIRECTORY, 'edit-json-file'),
    })
  );

  expect(fs.readJsonSync(PACKAGE_PATH)).toStrictEqual({
    dependencies: {
      '@supportjs/text': '^1.0',
      lodash: '^1',
    },
  });
});

it('creates the file if it does not exist when using the create strategy', async () => {
  fs.removeSync(PACKAGE_PATH);
  await new UpdateJsonFileHandler().handle(
    {
      target: 'package.json',
      merge: {
        author: 'Komi Shouko <komi@icantspeak.jp>',
        dependencies: {
          lodash: '^4',
        },
      },
      type: 'update-json-file',
      strategy: 'create',
    },
    mock<ContextContract>({
      targetDirectory: path.join(TARGET_DIRECTORY, 'edit-json-file'),
    })
  );

  expect(fs.readJsonSync(PACKAGE_PATH)).toStrictEqual({
    author: 'Komi Shouko <komi@icantspeak.jp>',
    dependencies: {
      lodash: '^4',
    },
  });
});

it('skips the file if it does not exist when using the skip strategy', async () => {
  fs.removeSync(PACKAGE_PATH);
  await new UpdateJsonFileHandler().handle(
    {
      target: 'package.json',
      merge: {
        author: 'Komi Shouko <komi@icantspeak.jp>',
      },
      type: 'update-json-file',
      strategy: 'skip',
    },
    mock<ContextContract>({
      targetDirectory: path.join(TARGET_DIRECTORY, 'edit-json-file'),
    })
  );

  expect(fs.pathExistsSync(PACKAGE_PATH)).toBe(false);
});

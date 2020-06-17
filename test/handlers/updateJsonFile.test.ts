import { ContextContract, UpdateJsonFileHandler, UpdateJsonFileActionContract, Log } from '../../src';
import { mock } from 'jest-mock-extended';
import path from 'path';
import fs from 'fs-extra';

const TARGET_DIRECTORY = path.join(__dirname, '..', '__target__');
const PACKAGE_PATH = path.join(TARGET_DIRECTORY, 'edit-json-file', 'package.json');

beforeAll(async () => {
  await fs.emptyDir(TARGET_DIRECTORY);
});

afterAll(async () => {
  await fs.remove(TARGET_DIRECTORY);
});

describe('update-json-file handler', () => {
  it('merges specified content with existing content', async () => {
    await fs.ensureFile(PACKAGE_PATH);
    await fs.writeJson(PACKAGE_PATH, {
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

    expect(await fs.readJson(PACKAGE_PATH)).toStrictEqual({
      author: 'Jon Doe <jon@hey.com>', // $300 handle
      dependencies: {
        vue: '^2.0.0',
        lodash: '^4',
        '@supportjs/text': '^1.0',
      },
    });
  });

  it('removes specified paths from existing content', async () => {
    await fs.ensureFile(PACKAGE_PATH);
    await fs.writeJson(PACKAGE_PATH, {
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

    expect(await fs.readJson(PACKAGE_PATH)).toStrictEqual({
      dependencies: {
        '@supportjs/text': '^1.0',
        lodash: '^1',
      },
    });
  });

  it('creates the file if it does not exist when using the create strategy', async () => {
    await fs.remove(PACKAGE_PATH);
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

    expect(await fs.readJson(PACKAGE_PATH)).toStrictEqual({
      author: 'Komi Shouko <komi@icantspeak.jp>',
      dependencies: {
        lodash: '^4',
      },
    });
  });

  it('skips the file if it does not exist when using the skip strategy', async () => {
    await fs.remove(PACKAGE_PATH);
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

    expect(await fs.pathExists(PACKAGE_PATH)).toBe(false);
  });
});

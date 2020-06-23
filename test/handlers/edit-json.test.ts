import { Name } from '@/Container';
import { EditJsonActionContract } from '@/Contracts';
import { TARGET_DIRECTORY } from '../constants';
import { handle } from './handlers.test';
import fs from 'fs-extra';
import path from 'path';

beforeAll(() => fs.ensureDirSync(TARGET_DIRECTORY));
afterAll(() => fs.removeSync(TARGET_DIRECTORY));

it('merges content in a JSON file', async () => {
  const jsonPath = path.join(TARGET_DIRECTORY, 'package.json');
  fs.writeJsonSync(jsonPath, {
    dependencies: {
      'laravel-mix': '^4',
    },
  });

  await handle<EditJsonActionContract>(
    Name.EditJsonHandler,
    {
      file: 'package.json',
      merge: {
        license: 'MIT',
        dependencies: {
          vue: '^2',
          '@supportjs/text': '^1',
        },
      },
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.readJsonSync(jsonPath)).toStrictEqual({
    license: 'MIT',
    dependencies: {
      'laravel-mix': '^4',
      vue: '^2',
      '@supportjs/text': '^1',
    },
  });
});

it('deletes content from a JSON file', async () => {
  const jsonPath = path.join(TARGET_DIRECTORY, 'package.json');
  fs.writeJsonSync(jsonPath, {
    license: 'MIT',
    dependencies: {
      'laravel-mix': '^4',
      '@supportjs/text': '^1',
    },
  });

  await handle<EditJsonActionContract>(
    Name.EditJsonHandler,
    {
      file: 'package.json',
      delete: ['dependencies.@supportjs/text', 'license'],
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.readJsonSync(jsonPath)).toStrictEqual({
    dependencies: {
      'laravel-mix': '^4',
    },
  });
});

it('performs both a merge and a deletion on a JSON file', async () => {
  const jsonPath = path.join(TARGET_DIRECTORY, 'package.json');
  fs.writeJsonSync(jsonPath, {
    license: 'MIT',
    dependencies: {
      'laravel-mix': '^4',
      '@supportjs/text': '^1',
    },
  });

  await handle<EditJsonActionContract>(
    Name.EditJsonHandler,
    {
      file: 'package.json',
      delete: ['dependencies.@supportjs/text', 'license'],
      merge: {
        dependencies: {
          vue: '^2',
        },
        devDependencies: {
          tailwindcss: '^1.4',
        },
      },
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  expect(fs.readJsonSync(jsonPath)).toStrictEqual({
    dependencies: {
      'laravel-mix': '^4',
      vue: '^2',
    },
    devDependencies: {
      tailwindcss: '^1.4',
    },
  });
});

it('handles globs', async () => {
  const jsonPath = path.join(TARGET_DIRECTORY, 'package.json');
  const subJsonPath = path.join(TARGET_DIRECTORY, 'sub', 'package.json');

  [jsonPath, subJsonPath].forEach(json => {
    fs.ensureFileSync(json);
    fs.writeJsonSync(json, {
      license: 'MIT',
      dependencies: {
        'laravel-mix': '^4',
        '@supportjs/text': '^1',
      },
    });
  });

  await handle<EditJsonActionContract>(
    Name.EditJsonHandler,
    {
      file: '**/*.json',
      delete: ['dependencies.@supportjs/text', 'license'],
    },
    {
      targetDirectory: TARGET_DIRECTORY,
    }
  );

  [jsonPath, subJsonPath].forEach(json => {
    expect(fs.readJsonSync(json)).toStrictEqual({
      dependencies: {
        'laravel-mix': '^4',
      },
    });
  });
});

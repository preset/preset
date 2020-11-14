import { handleInSandbox, makePreset, readFromSandbox, sandboxHasFile, stubs, writeToSandbox } from '@test/test-helpers';
import { EditJson, Name, Preset } from '@/exports';

/**
 * Runs the edit handler with the given initial file, against the expected file.
 */
async function testEditJsonHandler(
  initialFile: Record<any, any>,
  expectedFile: Record<any, any>,
  configureAtion: (preset: Preset) => EditJson,
) {
  const { preset, options } = makePreset();
  const action = configureAtion(preset);
  const fileName = action.file as string;

  await handleInSandbox(
    Name.Handler.EditJson,
    action,
    options,
    () => {
      expect(JSON.parse(readFromSandbox(fileName)!)).toStrictEqual(expectedFile);
    },
    () => {
      writeToSandbox(fileName, JSON.stringify(initialFile, undefined, 2));
    },
  );
}

it('deeply merges the given content', async () => {
  await testEditJsonHandler(
    {
      manga: 'Komi-san Cannot Communicate',
      protagonists: {
        Komi: 'Goddess',
      },
    },
    {
      manga: 'Komi-san Cannot Communicate',
      protagonists: {
        Komi: 'Goddess',
        Tadano: 'Average guy',
      },
    },
    (preset) => {
      return preset.editJson('file.json').merge({
        protagonists: {
          Tadano: 'Average guy',
        },
      });
    },
  );
});

it('deletes the properties at the given path', async () => {
  await testEditJsonHandler(
    {
      frameworks: {
        Tailwind: 'CSS',
        Vue: 'JS',
        Laravel: 'PHP',
        Bootstrap: 'CSS',
      },
    },
    {
      frameworks: {
        Tailwind: 'CSS',
        Vue: 'JS',
        Laravel: 'PHP',
      },
    },
    (preset) => preset.editJson('file.json').delete('frameworks.Bootstrap'),
  );
});

it('both merges and delete properties in the same action', async () => {
  await testEditJsonHandler(
    {
      frameworks: {
        Vue: 'JS',
        Laravel: 'PHP',
        Bootstrap: 'CSS',
      },
    },
    {
      frameworks: {
        Tailwind: 'CSS',
        Vue: 'JS',
        Laravel: 'PHP',
      },
    },
    (preset) => {
      return preset
        .editJson('file.json')
        .merge({
          frameworks: {
            Tailwind: 'CSS',
          },
        })
        .delete('frameworks.Bootstrap');
    },
  );
});

it('updates dependencies from a package.json', async () => {
  await testEditJsonHandler(
    {
      dependencies: {
        'use-preset': '^0.2',
      },
    },
    {
      dependencies: {
        'use-preset': '^0.2',
        'inertia-vue': '^0.4',
      },
      devDependencies: {
        tailwindcss: '^1.9',
      },
    },
    (preset) => {
      return preset.editNodePackages().add('inertia-vue', '^0.4').addDev('tailwindcss', '^1.9');
    },
  );
});

it.only('updates dependencies from a composer.json', async () => {
  await testEditJsonHandler(
    {
      require: {
        'laravel/framework': '^8.0',
      },
    },
    {
      require: {
        'laravel/framework': '^8.0',
        'inertiajs/inertia-laravel': '^0.3',
      },
      'require-dev': {
        'barryvdh/laravel-ide-helper': '^2.8',
      },
    },
    (preset) => {
      return preset.editPhpPackages().add('inertiajs/inertia-laravel', '^0.3').addDev('barryvdh/laravel-ide-helper', '^2.8');
    },
  );
});

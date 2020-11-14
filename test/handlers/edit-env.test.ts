import { handleInSandbox, makePreset, readFromSandbox, sandboxHasFile, sandboxPath, stubs, writeToSandbox } from '@test/test-helpers';
import { Name } from '@/exports';

it('creates a .env file if it does not exist', async () => {
  const { preset, options } = makePreset();
  const action = preset.setEnv('KOMI_SAN', 'Goddess').createIfMissing();

  await handleInSandbox(Name.Handler.EditEnv, action, options, () => {
    expect(sandboxHasFile('.env')).toBe(true);
    expect(readFromSandbox('.env')).toContain('KOMI_SAN=Goddess');
  });
});

it('does not write a .env if it is missing', async () => {
  const { preset, options } = makePreset();
  const action = preset.setEnv('KOMI_SAN', 'Goddess').skipIfMissing();

  await handleInSandbox(Name.Handler.EditEnv, action, options, () => {
    expect(sandboxHasFile('.env')).toBe(false);
  });
});

it('updates the default .env file with the given variables', async () => {
  const { preset, options } = makePreset();
  const action = preset.setEnv('KOMI_SAN', 'Goddess').createIfMissing(false);

  await handleInSandbox(
    Name.Handler.EditEnv,
    action,
    options,
    () => {
      expect(sandboxHasFile('.env')).toBe(true);
      expect(readFromSandbox('.env')).toContain('KOMI_SAN=Goddess');
    },
    () => {
      writeToSandbox('.env', 'KOMI_SAN=');
    },
  );
});

it('reads existing environment variables', async () => {
  const { preset, options } = makePreset();
  const action = preset.setEnv('BEST_COUPLE', ({ BEST_GIRL }) => `${BEST_GIRL} + Tadano`);

  await handleInSandbox(
    Name.Handler.EditEnv,
    action,
    options,
    () => {
      expect(sandboxHasFile('.env')).toBe(true);
      expect(readFromSandbox('.env')).toContain('BEST_COUPLE=Komi-san + Tadano');
    },
    () => {
      writeToSandbox('.env', 'BEST_GIRL=Komi-san');
    },
  );
});

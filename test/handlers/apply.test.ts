import { handleInSandbox, makePreset, sandboxPath, stubs } from '@test/test-helpers';
import { Name } from '@/exports';
import fs from 'fs-extra';

it('applies the given preset', async () => {
  const { preset, options } = makePreset({ resolvable: stubs.HELLO_WORLD });
  const action = preset.apply(stubs.HELLO_WORLD);

  await handleInSandbox(Name.Handler.ApplyPreset, action, options, () => {
    expect(fs.existsSync(sandboxPath('hello-world.txt'))).toBe(true);
  });
});

it('inherits given arguments', async () => {
  const { preset, options } = makePreset({ resolvable: stubs.HELLO_WORLD });
  const action = preset.apply(stubs.HELLO_WORLD).with('--no-extract');

  await handleInSandbox(Name.Handler.ApplyPreset, action, options, () => {
    expect(fs.existsSync(sandboxPath('hello-world.txt'))).toBe(false);
  });
});

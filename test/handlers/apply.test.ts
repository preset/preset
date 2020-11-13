import { generateOptions, handleInSandbox, sandboxPath, stubs } from '@test/test-helpers';
import { contextualizeObject, Name, Preset, registerPreset } from '@/exports';
import fs from 'fs-extra';

it('applies the given preset', async () => {
  const preset = registerPreset(new Preset());
  const action = contextualizeObject(preset.apply(stubs.HELLO_WORLD));
  const options = generateOptions(stubs.HELLO_WORLD);

  await handleInSandbox(Name.Handler.ApplyPreset, action, options, () => {
    expect(fs.existsSync(sandboxPath('hello-world.txt'))).toBe(true);
  });
});

it('inherits given arguments', async () => {
  const preset = registerPreset(new Preset());
  const action = contextualizeObject(preset.apply(stubs.HELLO_WORLD).with('--no-extract'));
  const options = generateOptions(stubs.HELLO_WORLD);

  await handleInSandbox(Name.Handler.ApplyPreset, action, options, () => {
    expect(fs.existsSync(sandboxPath('hello-world.txt'))).toBe(false);
  });
});

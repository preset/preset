import { Preset } from '@/Configuration/Preset';
import { container } from '@/Container';
import { HandlerContract } from '@/Contracts/HandlerContract';
import { ApplyPresetHandler } from '@/Handlers';
import { contextualizeObject, registerPreset } from '@/utils';
import { generateOptions, stubs } from '@test/test-helpers';

it('applies the given preset', async () => {
  const preset = registerPreset(new Preset());
  const action = contextualizeObject(preset.apply(stubs.HELLO_WORLD));
  const options = generateOptions(stubs.HELLO_WORLD);

  await container.get<HandlerContract>(ApplyPresetHandler).handle(action, options);
});

import { generateOptions, stubs } from '@test/test-helpers';
import { Binding, container, contextualizeObject, HandlerContract, Name, Preset, registerPreset } from '@/exports';

it('applies the given preset', async () => {
  const preset = registerPreset(new Preset());
  const action = contextualizeObject(preset.apply(stubs.HELLO_WORLD));
  const options = generateOptions(stubs.HELLO_WORLD);
  await container.getNamed<HandlerContract>(Binding.Handler, Name.Handler.ApplyPreset).handle(action, options);
});

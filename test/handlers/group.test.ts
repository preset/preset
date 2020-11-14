import { Binding, Bus, container, Name, outputMessage } from '@/exports';
import { makePreset, handleInSandbox } from '@test/test-helpers';
import stripAnsi from 'strip-ansi';

it('runs grouped actions', async () => {
  const { preset, options } = makePreset();
  const action = preset.group((preset) => {
    preset.execute('echo hello');
    preset.execute('echo world');
  });
  const logs: string[] = [];

  await handleInSandbox(
    Name.Handler.Group,
    action,
    options,
    () => {
      expect(logs).toContain('hello');
      expect(logs).toContain('world');
    },
    () => {
      container.get<Bus>(Binding.Bus).on(outputMessage, ({ payload: { content } }) => {
        logs.push(stripAnsi(content as string));
      });
    },
  );
});

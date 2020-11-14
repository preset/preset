import { Binding, Bus, container, Name, outputMessage } from '@/exports';
import { makePreset, handleInSandbox } from '@test/test-helpers';
import stripAnsi from 'strip-ansi';

// Note: maybe an event should be created, specific to
// commands, instead of testing output:message

it('executes a shell command', async () => {
  const { preset, options } = makePreset();
  const action = preset.execute('echo', 'hello world');
  const logs: string[] = [];

  await handleInSandbox(
    Name.Handler.Execute,
    action,
    options,
    () => {
      expect(logs).toContain('hello world');
    },
    () => {
      container.get<Bus>(Binding.Bus).on(outputMessage, ({ payload: { content } }) => {
        logs.push(stripAnsi(content as string));
      });
    },
  );
});

it('executes multiple shell commands', async () => {
  const { preset, options } = makePreset();
  const action = preset.execute(['echo hello', 'echo world']);
  const logs: string[] = [];

  await handleInSandbox(
    Name.Handler.Execute,
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

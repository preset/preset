import { container, Binding } from '@/Container';
import { CommandLineInterface } from '@/CommandLineInterface';
import { NullApplier } from '@/Appliers';
import { Log } from '@/Logger';

beforeEach(() => {
  Log.fake();
  container.rebind(Binding.Applier).to(NullApplier);
});

it('send a message when no argument is passed', async () => {
  const code = await container //
    .resolve(CommandLineInterface)
    .run([]);

  // Instead of checking contents, which will change, we just assert
  // that something was output.
  // TODO
  expect(Log.history.length).not.toBe(0);
  expect(code).toBe(1);
});

it('returns code 1 when no argument is passed', async () => {
  const code = await container //
    .resolve(CommandLineInterface)
    .run([]);

  expect(code).toBe(1);
});

it('returns code 1 when the help flag is passed', async () => {
  const code = await container //
    .resolve(CommandLineInterface)
    .run(['--help']);

  expect(code).toBe(1);
});

it('returns code 0 an argument is passed and the help flag is not passed', async () => {
  const code = await container //
    .resolve(CommandLineInterface)
    .run(['preset-name']);

  expect(code).toBe(0);
});

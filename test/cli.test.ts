import { container, Binding } from '@/Container';
import { CommandLineInterface } from '@/CommandLineInterface';
import { NullApplier } from '@/Appliers';

it('returns code 1 when no argument is passed', async () => {
  const code = await container //
    .resolve(CommandLineInterface)
    .run([]);

  // TODO - Expect missing argument message in logs
  expect(code).toBe(1);
});

it('returns code 1 when the help flag is passed', async () => {
  const code = await container //
    .resolve(CommandLineInterface)
    .run(['--help']);

  // TODO - Expect help message in logs
  expect(code).toBe(1);
});

it('returns code 0 an argument is passed and the help flag is not passed', async () => {
  container.rebind(Binding.Applier).to(NullApplier);

  const code = await container //
    .resolve(CommandLineInterface)
    .run(['preset-name']);

  expect(code).toBe(0);
});

import { container, Binding } from '@/Container';
import { CommandLineInterface } from '@/CommandLineInterface';
import { NullApplier } from '@/Appliers';
import { Logger } from '@/Logger';
import { ApplierContract, ApplierOptionsContract } from '@/Contracts';
import { injectable } from 'inversify';

beforeEach(() => {
  container.rebind(Binding.Applier).to(NullApplier);
});
beforeAll(() => jest.spyOn(console, 'log').mockImplementation());
afterAll(() => jest.restoreAllMocks());

it('send a message when no argument is passed', async () => {
  const code = await container //
    .resolve(CommandLineInterface)
    .run([]);

  // Instead of checking contents, which will change, we just assert
  // that something was output.
  // TODO
  expect(Logger.history.length).not.toBe(0);
  expect(code).toBe(1);
});

it('returns code 1 when no argument is passed', async () => {
  const code = await container //
    .resolve(CommandLineInterface)
    .run([]);

  expect(code).toBe(1);
});

it('returns code 0 when the help flag is passed', async () => {
  const code = await container //
    .resolve(CommandLineInterface)
    .run(['--help']);

  expect(code).toBe(0);
});

it('returns code 0 when an argument is passed and the help flag is not passed', async () => {
  container.rebind<ApplierContract>(Binding.Applier).to(NullApplier);
  const code = await container //
    .resolve(CommandLineInterface)
    .run(['preset-name']);

  expect(code).toBe(0);
});

it('handles the in command line parameter', async () => {
  const args: string[] = [];

  container.rebind<ApplierContract>(Binding.Applier).to(
    injectable()(
      class implements ApplierContract {
        async run(options: ApplierOptionsContract) {
          args.push(options.resolvable, options.in ?? '');
          return [];
        }
      }
    )
  );

  const code = await container //
    .resolve(CommandLineInterface)
    .run(['preset-name', '--in', 'subdirectory']);

  expect(code).toBe(0);
  expect(args).toStrictEqual(['preset-name', 'subdirectory']);
});

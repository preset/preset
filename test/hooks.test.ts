import { container, Binding, Name } from '@/Container';
import {
  ApplierContract,
  ParserContract,
  ContextContract,
  GeneratorContract,
  ActionHandlerContract,
} from '@/Contracts';
import { stubs, TARGET_DIRECTORY } from './constants';
import { injectable } from 'inversify';
import { CopyActionHandler } from '@/Handlers';

it('apply every hook in the right order', async () => {
  const logs: string[] = [];

  container
    .rebind<CopyActionHandler>(Binding.Handler)
    .to(
      injectable()(
        class implements ActionHandlerContract {
          for: any;
          async validate(action: any): Promise<any> {
            return action;
          }
          async handle(action: any): Promise<boolean> {
            logs.push(`copy ${action.files}`);
            return true;
          }
        }
      )
    )
    .whenTargetNamed(Name.CopyHandler);

  container.rebind<ParserContract>(Binding.Parser).to(
    injectable()(
      class implements ParserContract {
        async parse(): Promise<false | ContextContract> {
          return <ContextContract>{
            generator: <GeneratorContract>{
              name: 'hooks',
              before: () => logs.push('before'),
              after: () => logs.push('after'),
              beforeEach: () => logs.push('before each'),
              afterEach: () => logs.push('after each'),
              actions: () => [
                {
                  type: 'copy',
                  files: 'test.txt',
                },
                {
                  type: 'copy',
                  files: 'test2.txt',
                },
              ],
            },
            targetDirectory: TARGET_DIRECTORY,
          };
        }
      }
    )
  );

  const applier = container.get<ApplierContract>(Binding.Applier);
  const result = await applier.run(stubs.emptyActionList, [], true);

  expect(result).toBe(true);
  expect(logs).toStrictEqual([
    'before',
    'before each',
    'copy test.txt',
    'after each',
    'before each',
    'copy test2.txt',
    'after each',
    'after',
  ]);
});

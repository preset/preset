import { container, Binding, Name } from '@/Container';
import {
  ApplierContract,
  ParserContract,
  ContextContract,
  GeneratorContract,
  ActionHandlerContract,
  CopyActionContract,
} from '@/Contracts';
import { stubs, TARGET_DIRECTORY } from './constants';
import { injectable } from 'inversify';
import { CopyActionHandler } from '@/Handlers';
import { applyTasks } from './test-utils';

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
          async handle(action: any) {
            logs.push(`copy ${action.files}`);
            return { success: true };
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
              actions: async () =>
                <Partial<CopyActionContract>[]>[
                  {
                    type: 'copy',
                    files: 'test.txt',
                    before: () => logs.push('before first copy action'),
                    after: () => logs.push('after first copy action'),
                  },
                  {
                    type: 'copy',
                    files: 'test2.txt',
                    before: () => logs.push('before second copy action'),
                    after: () => logs.push('after second copy action'),
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
  const tasks = await applier.run({ resolvable: stubs.emptyActionList });

  await applyTasks(tasks);

  expect(logs).toStrictEqual([
    'before',
    'before each',
    'before first copy action',
    'copy test.txt',
    'after first copy action',
    'after each',
    'before each',
    'before second copy action',
    'copy test2.txt',
    'after second copy action',
    'after each',
    'after',
  ]);
});

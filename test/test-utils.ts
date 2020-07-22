import { Listr } from 'listr2';

export async function applyTasks(tasks: any) {
  const result: string[] = [];

  ['log', 'info', 'error', 'warn'].forEach(level => {
    jest.spyOn(global.console, level as any).mockImplementation((input: any) => result.push(input));
  });

  const context = await new Listr(tasks, {
    renderer: 'verbose',
  }).run();

  jest.restoreAllMocks();

  return { result, context };
}

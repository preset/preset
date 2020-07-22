import { Listr } from 'listr2';

export async function applyTasks(tasks: any) {
  const result: string[] = [];
  const spy = jest.spyOn(global.console, 'log').mockImplementation(input => result.push(input));
  const context = await new Listr(tasks, {
    renderer: 'verbose',
  }).run();
  spy.mockRestore();

  return { result, context };
}

import { container, Binding, Name } from '@/Container';
import { ActionHandlerContract, ContextContract, BaseActionContract } from '@/Contracts';
import { mock } from 'jest-mock-extended';

export function getHandlerInstance<T extends string>(type: T) {
  return container.getNamed<ActionHandlerContract<T>>(Binding.Handler, type);
}

export async function validate<T>(type: string, data: Partial<T>): Promise<T | false> {
  const handler = getHandlerInstance(type);

  return ((await handler.validate(
    {
      type,
      ...data,
    },
    {} as ContextContract
  )) as unknown) as T; // yikes
}

export async function handle<T>(type: string, data: Partial<T>, context?: Partial<ContextContract>) {
  const handler = getHandlerInstance(type);

  if (!context) {
    context = mock<ContextContract>();
  }

  const action = await handler.validate({ type, ...data }, context as ContextContract);
  return await handler.handle(action as BaseActionContract, context as ContextContract);
}

it('finds each handler in the container', () => {
  const handlers = container.getAll<ActionHandlerContract>(Binding.Handler);
  const knownHandlers = handlers.map(handler => handler.for);
  const seenHandlers = [];
  const types = [
    Name.CopyHandler,
    Name.DeleteHandler,
    Name.PromptHandler,
    Name.EditJsonHandler,
    Name.CustomHandler,
    Name.EditHandler,
    Name.PresetHandler,
    Name.InstallDependenciesHandler,
    Name.RunHandler,
  ];

  types.forEach(type => {
    const handler = getHandlerInstance(type);
    expect(handler.for).toBe(type);

    seenHandlers.push(type);
    expect(knownHandlers.includes(type)).toBe(true);
  });

  expect(seenHandlers.length).toBe(knownHandlers.length);
});

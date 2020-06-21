import { container, Binding, Name } from '@/Container';
import { ActionHandlerContract } from '@/Contracts';

export function getHandlerInstance<T extends string>(type: T) {
  return container.getNamed<ActionHandlerContract<T>>(Binding.Handler, type);
}

it('finds each handler in the container', () => {
  const types = [Name.CopyHandler];

  types.forEach(type => {
    const handler = getHandlerInstance(type);
    expect(handler.for).toBe(type);
  });
});

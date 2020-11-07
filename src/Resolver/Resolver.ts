import { ResolverContract, ResolverResultContract } from '@/Contracts/ResolverContract';
import { bus, resolveStarted } from '@/events';
import { injectable } from 'inversify';

@injectable()
export class Resolver implements ResolverContract {
  async resolve(resolvable?: string): Promise<ResolverResultContract> {
    bus.publish(resolveStarted({ resolvable }));

    return {
      success: false,
    };
  }
}

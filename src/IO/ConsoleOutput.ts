import { injectable } from 'inversify';
import { bus, resolveStarted } from '@/events';
import { OutputContract } from '@/Contracts/OutputContract';
import { logger } from '@poppinss/cliui';

@injectable()
export class ConsoleOutput implements OutputContract {
  async register(): Promise<void> {
    this.subscribe();
  }

  protected subscribe(): void {
    bus.subscribe(resolveStarted, ({ payload: { resolvable } }) => {
      logger.debug(`Resolving "${resolvable}"`);
    });
  }
}

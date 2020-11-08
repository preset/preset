import { bus, log } from './events';

class Logger {
  debug(content: any) {
    bus.publish(log({ level: 'debug', content }));
  }

  info(content: any) {
    bus.publish(log({ level: 'info', content }));
  }

  warning(content: any) {
    bus.publish(log({ level: 'warning', content }));
  }

  error(content: any) {
    bus.publish(log({ level: 'error', content }));
  }

  fatal(content: any) {
    bus.publish(log({ level: 'fatal', content }));
  }
}

export const logger = new Logger();

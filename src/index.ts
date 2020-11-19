import { logger } from '@poppinss/cliui';
import { CommandLineInterface, container } from '@/exports';

container
  .resolve(CommandLineInterface)
  .run(process.argv)
  .catch((error) => {
    logger.fatal('An uncaught error has occured. This should not happen, so feel free to report an issue.');
    logger.fatal(error);
    process.exitCode = 1;
  })
  .then((code) => (process.exitCode = code || 0));

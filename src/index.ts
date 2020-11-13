import { logger } from '@poppinss/cliui';
import { CommandLineInterface, container } from '@/exports';

container
  .resolve(CommandLineInterface)
  .run(process.argv)
  .catch((error) => {
    logger.fatal('An uncaught error has occured. This should not happen, so feel free to report an issue.');
    logger.fatal(error);
  });

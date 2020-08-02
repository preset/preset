import { CommandLineInterface } from '@/CommandLineInterface';
import { container } from '@/Container';

container //
  .resolve(CommandLineInterface)
  .run(process.argv)
  .catch(error => {
    console.error(`An uncaught error has occured. This should not happen, so feel free to report an issue.`);
    console.error({ error });
  });

import { CommandLineInterface } from '@/CommandLineInterface';
import { container } from '@/Container';
import { Log } from '@/Logger';

container //
  .resolve(CommandLineInterface)
  .run(process.argv.slice(2))
  .catch(error => {
    Log.fatal(`An error occured.`);
    Log.fatal(error);
  });

import { CommandLineInterface } from './CommandLineInterface';
import { container } from './Container';

container //
  .resolve(CommandLineInterface)
  .run(process.argv.slice(2))
  .catch(console.error); // TODO - Log

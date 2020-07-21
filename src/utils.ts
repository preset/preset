// import { Log, Color } from '@/Logger';
import { Text } from '@supportjs/text';
import spawn from 'cross-spawn';
import fs from 'fs-extra';
import path from 'path';

export async function installDependencies(targetDirectory: string): Promise<boolean> {
  const packageJson = path.join(targetDirectory, 'package.json');
  let packageManager = 'npm';

  if (!fs.pathExistsSync(packageJson)) {
    // Log.debug(`No dependency will be installed because there is no ${Color.file('package.json')} file.`);
    return false;
  }

  if (spawn.sync('yarn', ['--version']).status === 0) {
    // Log.debug(`${Color.keyword('yarn')} has been found. Using it.`);
    packageManager = 'yarn';
  }

  // Log.debug(`Spawning ${Color.keyword(packageManager)} into ${Color.directory(targetDirectory)}.`);

  const result = spawn.sync(packageManager, ['install'], {
    cwd: targetDirectory,
  });

  if (result.status !== 0) {
    // Log.debug(`It appears that the command has failed.`);
    // const trace = Text.make('Exit code: ')
    //   .append(result.status?.toString() ?? '0')
    //   .line(Color.error('Error output'))
    //   .line(result.stderr.toString())
    //   .line(Color.error('Standard output'))
    //   .line(result.stdout.toString());
    // Log.debug(trace.str());
  }

  return true;
}

import { injectable } from 'inversify';
import {
  ActionHandlerContract,
  ContextContract,
  InstallDependenciesActionContract,
  ecosystems,
  installationModes,
  InstallationMode,
  Ecosystem,
  ActionHandlingResult,
} from '@/Contracts';
import { contextualize, promiseFromProcess } from '@/Handlers';
import { Logger } from '@/Logger';
import fs from 'fs-extra';
import path from 'path';
import spawn from 'cross-spawn';

@injectable()
export class InstallDependenciesActionHandler implements ActionHandlerContract<'install-dependencies'> {
  for = 'install-dependencies' as const;

  async validate(
    action: Partial<InstallDependenciesActionContract>,
    context: ContextContract
  ): Promise<InstallDependenciesActionContract> {
    action = contextualize(action, context);

    if (!action.for) {
      throw Logger.throw(`No ecosystem specified`);
    }

    if (!action.mode) {
      Logger.info('No installation mode specified, defaulting to install.');
      action.mode = 'install';
    }

    if (!ecosystems.includes(action.for)) {
      throw Logger.throw(`Unknown ecosystem "${action.for}"`);
    }

    if (!installationModes.includes(action.mode)) {
      throw Logger.throw(`Unknown installation mode "${action.for}"`);
    }

    return <InstallDependenciesActionContract>{
      ...action,
      type: 'install-dependencies',
    };
  }

  async handle(action: InstallDependenciesActionContract, context: ContextContract): Promise<ActionHandlingResult> {
    try {
      if (action.ask) {
        Logger.info('Kindly asking the user if they want to install dependencies.');
        const response = await context.task.prompt({
          type: 'Toggle',
          message: `Do you want to ${action.mode} your ${action.for} dependencies?`,
          initial: false,
        });

        if (!response) {
          Logger.info('User decided not to install dependencies.');
          return {
            success: true,
            reason: 'Skipped installation',
          };
        }
      }

      const installs: { [key in Ecosystem]: Function } = {
        node: this.node,
        php: this.php,
      };

      return installs[action.for].call(this, action.mode, context);
    } catch (error) {
      throw Logger.throw('Custom action failed', error);
    }
  }

  async php(mode: InstallationMode, { targetDirectory }: ContextContract): Promise<ActionHandlingResult> {
    Logger.info(`Installing PHP dependencies.`);

    const composerJson = path.join(targetDirectory, 'composer.json');

    if (!fs.pathExistsSync(composerJson)) {
      Logger.info(`composer.json could not be found. Stopping.`);

      return {
        success: false,
        reason: 'No composer.json file',
      };
    }

    const parameters: string[] = [mode];
    const packageManager = 'composer';

    Logger.info(`Running: ${packageManager} ${parameters.join(' ')}`);

    const process = spawn(packageManager, parameters, {
      cwd: targetDirectory,
    });

    return promiseFromProcess(process);
  }

  async node(mode: InstallationMode, { targetDirectory }: ContextContract): Promise<ActionHandlingResult> {
    Logger.info(`Installing Node dependencies.`);

    const packageJson = path.join(targetDirectory, 'package.json');
    let packageManager = 'npm';

    if (!fs.pathExistsSync(packageJson)) {
      Logger.info(`package.json could not be found. Stopping.`);

      return {
        success: false,
        reason: 'No package.json file',
      };
    }

    if (spawn.sync('yarn', ['--version']).status === 0) {
      Logger.info(`${'yarn'} has been found. Using it.`);
      packageManager = 'yarn';
    }

    Logger.info(`Spawning ${packageManager} into ${targetDirectory}.`);

    const parameters = ['--verbose'];

    if (mode === 'install') {
      parameters.push('install');
    }

    if (packageManager === 'yarn' && mode === 'update') {
      parameters.push('upgrade');
    }

    if (packageManager === 'npm' && mode === 'update') {
      parameters.push('update');
    }

    Logger.info(`Running: ${packageManager} ${parameters.join(' ')}`);

    const process = spawn(packageManager, parameters, {
      cwd: targetDirectory,
    });

    return promiseFromProcess(process);
  }
}

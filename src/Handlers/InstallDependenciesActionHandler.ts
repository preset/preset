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
import { Logger } from '@/Logger';
import { Text } from '@supportjs/text';
import fs from 'fs-extra';
import path from 'path';
import spawn from 'cross-spawn';
import { ChildProcess } from 'child_process';

@injectable()
export class InstallDependenciesActionHandler implements ActionHandlerContract<'install-dependencies'> {
  for = 'install-dependencies' as const;

  async validate(action: Partial<InstallDependenciesActionContract>): Promise<InstallDependenciesActionContract> {
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

    return this.promiseFromProcess(process);
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

    return this.promiseFromProcess(process);
  }

  protected promiseFromProcess(process: ChildProcess): Promise<ActionHandlingResult> {
    return new Promise((resolve, reject) => {
      process.stdout!.on('data', message => {
        Logger.info(Text.make(message).beforeLast('\n').str());
      });

      process.stderr!.on('data', message => {
        Logger.info(Text.make(message).beforeLast('\n').str());
      });

      process.on('error', error => {
        Logger.error(error);
        reject(error);
      });

      process.on('close', code => {
        Logger.info(`Command terminated with code ${code}`);
        resolve({ success: code === 0 });
      });
    });
  }
}

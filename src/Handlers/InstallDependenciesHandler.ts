import path from 'path';
import fs from 'fs-extra';
import { injectable, inject } from 'inversify';
import {
  ApplierOptionsContract,
  Binding,
  Bus,
  color,
  Contextualized,
  Ecosystem,
  execute,
  ExecutionError,
  HandlerContract,
  InstallDependencies,
  Name,
  PromptContract,
} from '@/exports';

interface PackageManager {
  bin: string;
  lockFile: string;
  args: string[];
  check: [string, string[]];
}

@injectable()
export class InstallDependenciesHandler implements HandlerContract {
  public name = Name.Handler.InstallDependencies;

  @inject(Binding.Bus)
  protected bus!: Bus;

  @inject(Binding.Prompt)
  protected prompt!: PromptContract;

  protected applierOptions!: ApplierOptionsContract;

  protected ecosystems: Record<Ecosystem, Function> = {
    node: this.installNodeDependencies,
    php: this.installPhpDependencies,
  };

  protected nodePackageManagers: PackageManager[] = [
    {
      bin: 'yarn',
      lockFile: 'yarn.lock',
      args: ['install'],
      check: ['yarn', ['-v']],
    },
    {
      bin: 'npm',
      lockFile: 'package-lock.json',
      args: ['install'],
      check: ['npm', ['-v']],
    },
  ];

  async handle(action: Contextualized<InstallDependencies>, applierOptions: ApplierOptionsContract): Promise<void> {
    if (!Object.keys(this.ecosystems).includes(action.ecosystem)) {
      throw new ExecutionError() //
        .withMessage(`Unsupported ecosystem ${color.magenta(action.ecosystem)}.`)
        .withoutStack()
        .stopsExecution();
    }

    // Asks the user before installing dependencies, except if
    // the preset is running in non-interactive mode.
    if (action.shouldAsk && action.preset.isInteractive()) {
      const shouldInstall = await this.prompt.toggle(
        `Do you want to update your ${color.magenta(action.ecosystem)} dependencies?`,
        ['yes', 'no'],
        { default: true },
      );

      if (!shouldInstall) {
        this.bus.debug(`User chose not to install their ${color.magenta(action.ecosystem)} dependencies.`);
        return;
      }
    }

    this.applierOptions = applierOptions;

    try {
      await this.ecosystems[action.ecosystem].call(this);
    } catch (error) {
      if (error instanceof ExecutionError) {
        throw error;
      }

      throw new ExecutionError() //
        .withMessage(`Could not install dependencies for the ${color.magenta(action.ecosystem)} ecosystem.`)
        .withCompleteStack(error)
        .stopsExecution();
    }
  }

  /**
   * Installs the dependencies with the correct package manager.
   */
  protected async installNodeDependencies(): Promise<void> {
    const managers: PackageManager[] = [];

    // Filters the available managers.
    for (const manager of this.nodePackageManagers) {
      try {
        if (await execute(this.applierOptions.target, ...manager.check)) {
          managers.push(manager);
        }
      } catch {
        this.bus.debug(`${color.magenta(manager.bin)} is not available.`);
      }
    }

    // Checks if at least one package manager is installed.
    if (managers.length === 0) {
      throw new ExecutionError() //
        .withMessage(`Please install one of the following package managers: ${this.nodePackageManagers.map(({ bin }) => bin).join(', ')}.`)
        .withoutStack()
        .stopsExecution();
    }

    // Loops through the installed managers's lockfile and
    // use the corresponding manager if found
    for (const { bin, args, lockFile } of managers) {
      if (fs.pathExistsSync(path.join(this.applierOptions.target, lockFile))) {
        await execute(this.applierOptions.target, bin, args);
        return;
      }
    }

    // If no lockfile was found, install the dependencies with the first
    // manager of the list, which is ordered by likeliness or preference.
    const { bin, args } = managers.shift()!;
    await execute(this.applierOptions.target, bin, args);
  }

  /**
   * Installs the dependencies for the PHP ecosystem, which is simpler because
   * there is only one package manager.
   */
  protected async installPhpDependencies(): Promise<void> {
    const hasComposer = await execute(this.applierOptions.target, 'composer', ['--version']).catch(() => false);
    if (!hasComposer) {
      throw new ExecutionError() //
        .withMessage(`Can not install dependencies because ${color.magenta('composer')} is not available.`)
        .withoutStack();
    }

    await execute(this.applierOptions.target, 'composer', ['update', '-vv']);
  }
}

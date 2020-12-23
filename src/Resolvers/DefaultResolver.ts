import { inject, injectable } from 'inversify';
import git from 'simple-git';
import path from 'path';
import tmp from 'tmp';
import fs from 'fs-extra';
import {
  Binding,
  Bus,
  color,
  container,
  Name,
  ResolutionError,
  ResolverContract,
  ResolverOptions,
  PresetLocation,
  RepositoryPreset,
  LocatedPreset,
} from '@/exports';
import { LocatorContract } from '@/Contracts';

@injectable()
export class DefaultResolver implements ResolverContract {
  @inject(Binding.Bus)
  protected bus!: Bus;

  async resolve(resolvable: string, options: ResolverOptions): Promise<PresetLocation> {
    this.bus.debug(`Resolving ${color.magenta(resolvable)}.`);

    const locators = [
      container.getNamed<LocatorContract>(Binding.Locator, Name.DiskLocator),
      container.getNamed<LocatorContract>(Binding.Locator, Name.GitLocator),
    ];

    for (const locator of locators) {
      this.bus.debug(`Trying the ${locator.name!} locator...`);

      try {
        return await locator.locate(resolvable).then((preset) => this.persist(preset, options));
      } catch (error) {
        if (error.fatal) {
          throw error;
        }

        this.bus.debug(color.gray(`The ${locator.name!} locator could not locate ${resolvable}.`));
      }
    }

    throw ResolutionError.resolutionFailed(resolvable);
  }

  /**
   * Persists the resolved preset to the disk if needed.
   */
  async persist(preset: LocatedPreset, options: ResolverOptions): Promise<PresetLocation> {
    // Local presets are not temporary
    if (preset.type === 'local') {
      this.ensureSubdirectoryExists(preset.path, options.path, false);

      return {
        path: path.join(preset.path, options.path ?? ''),
        temporary: false,
      };
    }

    // Remote git-hosted presets
    if (preset.type === 'repository') {
      const absoluteLocalPath = await this.clone(preset, options);
      this.ensureSubdirectoryExists(absoluteLocalPath, options.path, true);

      return {
        path: path.join(absoluteLocalPath, options.path ?? ''),
        temporary: true,
      };
    }

    throw new ResolutionError() //
      .stopsExecution()
      .withMessage(`An unknown error occured while resolving the preset.`);
  }

  /**
   * Clones a repository from Git.
   */
  private async clone(preset: RepositoryPreset, options: ResolverOptions): Promise<string> {
    try {
      const cloneWithSsh = options.ssh === undefined ? preset.ssh : options.ssh;
      const temporary = tmp.dirSync();
      const repositoryUrl = cloneWithSsh
        ? `git@github.com:${preset.organization}/${preset.repository}.git`
        : `https://github.com/${preset.organization}/${preset.repository}`;

      this.bus.info(`Cloning ${color.magenta(repositoryUrl)}.`);

      // Clones the repository
      await git()
        .clone(repositoryUrl, temporary.name, {
          // '--depth': 1,
          ...(preset.tag && { '--branch': preset.tag }),
        })
        .then(() => this.bus.debug(`Cloned ${color.magenta(repositoryUrl)} into ${color.underline(temporary.name)}.`));

      return temporary.name;
    } catch (error) {
      // Forward the resolution error if purposely thrown.
      if (error instanceof ResolutionError) {
        throw error;
      }

      // Throw a fatal resolution error if the clone failed.
      throw ResolutionError.cloneFailed(preset, error);
    }
  }

  /**
   * Ensures that the subdirectory given by the user exists in the resolved preset directory.
   */
  private ensureSubdirectoryExists(originalPath: string, subdirectory: string | undefined, temporary: boolean): void {
    if (!subdirectory) {
      return;
    }

    const fullPath = path.join(originalPath, subdirectory ?? '');

    if (!fs.pathExistsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
      if (temporary) {
        try {
          this.bus.debug(`Deleting temporary directory at ${color.underline(originalPath)}...`);
          fs.emptyDirSync(originalPath);
          fs.rmdirSync(originalPath);
        } catch (error) {
          this.bus.warning('Could not remove temporary directory.');
          this.bus.fatal(error);
        }
      }

      throw ResolutionError.subdirectoryNotFound(subdirectory, originalPath);
    }
  }
}

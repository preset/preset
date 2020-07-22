import { BaseActionContract } from './ActionContract';

/**
 * Install the dependencies for the selected ecosystem.
 */
export interface InstallDependenciesActionContract extends BaseActionContract<'install-dependencies'> {
  /**
   * The ecosystem against which to install the dependencies.
   */
  for: Ecosystem;

  /**
   * Whether to install or update the dependencies.
   */
  mode: InstallationMode;
}

export const ecosystems = ['node', 'php'] as const;
export type Ecosystem = typeof ecosystems[number];

export const installationModes = ['install', 'update'] as const;
export type InstallationMode = typeof installationModes[number];

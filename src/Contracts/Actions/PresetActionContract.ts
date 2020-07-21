import { BaseActionContract } from './ActionContract';

/**
 * Installs the given preset.
 */
export interface PresetActionContract extends BaseActionContract<'preset'> {
  /**
   * Any string that can be resolved to a preset.
   */
  preset: string;

  /**
   * Arguments to pass to the preset.
   */
  arguments?: string | string[];

  /**
   * Inherits current command line arguments.
   */
  inherit?: boolean;
}

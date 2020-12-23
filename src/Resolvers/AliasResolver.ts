import { Binding, Bus, ResolverOptions, color } from '@/exports';
import { ExecutionError } from '@/Errors/ExecutionError';
import { inject, injectable } from 'inversify';
import { cosmiconfig } from 'cosmiconfig';

interface ResolvableAndOptions {
  resolvable: string;
  options: ResolverOptions;
}

type AdvancedPresetAlias = ResolverOptions & { preset: string };
type NestedAlias = {
  [namespaceOrAlias: string]: string | AdvancedPresetAlias;
};

interface FileConfiguration {
  [namespaceOrAlias: string]: string | NestedAlias;
}

interface OrganizationMapping {
  type: 'namespace';

  /**
   * The content before colons in the user-given resolvable string.
   */
  alias: string;

  /**
   * Actual organization.
   */
  organization: string;
}

interface PresetMapping {
  type: 'preset';
  path?: string;
  ssh?: boolean;

  /**
   * What the user-given resolvable should be.
   */
  alias: string;

  /**
   * The actual resolvable.
   */
  preset: string;
}

type ResolutionMapping = Array<OrganizationMapping | PresetMapping>;

@injectable()
export class AliasResolver {
  protected configuration: ResolutionMapping = [{ type: 'namespace', organization: 'laravel-presets', alias: 'laravel' }];

  @inject(Binding.Bus)
  protected bus!: Bus;

  @inject(Binding.AliasResolverPath)
  public path!: string;

  public async resolve(resolvable: string, options: ResolverOptions): Promise<ResolvableAndOptions> {
    const configuration = await this.readConfiguration();

    const namespace = resolvable.split(':')?.shift();
    const repository = resolvable.split(':')?.pop();

    // prettier-ignore
    const aliases = [
			...await this.parseResolutionMapping(configuration),
			...this.configuration,
		]

    this.bus.debug(`Resolving ${color.magenta(aliases.length.toString())} alias(es) for ${color.magenta(resolvable)}.`);

    for (const entry of aliases) {
      // Matches actual aliases
      if (entry.type === 'preset' && entry.alias === resolvable) {
        this.bus.debug(`Found alias ${color.magenta(entry.alias)} targetting ${color.magenta(entry.preset)}.`);

        return {
          resolvable: entry.preset,
          options: {
            path: options.path ?? entry.path,
            ssh: options.ssh ?? entry.ssh,
          },
        };
      }

      // Replaces namespace aliases
      if (entry.type === 'namespace' && entry.alias === namespace) {
        this.bus.debug(`Found namespace alias ${color.magenta(entry.alias)} targetting organization ${color.magenta(entry.organization)}.`);

        return {
          resolvable: `${entry.organization}/${repository}`,
          options,
        };
      }
    }

    return {
      resolvable,
      options,
    };
  }

  /**
   * Parses the configuration file.
   */
  protected async parseResolutionMapping(configuration?: FileConfiguration): Promise<ResolutionMapping> {
    if (!configuration) {
      return [];
    }

    const mapping: ResolutionMapping = [];

    Object.entries(configuration).forEach(([namespace, value]) => {
      // If the value is a single string, this item is a namespace alias
      if (typeof value === 'string') {
        mapping.push({
          type: 'namespace',
          alias: namespace,
          organization: value,
        });

        return;
      }

      // If the value is an object, there is a namespace nesting
      if (typeof value === 'object') {
        Object.entries(value).forEach(([alias, value]) => {
          // If the value is a single string, this item is a simple preset alias
          if (typeof value === 'string') {
            mapping.push({
              type: 'preset',
              alias: `${namespace}:${alias}`,
              preset: value,
            });

            return;
          }

          // If the value is an object, this item is an advanced preset alias
          if (typeof value !== 'string') {
            mapping.push({
              type: 'preset',
              alias: `${namespace}:${alias}`,
              preset: value.preset,
              path: value.path,
              ssh: value.ssh,
            });

            return;
          }

          throw new ExecutionError() //
            .withMessage(`Global configuration file is invalid.`)
            .recoverable();
        });

        return;
      }

      throw new ExecutionError() //
        .withMessage(`Global configuration file is invalid.`)
        .recoverable();
    });

    return mapping;
  }

  /**
   * Reads the configuration file.
   */
  protected async readConfiguration(): Promise<FileConfiguration | undefined> {
    const resolver = cosmiconfig('preset');
    const configuration = await resolver.search(this.path).catch(() => null);

    if (configuration?.isEmpty || !configuration) {
      this.bus.debug('No global configuration file found.');
      return;
    }

    this.bus.debug(`Configuration file found at ${color.underline(configuration?.filepath!)}.`);

    return configuration?.config;
  }
}

import { Action, ContextAware, Name } from '@/exports';

/**
 * An action for editing a JSON file.
 */
export class EditJson extends Action {
  public handler = Name.Handler.EditJson;
  public name = 'JSON file edition';
  public title = 'Updating JSON file...';
  public file?: ContextAware<string>;
  public json: ContextAware<any> = {};
  public pathsToDelete: ContextAware<string | string[]>[] = [];

  /**
   * Sets the path to the file that will be edited.
   */
  setFile(file: ContextAware<string | 'package.json' | 'composer.json'>): this {
    this.file = file;
    return this;
  }

  /**
   * Deeply merges the given content into the JSON file.
   */
  merge(json: ContextAware<any> = {}): this {
    this.json = json;
    return this;
  }

  /**
   * Deletes the given paths from the JSON file.
   */
  delete(paths: ContextAware<string | string[]>): this {
    this.pathsToDelete.push(paths);
    return this;
  }
}

export class EditNodePackages extends EditJson {
  /**
   * Removes the given dependency from the dependency lists.
   */
  remove(dependency: string): this {
    this.pathsToDelete.push([`devDependencies.${dependency}`, `peerDependencies.${dependency}`, `dependencies.${dependency}`]);
    return this;
  }

  /**
   * Sets a property path of the package.json file.
   *
   * @example
   * Preset.editNodePackage()
   *   .set('author', 'Enzo Innocenzi')
   */
  set(key: string, value: string): this {
    this.json[key] = value;
    return this;
  }

  /**
   * Adds a dependency.
   *
   * @param dependency The package name.
   * @param version The package version.
   */
  add(dependency: string, version: string): this {
    this.json.dependencies = {
      ...this.json.dependencies,
      [dependency]: version,
    };

    return this;
  }

  /**
   * Adds a peer dependency.
   *
   * @param dependency The package name.
   * @param version The package version.
   */
  addPeer(dependency: string, version: string): this {
    this.json.peerDependencies = {
      ...this.json.peerDependencies,
      [dependency]: version,
    };

    return this;
  }

  /**
   * Adds a dev dependency.
   *
   * @param dependency The package name.
   * @param version The package version.
   */
  addDev(dependency: string, version: string): this {
    this.json.devDependencies = {
      ...this.json.devDependencies,
      [dependency]: version,
    };

    return this;
  }
}

export class EditPhpPackages extends EditJson {
  /**
   * Removes the given dependency from the dependency lists.
   */
  remove(dependency: string): this {
    this.pathsToDelete.push([`require.${dependency}`, `require-dev.${dependency}`]);
    return this;
  }

  /**
   * Sets a property path of the package.json file.
   *
   * @example
   * Preset.editNodePackage()
   *   .set('author', 'Enzo Innocenzi')
   */
  set(key: string, value: string): this {
    this.json[key] = value;
    return this;
  }

  /**
   * Adds a dependency.
   *
   * @param dependency The package name.
   * @param version The package version.
   */
  add(dependency: string, version: string): this {
    this.json.require = {
      ...this.json.require,
      [dependency]: version,
    };

    return this;
  }

  /**
   * Adds a dev dependency.
   *
   * @param dependency The package name.
   * @param version The package version.
   */
  addDev(dependency: string, version: string): this {
    this.json['require-dev'] = {
      ...this.json['require-dev'],
      [dependency]: version,
    };

    return this;
  }
}

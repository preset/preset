import { injectable } from 'inversify';
import { Text } from '@supportjs/text';
import { ResolverContract, ResolverResultContract } from '@/Contracts';
// import { Log, Color } from '@/Logger';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';
import { Name } from '@/Container';

/**
 * A resolver that downloads a Gist and returns its local, temporary path.
 */
@injectable()
export class GithubGistResolver implements ResolverContract {
  public readonly name: string = Name.GithubGistResolver;

  async resolve(input: string): Promise<ResolverResultContract> {
    const [matches, gistId] = /(?:https:\/\/)(?:gist|api)\.github\.com\/[\w-]+\/([\w-]+)/.exec(input) ?? [];

    if (!matches) {
      return {
        success: false,
      };
    }

    return await this.clone(gistId);
  }

  private getGistUrl(gistId: string): string {
    return `https://api.github.com/gists/${gistId}`;
  }

  private async clone(gistId: string): Promise<ResolverResultContract> {
    try {
      // Log.debug(`Fetching the Github Gist ${Color.keyword(gistId)}.`);

      const response = await fetch(this.getGistUrl(gistId));

      if (!response.ok) {
        // Log.warn(`Could not clone Gist ${Color.keyword(gistId)}.`);
        return {
          success: false,
        };
      }

      // Converts the received data to a workable object
      const json = await response.json();
      const files = Object.values<any>(json?.files).map(({ filename, content }) => ({ filename, content }));
      const hasPackage = files.some(({ filename }) => filename === 'package.json');

      // Add a package.json if there is none
      // Log.debug(`That Gist had no ${Color.keyword('package.json')}. Made an empty one.`);
      if (!hasPackage) {
        files.push({
          filename: 'package.json',
          content: '{}',
        });
      }

      // Write everything in a temporary folder
      const temporary = tmp.dirSync();
      // Log.debug(`Created ${Color.directory(temporary.name)} to write the preset files into.`);
      files.forEach(({ filename, content }) => {
        const file = path.join(temporary.name, filename);
        // Log.debug(`Writing ${Color.file(Text.make(file).afterLast('\\').afterLast('/'))}.`);
        fs.writeFileSync(file, content);
      });

      return {
        success: true,
        path: temporary.name,
        temporary: true,
      };
    } catch (error) {
      // Log.debug(`Could not clone Gist ${Color.keyword(gistId)}.`);
      // Log.fatal(error);

      return {
        success: false,
      };
    }
  }
}

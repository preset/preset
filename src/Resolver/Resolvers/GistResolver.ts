import { Log, Color, ResolverContract, ResolverResultContract } from '../..';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import tmp from 'tmp';

export class GistResolver implements ResolverContract {
  async resolve(input: string): Promise<ResolverResultContract> {
    const [matches, user, gistId] = input.match(/^https:\/\/gist\.github\.com\/([\w-]+)\/([\w-]+)/) ?? [];

    if (!matches || !user || !gistId) {
      return {
        success: false,
      };
    }

    return await this.clone(user, gistId);
  }

  private async clone(user: string, gistId: string): Promise<ResolverResultContract> {
    try {
      // Gets the gist from the Github API
      Log.debug(`Fetching Gist of ID ${Color.keyword(gistId)}.`);
      const response = await fetch(`https://api.github.com/gists/${gistId}`);
      const json = await response.json();

      // Convert the response to a workable object
      const files = Object.values<any>(json?.files).map(({ filename, content }) => ({ filename, content }));
      const hasPackage = files.some(({ filename }) => filename === 'package.json');

      // Add a package.json if there is none
      Log.debug(`That Gist had no ${Color.keyword('package.json')}. Made an empty one.`);
      if (!hasPackage) {
        files.push({
          filename: 'package.json',
          content: '{}',
        });
      }

      // Write everything in a temporary folder
      const temporary = tmp.dirSync();
      Log.debug(`Created ${Color.directory(temporary.name)} to write file into.`);
      files.forEach(({ filename, content }) => {
        const file = path.join(temporary.name, filename);
        Log.debug(`Writing ${Color.file(file)}.`);
        fs.writeFileSync(file, content);
      });

      return {
        success: true,
        path: temporary.name,
        temporary: true,
      };
    } catch (error) {
      Log.debug(`Could not clone Gist ${Color.keyword(gistId)}.`);
      return {
        success: false,
      };
    }
  }
}

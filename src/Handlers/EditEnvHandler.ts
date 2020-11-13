import path from 'path';
import fs from 'fs-extra';
import { parse } from 'envfile';
import { inject, injectable } from 'inversify';
import { ApplierOptionsContract, Binding, Bus, color, Contextualized, EditEnv, HandlerContract, Name } from '@/exports';

@injectable()
export class EditEnvHandler implements HandlerContract {
  public name = Name.Handler.EditEnv;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: Contextualized<EditEnv>, applierOptions: ApplierOptionsContract): Promise<void> {
    const environmentFilePath = path.join(applierOptions.target, action.file);

    // Either skips or creates it if missing depending on the action configuration.
    if (!fs.existsSync(environmentFilePath) && !action.shouldCreate) {
      this.bus.debug(`${color.magenta(action.file)} does not exist. Skipping.`);
      return;
    }
    fs.ensureFileSync(environmentFilePath);

    // Parses the content of the environment file.
    let contents = fs.readFileSync(environmentFilePath, { encoding: 'utf-8' });
    const environment: Record<string, string> = parse(contents);

    // Adds the user-defined keys to the environement object.
    for (let [key, value] of action.setters) {
      if (typeof value !== 'string') {
        value = value(environment);
      }

      environment[key] = value;
    }

    const missing: string[] = [];
    for (const [key, value] of Object.entries(environment)) {
      // Checks if the base file has the current key.
      // If not, add it to the missing array so we can append it later.
      if (!contents.match(new RegExp(`${key} ?=`))) {
        missing.push(key);
        continue;
      }

      // Replaces the key in the file contents with the new value.
      contents = contents.replace(new RegExp(`${key} ?=.*`, 'gi'), `${key}=${String(value)}`);
    }

    // Adds the missing values.
    missing.forEach((key) => {
      contents += `\n${key}=${String(environment[key])}`;
    });

    // Writes back to the file.
    this.bus.debug(`Writing environment to ${color.magenta(action.file)}.`);
    this.bus.debug(`Content: ${color.gray(JSON.stringify(environment))}`);
    fs.writeFileSync(environmentFilePath, contents, {
      encoding: 'utf-8',
    });
  }
}

import { HandlerContract } from '@/Contracts/HandlerContract';
import { ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { Extract } from '@/Configuration/Actions';
import { inject, injectable } from 'inversify';
import { Binding, Name } from '@/Container';
import { ExecutionError } from '@/Errors';
import { color } from '@/utils';
import { Bus } from '@/bus';
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';

@injectable()
export class ExtractHandler implements HandlerContract {
  public name = Name.Handler.Extract;

  @inject(Binding.Bus)
  protected bus!: Bus;

  protected action!: Extract;
  protected applierOptions!: ApplierOptionsContract;

  async handle(action: Extract, applierOptions: ApplierOptionsContract): Promise<void> {
    if (!Array.isArray(action.input)) {
      action.input = [action.input as string];
    }

    this.action = action;
    this.applierOptions = applierOptions;

    for (const relativeTemplateOrGlob of action.input) {
      await this.extract(relativeTemplateOrGlob, action.target as string);
    }
  }

  /**
   * Extracts the given input to the given relative target.
   */
  protected async extract(relativeTemplateOrGlob: string, relativeTarget: string): Promise<void> {
    const templateBase = path.join(this.action.preset.presetDirectory, this.action.preset.templateDirectory);
    const templatePath = path.join(templateBase, relativeTemplateOrGlob);
    const targetBase = this.applierOptions.target;
    const targetPath = path.join(targetBase, relativeTarget);

    // If the input is a directory but the target is a file,
    // we cannot perform a copy.
    if (this.isDirectory(templatePath) && this.isFile(targetPath)) {
      throw new ExecutionError() //
        .withMessage('A directory can not be extracted to a file.')
        .stopsExecution();
    }

    // If both the input and target are files, we can call the
    // copyFile method on them.
    if (this.isFile(templatePath) && this.isFile(targetPath)) {
      this.copyFile(templatePath, targetPath);
      return;
    }

    // If the input is a file, we assume the target is a directory.
    if (this.isFile(templatePath)) {
      this.copyFile(templatePath, path.join(targetPath, this.renameDotFile(relativeTemplateOrGlob)));
      return;
    }

    // If the input is a directory, we assume that the target is as well.
    if (this.isDirectory(templatePath)) {
      await this.extractDirectory(relativeTemplateOrGlob, relativeTarget);
      return;
    }

    // Lastly, assume the relative template is a glob.
    await this.extractDirectory('', relativeTarget, relativeTemplateOrGlob);
  }

  /**
   * Extracts the files in the given directory to the given target-relative directory.
   */
  protected async extractDirectory(relativeInputDirectory: string, relativeTargetDirectory: string, glob?: string): Promise<void> {
    this.bus.debug(
      `Extracting templates in ${color.magenta(`/${relativeInputDirectory}`)} to ${color.magenta(`/${relativeTargetDirectory}`)}.`,
    );

    const entries = await fg(glob ?? '**/**', {
      dot: false, // TODO - Make this optional?
      cwd: path.join(this.action.preset.templateDirectory, relativeInputDirectory),
    });

    for (const relativeFilePath of entries) {
      const targetDirectory = path.join(this.applierOptions.target, relativeTargetDirectory);
      fs.ensureDirSync(targetDirectory);

      this.extractTemplateFile(relativeFilePath, relativeInputDirectory, targetDirectory);
    }
  }

  /**
   * Copies the given relative file to the given target directory.
   */
  protected extractTemplateFile(relativeFilePath: string, relativeInputDirectory: string, targetDirectory: string): void {
    const targetFile = path.join(targetDirectory, this.renameDotFile(relativeFilePath));
    const inputFile = path.join(
      this.action.preset.presetDirectory,
      this.action.preset.templateDirectory,
      relativeInputDirectory,
      relativeFilePath,
    );

    this.copyFile(inputFile, targetFile);
  }

  /**
   * Copies the input file to the target file. Both are absolute paths.
   */
  protected copyFile(inputFile: string, targetFile: string): void {
    if (fs.pathExistsSync(targetFile)) {
      this.bus.warning('TODO: implement strategy');
      // handle conflict
    }

    this.bus.debug(`Copying ${color.magenta(inputFile)} to ${color.magenta(targetFile)}.`);
    fs.copySync(inputFile, targetFile);
  }

  /**
   * Renames a file.dotfile file into .file.
   */
  protected renameDotFile(input: string): string {
    if (input.endsWith('.dotfile')) {
      return `.${input.replace('.dotfile', '')}`;
    }

    return input;
  }

  /**
   * Checks if the input is a file.
   */
  protected isFile(input: string): boolean {
    return fs.existsSync(input) && fs.statSync(input).isFile();
  }

  /**
   * Checks if the input is a directory.
   */
  protected isDirectory(input: string): boolean {
    return fs.existsSync(input) && fs.statSync(input).isDirectory();
  }
}

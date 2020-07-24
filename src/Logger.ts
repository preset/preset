import fs from 'fs-extra';
import tmp from 'tmp';
import path from 'path';

enum Level {
  info = 'info',
  warning = 'warning',
  fatal = 'fatal',
}

interface LoggerEntry {
  datetime: Date;
  level: Level;
  message: string;
}

export class SLogger {
  public history: LoggerEntry[] = [];

  protected archive(level: Level, message: string): void {
    this.history.push({
      datetime: new Date(),
      level,
      message,
    });
  }

  public dump(): void {
    this.history
      .filter(({ message }) => message.length > 0)
      .forEach(({ level, message }) => {
        console.log(`[${level}] ${message}`);
      });
  }

  public saveToFile(json: boolean = false): string {
    try {
      const name = `preset-${new Date().toISOString().slice(0, 10)}-${Date.now()}.log`;
      const temporaryFile = tmp.fileSync({ name });
      const content = this.history
        .filter(({ message }) => message.length > 0)
        .map(({ datetime, level, message }) =>
          json
            ? {
                datetime: datetime.toISOString(),
                level: level.toString(),
                message: message,
              }
            : `[${datetime.toISOString()} / ${level}] ${message}`
        );

      fs.writeFileSync(path.join(temporaryFile.name), content.join('\n'));
      return temporaryFile.name;
    } catch (error) {
      throw this.throw('Could not save log file.', error);
    }
  }

  public cli(message: string): void {
    this.archive(Level.warning, message);
    console.log(message);
  }

  public warn(message: string): void {
    this.archive(Level.warning, message);
  }

  public info(message: string): void {
    this.archive(Level.info, message);
  }

  public error(message: string | Error): void {
    this.archive(Level.fatal, message.toString());
  }

  public throw(message: string, error?: string | Error): never {
    this.archive(Level.fatal, message);

    if (error) {
      this.archive(Level.fatal, error.toString());
    }

    throw new Error(message);
  }
}

export const Logger = new SLogger();

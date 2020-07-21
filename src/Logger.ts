import fs from 'fs-extra';

enum Level {
  info = 'info',
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

  public saveToFile(json: boolean = false): void {
    try {
      const content = this.history.map(({ datetime, level, message }) =>
        json
          ? {
              datetime: datetime.toISOString(),
              level: level.toString(),
              message: message,
            }
          : `[${datetime.toISOString()} / ${level}] ${message}`
      );

      fs.writeFileSync(`preset-logs-${Date.now()}.log`, content.join('\n'));
    } catch (error) {
      console.error(error);
    }
  }

  public info(message: string): void {
    this.archive(Level.info, message);
  }

  public error(message: string | Error): void {
    this.archive(Level.info, message.toString());
  }
}

export const Logger = new SLogger();

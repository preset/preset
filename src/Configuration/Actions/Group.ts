import { Action, Name, PresetAware } from '@/exports';

export class Group<Context = any> extends Action {
  public handler = Name.Handler.Group;
  public name = 'grouped action';
  public title = 'Performing a group action...';
  public actions?: {
    callback: PresetAware<void, Context>;
  };

  /**
   * Chains the actions in the callback.
   * Note that it won't work if you use the global `Preset` object. You need to use the callback's parameter.
   *
   * @example
   * Preset.group((preset) => {
   * 	preset.setEnv('APP_NAME', ({ APP_NAME }) => APP_NAME ?? 'Laravel')
   * 	preset.setEnv('APP_URL', ({ APP_NAME }) => `https://${APP_NAME.toLowerCase()}.test`)
   * }).withTitle('Setting up environment')
   */
  chain(callback?: PresetAware<void, Context>): Group<Context> {
    if (callback) {
      this.actions = { callback };
    }

    return this;
  }
}

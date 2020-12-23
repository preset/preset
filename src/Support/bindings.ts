export const Binding = {
  Applier: Symbol.for('applier'),
  Resolver: Symbol.for('resolver'),
  Locator: Symbol.for('locator'),
  Importer: Symbol.for('importer'),
  Handler: Symbol.for('handler'),
  Output: Symbol.for('output'),
  Bus: Symbol.for('bus'),
  Prompt: Symbol.for('prompt'),
  Preset: Symbol.for('preset'),
};

export const Name = {
  DefaultResolver: 'resolver',
  DiskLocator: 'disk-locator',
  GitLocator: 'git-locator',

  Handler: {
    ApplyPreset: 'apply-preset-handler',
    Extract: 'extract-handler',
    Execute: 'execute-command-handler',
    InstallDependencies: 'install-dependencies-handler',
    Prompt: 'prompt-handler',
    Delete: 'delete-handler',
    EditJson: 'edit-json-handler',
    EditEnv: 'edit-env-handler',
    Edit: 'edit-handler',
    Group: 'group-handler',
    Hook: 'hook-handler',
  } as const,
};

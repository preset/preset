export const Binding = {
  Applier: Symbol.for('applier'),
  Resolver: Symbol.for('resolver'),
  Importer: Symbol.for('importer'),
  Handler: Symbol.for('handler'),
  Output: Symbol.for('output'),
  Bus: Symbol.for('bus'),
  Prompt: Symbol.for('prompt'),
  Preset: Symbol.for('preset'),
};

export const Name = {
  Resolver: 'resolver',
  LocalResolver: 'local-resolver',
  CommunityResolver: 'community-resolver',
  GitHubResolver: 'github-resolver',

  Handler: {
    ApplyPreset: 'apply-preset-handler',
    Extract: 'extract-handler',
    Execute: 'execute-command-handler',
    InstallDependencies: 'install-dependencies-handler',
    Prompt: 'prompt-handler',
    Delete: 'delete-handler',
    EditJson: 'edit-json-handler',
    EditEnv: 'edit-env-handler',
  } as const,
};

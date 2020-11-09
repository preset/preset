export const Binding = {
  Applier: Symbol.for('applier'),
  Resolver: Symbol.for('resolver'),
  Importer: Symbol.for('importer'),
  Handler: Symbol.for('handler'),
  Output: Symbol.for('output'),
  Bus: Symbol.for('bus'),
};

export const Name = {
  Resolver: 'resolver',
  LocalResolver: 'local-resolver',
  CommunityResolver: 'community-resolver',
  GitHubResolver: 'github-resolver',

  Handler: {
    ApplyPreset: 'apply-preset-handler',
    Extract: 'extract-handler',
  } as const,
};

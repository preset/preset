export const Binding = {
  Applier: Symbol.for('applier'),
  Resolver: Symbol.for('resolver'),
  Output: Symbol.for('output'),
  Bus: Symbol.for('bus'),
};

export const Name = {
  Resolver: 'resolver',
  LocalResolver: 'local-resolver',
  CommunityResolver: 'community-resolver',
  GitHubResolver: 'github-resolver',
};

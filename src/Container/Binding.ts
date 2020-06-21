const Binding = {
  Applier: Symbol.for('Applier'),
  Importer: Symbol.for('Importer'),
  Resolver: Symbol.for('Resolver'),
  Resolvers: Symbol.for('Resolvers'),
  Parser: Symbol.for('Parser'),
  Flag: Symbol.for('Flag'),
  Handler: Symbol.for('Handler'),
};

const Name = {
  Resolver: 'resolver',
  LocalResolver: 'local',
  GithubGistResolver: 'gist',
  GithubResolver: 'github',
  PresetResolver: 'preset',
  CopyHandler: 'copy',
};

const Tag = {};

export { Binding, Name, Tag };

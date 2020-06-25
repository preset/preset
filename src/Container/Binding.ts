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
  GitResolver: 'git',
  GithubResolver: 'github',
  GithubGistResolver: 'gist',
  PresetResolver: 'preset',
  CopyHandler: 'copy',
  DeleteHandler: 'delete',
  PromptHandler: 'prompt',
  EditJsonHandler: 'edit-json',
  EditHandler: 'edit',
  CustomHandler: 'custom',
};

const Tag = {};

export { Binding, Name, Tag };

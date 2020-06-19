const Binding = {
  Applier: Symbol.for('Applier'),
  Resolver: Symbol.for('Resolver'),
  Resolvers: Symbol.for('Resolvers'),
  Parser: Symbol.for('Parser'),
  Flag: Symbol.for('Flag'),
};

const Name = {
  LocalResolver: 'local-resolver',
  GithubGistResolver: 'github-gist-resolver',
  GithubResolver: 'github-resolver',
};

const Tag = {
  Resolver: 'resolver',
};

export { Binding, Name, Tag };

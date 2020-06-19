import 'reflect-metadata';
import { Container } from 'inversify';
import { ApplierContract, ResolverContract, ResolversContract, ParserContract, ImporterContract } from '@/Contracts';
import { PresetResolver, LocalResolver, GithubGistResolver, GithubResolver } from '@/Resolvers';
import { PresetApplier } from '@/Appliers';
import { GeneratorParser } from '@/Parsers';
import { EvalImporter } from '@/Importers';
import { Binding, Name } from './Binding';

/**
 * The application container.
 */
const container = new Container();

// Appliers
container.bind<ApplierContract>(Binding.Applier).to(PresetApplier);

// Parsers
container.bind<ParserContract>(Binding.Parser).to(GeneratorParser);

// Importers
container.bind<ImporterContract>(Binding.Importer).to(EvalImporter);

// Binds resolvers
container.bind<ResolverContract>(Binding.Resolver).to(LocalResolver).whenTargetNamed(Name.LocalResolver);
container.bind<ResolverContract>(Binding.Resolver).to(GithubGistResolver).whenTargetNamed(Name.GithubGistResolver);
container.bind<ResolverContract>(Binding.Resolver).to(GithubResolver).whenTargetNamed(Name.GithubResolver);

// Sets the preset resolver as the default resolver to be matched
container.bind<ResolverContract>(Binding.Resolver).to(PresetResolver).whenTargetIsDefault();

// Binds the list of resolvers
container.bind<ResolversContract>(Binding.Resolvers).toDynamicValue(() => {
  return [Name.LocalResolver, Name.GithubGistResolver, Name.GithubResolver].map(name =>
    container.getNamed<ResolverContract>(Binding.Resolver, name)
  );
});

export { container };

import 'reflect-metadata';
import { ContainerModule, Container, interfaces } from 'inversify';
import { ApplierContract, ResolverContract, ResolversContract } from '@/Contracts';
import { PresetResolver, LocalResolver, GithubGistResolver, GithubResolver } from '@/Resolvers';
import { PresetApplier } from '@/Appliers';
import { Binding, Name, Tag } from './Binding';

/**
 * The application container.
 */
const container = new Container();

// Appliers
container.bind<ApplierContract>(Binding.Applier).to(PresetApplier);

// Add resolvers to the container.
container.load(
  new ContainerModule(bind => {
    // Binds resolvers
    bind<ResolverContract>(Binding.Resolver).to(LocalResolver).whenTargetNamed(Name.LocalResolver);
    bind<ResolverContract>(Binding.Resolver).to(GithubGistResolver).whenTargetNamed(Name.GithubGistResolver);
    bind<ResolverContract>(Binding.Resolver).to(GithubResolver).whenTargetNamed(Name.GithubResolver);

    // Sets the preset resolver as the default resolver to be matched
    bind<ResolverContract>(Binding.Resolver).to(PresetResolver).whenTargetIsDefault();

    // Binds the list of resolvers
    bind<ResolversContract>(Binding.Resolvers).toDynamicValue(() => {
      return [Name.LocalResolver, Name.GithubGistResolver, Name.GithubResolver].map(name =>
        container.getNamed<ResolverContract>(Binding.Resolver, name)
      );
    });
  })
);

export { container };

import 'reflect-metadata';
import { ContainerModule, Container } from 'inversify';
import { Binding } from './Binding';
import { ApplierContract } from '../Contracts';
import { PresetApplier } from '../Appliers';

/**
 * The application container.
 */
const container = new Container();

// Appliers
container.bind<ApplierContract>(Binding.Applier).to(PresetApplier);

// Add resolvers to the container.
container.load(
  new ContainerModule(bind => {
    // bind<ResolverContract>(Bindings.Resolver).to(LocalResolver).whenTargetNamed(Name.Resolver);
    // bind<ResolverContract>(Bindings.Resolver).to(GithubGistResolver).whenTargetNamed(Name.Resolver);
    // bind<ResolverContract>(Bindings.Resolver).to(PresetResolver).whenTargetIsDefault();
    // bind<ResolversContract>(Bindings.Resolvers).toDynamicValue(({ container }) => {
    //   // @ts-expect-error
    //   return container.getAllNamed<ResolverContract>(Bindings.Resolver, Name.Resolver);
    // });
  })
);

export { container };

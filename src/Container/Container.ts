import 'reflect-metadata';
import { ContainerModule, Container, interfaces } from 'inversify';
import { ApplierContract, ResolverContract, ResolversContract } from '@/Contracts';
import { PresetResolver, LocalResolver } from '@/Resolvers';
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
    // Matches resolvers with the given name
    const matches = ({ target }: interfaces.Request, name: string) => {
      return target.name.equals(name) || target.hasTag(Tag.Resolver);
    };

    // Binds resolvers
    bind<ResolverContract>(Binding.Resolver)
      .to(LocalResolver)
      .when(request => matches(request, Name.LocalResolver));

    // Sets the preset resolver as the default resolver to be matched
    bind<ResolverContract>(Binding.Resolver).to(PresetResolver).whenTargetIsDefault();

    // Binds the list of resolvers
    bind<ResolversContract>(Binding.Resolvers).toDynamicValue(() => {
      return container.getAllTagged<ResolverContract>(Binding.Resolver, Tag.Resolver, Tag.Resolver);
    });
  })
);

export { container };

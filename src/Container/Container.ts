import 'reflect-metadata';
import { Container } from 'inversify';
import { Resolver } from '@/Resolver/Resolver';
import { Binding, Name } from '@/Container/Binding';
import { ResolverContract } from '@/Contracts/ResolverContract';
import { OutputContract } from '@/Contracts/OutputContract';
import { ConsoleOutput } from '@/IO/ConsoleOutput';
import { ApplierContract } from '@/Contracts/ApplierContract';
import { PresetApplier } from '@/Applier/PresetApplier';
import { CommunityResolver, GitHubResolver, LocalResolver } from '@/Resolver/Resolvers';
import { Bus, bus } from '@/bus';

/**
 * The application container.
 */
const container = new Container();

/*
|--------------------------------------------------------------------------
| I/O
|--------------------------------------------------------------------------
*/
container.bind<Bus>(Binding.Bus).toConstantValue(bus); // TODO: create a contract
container.bind<OutputContract>(Binding.Output).to(ConsoleOutput);

/*
|--------------------------------------------------------------------------
| Appliers
|--------------------------------------------------------------------------
*/
container.bind<ApplierContract>(Binding.Applier).to(PresetApplier);

/*
|--------------------------------------------------------------------------
| Resolvers
|--------------------------------------------------------------------------
*/
container.bind<ResolverContract>(Binding.Resolver).to(Resolver).whenTargetIsDefault();
container.bind<ResolverContract>(Binding.Resolver).to(LocalResolver).whenTargetNamed(Name.LocalResolver);
container.bind<ResolverContract>(Binding.Resolver).to(CommunityResolver).whenTargetNamed(Name.CommunityResolver);
container.bind<ResolverContract>(Binding.Resolver).to(GitHubResolver).whenTargetNamed(Name.GitHubResolver);

export { container };

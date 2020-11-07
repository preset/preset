import 'reflect-metadata';
import { Container } from 'inversify';
import { Resolver } from '@/Resolver/Resolver';
import { Binding, Name } from '@/Container/Binding';
import { ResolverContract } from '@/Contracts/ResolverContract';
import { OutputContract } from '@/Contracts/OutputContract';
import { ConsoleOutput } from '@/IO/ConsoleOutput';
import { ApplierContract } from '@/Contracts/ApplierContract';
import { PresetApplier } from '@/Applier/PresetApplier';

/**
 * The application container.
 */
const container = new Container();

/*
|--------------------------------------------------------------------------
| I/O
|--------------------------------------------------------------------------
*/
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
container.bind<ResolverContract>(Binding.Resolver).to(Resolver);

export { container };

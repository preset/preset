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
import { ImporterContract } from '@/Contracts/ImporterContract';
import { ModuleImporter } from '@/Importer/ModuleImporter';
import { HandlerContract } from '@/Contracts/HandlerContract';
import { Preset } from '@/Configuration/Preset';
import { Prompt, CustomPrompt } from '@/prompt';
import { Bus, bus } from '@/bus';
import {
  ExtractHandler,
  ApplyPresetHandler,
  ExecuteHandler,
  InstallDependenciesHandler,
  PromptHandler,
  DeleteHandler,
  EditJsonHandler,
  EditEnvHandler,
} from '@/Handlers';

/**
 * The application container.
 */
const container = new Container();

// Preset
container.bind<Preset>(Binding.Preset).toConstantValue(new Preset());

// I/O
container.bind<Bus>(Binding.Bus).toConstantValue(bus);
container.bind<Prompt>(Binding.Prompt).toConstantValue(new CustomPrompt());
container.bind<OutputContract>(Binding.Output).to(ConsoleOutput);

// Appliers
container.bind<ApplierContract>(Binding.Applier).to(PresetApplier);

// Resolvers
container.bind<ResolverContract>(Binding.Resolver).to(Resolver).whenTargetIsDefault();
container.bind<ResolverContract>(Binding.Resolver).to(LocalResolver).whenTargetNamed(Name.LocalResolver);
container.bind<ResolverContract>(Binding.Resolver).to(CommunityResolver).whenTargetNamed(Name.CommunityResolver);
container.bind<ResolverContract>(Binding.Resolver).to(GitHubResolver).whenTargetNamed(Name.GitHubResolver);

// Importers
container.bind<ImporterContract>(Binding.Importer).to(ModuleImporter).whenTargetIsDefault();

// Handlers
container.bind<HandlerContract>(Binding.Handler).to(ApplyPresetHandler).whenTargetNamed(Name.Handler.ApplyPreset);
container.bind<HandlerContract>(Binding.Handler).to(ExtractHandler).whenTargetNamed(Name.Handler.Extract);
container.bind<HandlerContract>(Binding.Handler).to(ExecuteHandler).whenTargetNamed(Name.Handler.Execute);
container.bind<HandlerContract>(Binding.Handler).to(InstallDependenciesHandler).whenTargetNamed(Name.Handler.InstallDependencies);
container.bind<HandlerContract>(Binding.Handler).to(PromptHandler).whenTargetNamed(Name.Handler.Prompt);
container.bind<HandlerContract>(Binding.Handler).to(DeleteHandler).whenTargetNamed(Name.Handler.Delete);
container.bind<HandlerContract>(Binding.Handler).to(EditJsonHandler).whenTargetNamed(Name.Handler.EditJson);
container.bind<HandlerContract>(Binding.Handler).to(EditEnvHandler).whenTargetNamed(Name.Handler.EditEnv);

export { container };

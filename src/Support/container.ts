import { Container } from 'inversify';
import {
  ApplyPresetHandler,
  Binding,
  bus,
  ConsoleOutput,
  CustomPrompt,
  DeleteHandler,
  EditEnvHandler,
  EditHandler,
  EditJsonHandler,
  ExecuteHandler,
  ExtractHandler,
  GroupHandler,
  HookHandler,
  InstallDependenciesHandler,
  DefaultResolver,
  DiskLocator,
  GitLocator,
  ModuleImporter,
  Name,
  PresetApplier,
  PromptHandler,
} from '@/exports';

/**
 * The application container.
 */
const container = new Container();

// I/O
container.bind(Binding.Bus).toConstantValue(bus);
container.bind(Binding.Prompt).toConstantValue(new CustomPrompt());
container.bind(Binding.Output).to(ConsoleOutput);

// Appliers
container.bind(Binding.Applier).to(PresetApplier);

// Resolvers
container.bind(Binding.Resolver).to(DefaultResolver).whenTargetIsDefault();
container.bind(Binding.Locator).to(DiskLocator).whenTargetNamed(Name.DiskLocator);
container.bind(Binding.Locator).to(GitLocator).whenTargetNamed(Name.GitLocator);

// Importers
container.bind(Binding.Importer).to(ModuleImporter).whenTargetIsDefault();

// Handlers
container.bind(Binding.Handler).to(ApplyPresetHandler).whenTargetNamed(Name.Handler.ApplyPreset);
container.bind(Binding.Handler).to(ExtractHandler).whenTargetNamed(Name.Handler.Extract);
container.bind(Binding.Handler).to(ExecuteHandler).whenTargetNamed(Name.Handler.Execute);
container.bind(Binding.Handler).to(InstallDependenciesHandler).whenTargetNamed(Name.Handler.InstallDependencies);
container.bind(Binding.Handler).to(PromptHandler).whenTargetNamed(Name.Handler.Prompt);
container.bind(Binding.Handler).to(DeleteHandler).whenTargetNamed(Name.Handler.Delete);
container.bind(Binding.Handler).to(EditJsonHandler).whenTargetNamed(Name.Handler.EditJson);
container.bind(Binding.Handler).to(EditEnvHandler).whenTargetNamed(Name.Handler.EditEnv);
container.bind(Binding.Handler).to(EditHandler).whenTargetNamed(Name.Handler.Edit);
container.bind(Binding.Handler).to(GroupHandler).whenTargetNamed(Name.Handler.Group);
container.bind(Binding.Handler).to(HookHandler).whenTargetNamed(Name.Handler.Hook);

export { container };

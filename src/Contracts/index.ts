export * from './CommandLineInterfaceContract';
export * from './ApplierContract';
export * from './ResolverContract';
export * from './ResolversContract';
export * from './ParserContract';
export * from './ContextContract';
export * from './GeneratorContract';
export * from './ImporterContract';
export * from './ActionHandlerContract';
export * from './Actions';
export * from './TaskContract';

export type ParsedArgumentList = ReadonlyArray<string>;
export type ParsedFlagObject = {
  [k: string]: any;
};

export interface ParsedArguments {
  args: ParsedArgumentList;
  options: ParsedFlagObject;
}

export interface ParseOption {
  name: string;
  default?: string | boolean;
}

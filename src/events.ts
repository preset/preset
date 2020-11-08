import { createEventDefinition, EventBus } from 'ts-bus';
import { CommandLineInterfaceParameter, CommandLineInterfaceOption } from './Contracts/OutputContract';

export const resolveStarted = createEventDefinition<{ resolvable?: string }>()('resolver:started');

export const outputVersion = createEventDefinition()('output:version');
export const outputHelp = createEventDefinition<{
  parameters: CommandLineInterfaceParameter[];
  options: CommandLineInterfaceOption[];
}>()('output:help');
export const log = createEventDefinition<{
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  content: any;
}>()('output:message');

export const bus = new EventBus();

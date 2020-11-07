import { createEventDefinition, EventBus } from 'ts-bus';

export const resolveStarted = createEventDefinition<{
  resolvable?: string;
}>()('resolver:started');

export const bus = new EventBus();

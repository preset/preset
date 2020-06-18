import {
  CopyActionContract,
  DeleteActionContract,
  UpdateJsonFileActionContract,
  PromptActionContract,
} from './Contracts';

export type Action = CopyActionContract | DeleteActionContract | UpdateJsonFileActionContract | PromptActionContract;

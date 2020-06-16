import { CopyActionContract, DeleteActionContract, UpdateJsonFileActionContract } from './Contracts';

export type Action = CopyActionContract | DeleteActionContract | UpdateJsonFileActionContract;

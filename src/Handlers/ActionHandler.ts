import { container } from '@/Container';
import { injectable } from 'inversify';

// Contracts/Actions/CopyActionContract

// Contracts/ActionContract.ts
// type ActionContract = CopyActionContract;

// Handlers/CopyActionHandler.ts

// // in applier
// function handle(action: ActionContract) {
//   const handler = container.getNamed<ActionHandlerContract<any>>('Binding.Action', action.type);
// }

// // in container
// container
//   .bind<ActionHandlerContract<'copy'>>('Binding.Action')
//   .to(CopyActionHandler)
//   .whenTargetNamed('Name.CopyActionContract'); // Name.CopyActionContract = action.type = 'copy'

import { container, Binding } from '@/Container';
import { ImporterContract, GeneratorContract, ContextContract } from '@/Contracts';
import { stubs } from '../constants';
import path from 'path';

it('imports an empty preset', async () => {
  const importer = container.get<ImporterContract>(Binding.Importer);
  const generator = await importer.import(path.join(stubs.emptyActionList, 'preset.js'));

  expect(generator).not.toBe(false);

  const actions = await (<GeneratorContract>generator).actions({} as ContextContract);
  expect(actions.length).toBe(0);
});

it.todo('should be further tested');

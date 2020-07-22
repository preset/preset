export * from './CopyActionHandler';
export * from './DeleteActionHandler';
export * from './PromptActionHandler';
export * from './EditJsonActionHandler';
export * from './CustomActionHandler';
export * from './EditActionHandler';
export * from './PresetActionHandler';

export function contextualize<T extends { [key: string]: any }>(action: T, context: any): T {
  const result = Object.entries(action)
    .map(([name, value]) => {
      if (!!(value && value.constructor && value.call && value.apply)) {
        return { [name]: value(context) };
      }
      return { [name]: value };
    })
    .reduce((acc, val) => ({ ...acc, ...val }));

  return result as T;
}

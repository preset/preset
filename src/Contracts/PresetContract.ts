import { Preset } from '@/exports';

export interface PresetContract {}

export type PresetAware<T = any, K = any> = (preset: Preset<K>) => T;
export type ContextAware<T, K = any> = T | PresetAware<T, K>;

export type Contextualized<T> = { [k in keyof T]: ContextualizedProperty<T[k]> };
export type ContextualizedProperty<T> = T extends ContextAware<infer U> ? U : T;

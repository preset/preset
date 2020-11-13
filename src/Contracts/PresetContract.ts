import { Preset } from '@/exports';

export interface PresetContract {}

export type PresetAware<T = any> = (preset: Preset) => T;
export type ContextAware<T> = T | PresetAware<T>;

export type Contextualized<T> = { [k in keyof T]: ContextualizedProperty<T[k]> };
export type ContextualizedProperty<T> = T extends ContextAware<infer U> ? U : T;

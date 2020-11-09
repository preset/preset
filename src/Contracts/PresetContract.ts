import { Preset } from '@/Configuration/Preset';

export interface PresetContract {}

export type ContextAware<T> = T | ((preset: Preset) => T);

import { Preset } from '@/api';

Preset.option('extract', true);
Preset.extract().ifHasOption('extract');

const { Preset } = require('use-preset');
const { flags } = require('@oclif/parser');

const test = flags.boolean({ char: 't ' });

module.exports = Preset.make({
  name: 'preset',
  actions: () => [],
});

const { Preset } = require('../../../src');

module.exports = Preset.make({
  actions: () => [
    {
      type: 'copy',
    },
  ],
});

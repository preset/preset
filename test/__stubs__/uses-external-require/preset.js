const { Preset } = require('use-preset');
const dep = require('some-external-dependency');

module.exports = Preset.make({
  name: 'preset',
  actions: () => [],
});

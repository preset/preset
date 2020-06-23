const { Preset } = require('use-preset');

module.exports = Preset.make({
  name: 'preset',
  actions: () => [
    {
      type: 'edit-json',
      file: 'composer.json',
      merge: {
        'require-dev': {
          'phpunit/phpunit': '^8',
        },
      },
    },
  ],
});

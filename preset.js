const { Preset, flags } = require('./src');

module.exports = Preset.make({
  parse: () => ({
    flags: {
      auth: flags.boolean({ char: 'f' }),
    },
    args: [
      {
        name: 'input',
        required: true,
      },
    ],
  }),
});

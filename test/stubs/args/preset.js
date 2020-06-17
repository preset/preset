const { flags } = require('@oclif/parser');

module.exports = {
  parse: () => ({
    flags: {
      auth: flags.boolean({ char: 'a' }),
    },
    args: [
      {
        name: 'input',
        required: true,
      },
    ],
  }),
  actions: () => [
    {
      type: 'copy',
    },
  ],
};

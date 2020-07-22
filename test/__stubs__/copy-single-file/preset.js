module.exports = {
  actions: async () => [
    { type: 'copy', files: 'hello.txt' },
    {
      type: 'copy',
      if: context => {
        return context.argv[0] === '--copy-flag';
      },
      files: 'copy-flag.txt',
    },
  ],
};

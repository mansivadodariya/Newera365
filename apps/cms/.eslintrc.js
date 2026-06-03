const base = require('@newera365/config/eslint-preset');

module.exports = {
  ...base,
  overrides: [
    ...(base.overrides ?? []),
    {
      // Plain Node.js scripts use CommonJS require() — suppress TS rule for .js files
      files: ['src/scripts/*.js'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
};
